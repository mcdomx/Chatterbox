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

    def jsonify_channel(self):
        channel_dict = {}
        channel_dict[self.name] = Channel.all_channels[self.name]
        return jsonify(channel_dict)

    def emit_channel(self):
        emit_data = self.jsonify_channel();
        # emit_data = {'billy idol':{'ch_owner':"Mark", 'last_post': 0}};
        emit("add_new_channel", emit_data, broadcast=True)

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


# add new channel
@app.route("/add_channel", methods=["POST"])
def add_channel():
    new_ch = request.form.get("new_ch")

    if (Channel.exists(new_ch)):
        # return error
        return jsonify({"success": False})
    else:
        # add channel and return success
        ch_owner =  request.form.get("ch_owner")
        new_channel = Channel(new_ch, ch_owner) # create new channel object
        new_channel.emit_channel() # emit the new channel to all clients
        return jsonify({"success": True})



@app.route("/get_channels")
def get_channels():
    return Channel.jsonify_channels()
