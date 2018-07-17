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

    def __init__(self, name, owner):
        self.name = name
        self.owner = owner
        # add new channel to list of channels
        self.__class__.all_channels[self.name] = {'ch_owner': self.owner, 'last_post': 0}
        all_posts = []  # instanace variable to hold ordered list of channel posts


    def add_post(self, post):
        self.all_posts.append(post)

    def jsonify_channels():
        channel_dict = {}
        # TODO: If no channels exist - give appropriate reponse
        for channel in Channel.all_channels:
            channel_dict[channel] = Channel.all_channels[channel]
        return jsonify(channel_dict)

    #create channel broadcast data and emit it
    def emit_channel(ch_name):
        channel_dict = {}
        channel_dict = {"ch_name": ch_name, "ch_owner": Channel.all_channels[ch_name]["ch_owner"], "last_post": Channel.all_channels[ch_name]["last_post"]}
        emit("add_new_channel", channel_dict, broadcast=True)

    # return True if channel name already exists; False if name does not exist
    def exists(channel_name):
        if channel_name in Channel.all_channels:
            return True
        else:
            return False


class Post():
    def __init__(self, channel, user_name, user_post):
        self.user_name = user_name
        self.user_post = user_post
        self.post_time = datetime.datetime.now()
        channel.add_post(self)

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

# list of all channels
channel_list = ['general']

# TESTING AND DEVELOPMENT
Channel("cycling", "Mark")
Channel("bed bugs", "Cindy")
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
        # TODO: remove test owner data
        return jsonify({"success": True, "owner": owner})


@app.route("/get_channels")
def get_channels():
    return Channel.jsonify_channels()
