import os
import datetime
import requests, json

from flask import Flask, session, jsonify, render_template, request
from flask_session import Session
from flask_socketio import SocketIO, emit

# CLASS DEFINITIONS
class Display_names:
    all_names = []

    def __init__(self, name):
        self.name = name
        self.__class__.all_names.append(self.name)

    def exists(name):
        if name in Display_names.all_names:
            return True
        else:
            return False


class Channel:

    max_posts = 100;
    all_channels = {}  # class variable to hold dict of all channel names and owners

    # TODO: Create a list that holds all the channel objects
    # TODO: try to eliminate the use of all_channel and user channel_list instead
    channels = {} # dict{"ch_name": ch_object}

    def __init__(self, name, owner):
        self.name = name
        self.owner = owner
        self.last_post = 0
        # add new channel to list of channels
        self.__class__.all_channels[self.name] = {'ch_owner': self.owner, 'last_post': 0}
        Channel.channels[self.name] = self
        self.all_posts = []  # instanace variable to hold ordered list of post objects

    def add_post(self, post):
        self.all_posts.append(post)
        if len(self.all_posts) > Channel.max_posts:
            self.all_posts.pop[0]

    def get_posts(self):
        return self.all_posts

    def get_channel(ch_name):
        return Channel.channels[ch_name]

    def get_channels():
        return Channel.channels

    def jsonify_channels():
        channel_dict = {}
        # TODO: If no channels exist - give appropriate reponse

        for ch_name, ch_obj in Channel.get_channels().items():
            if ch_name == None:
                continue
            channel_dict[ch_name] = {'owner': ch_obj.owner, 'last_post': ch_obj.last_post}


        return jsonify(channel_dict)

    def jsonify_posts(ch_name):
        all_posts = Channel.get_channel(ch_name).get_posts()
        post_dict = [] # this will be an ordered list of dictiorary objects

        for post in all_posts:
            post_dict.append(Post.get_post_dict(post))

        return jsonify(post_dict)


    #create channel broadcast data and emit it
    def emit_channel(ch_name):
        ch_dict = {}
        ch = Channel.get_channel(ch_name)
        ch_dict = {"ch_name": ch.name, "ch_owner": ch.owner, "last_post": ch.last_post}
        emit("add_new_channel", ch_dict, broadcast=True)

    # return True if channel name already exists; False if name does not exist
    def exists(ch_name):
        if ch_name in Channel.all_channels:
            return True
        else:
            return False


class Post():
    def __init__(self, post_ch, txt, user, time):
        self.txt = txt
        self.user = user
        self.time = time

        # get the channel that the post will be added to
        channel = Channel.get_channel(post_ch)
        channel.add_post(self)

    def get_post_dict(self):
        return {"txt": self.txt, "user": self.user, "time": self.time}





# END CLASS DEFINITIONS




app = Flask(__name__)

# Check for environment variables
# if not os.getenv("DATABASE_URL"):
#     raise RuntimeError("-- Environment variable DATABASE_URL is not set")

if not os.getenv("FLASK_APP"):
    raise RuntimeError("-- Environment variable FLASK_APP is not set")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

socketio = SocketIO(app)
Session(app)


# TODO: ERASE THIS BEFORE SUBMISSION
# TESTING AND DEVELOPMENT
Channel("cycling", "Mark")
Channel("bed bugs", "Cindy")
ch1 = Channel.get_channel("cycling")
ch2 = Channel.get_channel("bed bugs")

post1 = Post(ch1.name, "This is my first post!", "Gerald", 0)
post2 = Post(ch1.name, "This is crazy stuff!", "Betty", 0)
post3 = Post(ch1.name, "Did you know the sky was blue?", "Gerald", 0)
post4 = Post(ch1.name, "Blue!  I've never left the basement since I was a small child.", "Dizzy", 0)

post1 = Post(ch2.name, "My legs are itching.", "Sparky", 0)
post2 = Post(ch2.name, "Do you have alergies?", "Jenny", 0)
post3 = Post(ch2.name, "Spider bites?", "Gerald", 0)
post4 = Post(ch2.name, "I am an expert on itchy legs.  You have bed bugs!", "Dr. No", 0)
post5 = Post(ch2.name, "Please stop making staements you know nothing about!", "Dr. No", 0)


# for ch_name, ch_obj in Channel.get_channels().items():
#     print(f"Channel: {ch_name}")
#     print(f"    Posts:")
#     for post in ch_obj.get_posts():
#         print(f"        User: {post.user}   Msg: {post.txt}")




# END TESTING AND DEVELOPMENT



@app.route("/")
def index():
    return render_template("index.html")


# add new name
@app.route("/add_newname", methods=["POST"])
def add_newname():
    new_name = request.form.get("new_name")

    if (Display_names.exists(new_name)):
        # return error
        return jsonify({"success": False})
    else:
        # add name and return success
        Display_names(new_name)
        return jsonify({"success": True})



# emit new channel
@socketio.on("emit_channel")
def emit_channel(ch_name):
    Channel.emit_channel(ch_name);


# emit new channel
@socketio.on("add_post")
def add_post(post_ch, post_txt, post_user, post_time):
    new_post = Post(post_ch, post_txt, post_user, post_time);
    emit("add_new_post", new_post.get_post_dict(), broadcast=True);


# add new channel -- this will not emit it
# adding channel as soon as it is confirmed will avoid
# the possibility that a second request for the same name
# is approved and added before the emit-on process is completed.
@app.route("/add_channel", methods=["POST"])
def add_channel():
    ch_name = request.form.get("new_ch")

    if (Channel.exists(ch_name)):
        # channel exists, return error
        return jsonify({"success": False})
    else:
        # add channel and return success
        owner =  request.form.get("ch_owner")
        new_channel = Channel(ch_name, owner) # create new channel object
        return jsonify({"success": True})


@app.route("/get_posts", methods=["POST"])
def add_posts():

    ch_name = request.form.get("ch_name")

    if Channel.exists(ch_name):
        return Channel.jsonify_posts(ch_name)
    else:
        return jsonify({"error": True})



@app.route("/get_channels")
def get_channels():
    return Channel.jsonify_channels()
