import os
import time
import requests, json

from flask import Flask, session, jsonify, render_template, request
from flask_session import Session
from flask_socketio import SocketIO, emit

from classes import Display_names, Channel, Post


app = Flask(__name__)

# Check for environment variables
if not os.getenv("FLASK_APP"):
    raise RuntimeError("-- Environment variable FLASK_APP is not set")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

# app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

socketio = SocketIO(app)
Session(app)

# create a 'general' channel so at least one channel exists
Channel("general", "chatterbox admin")


# ROUTES ###############################################

@app.route("/")
def index():
    return render_template("index.html")

# add new name
@app.route("/add_newname", methods=["POST"])
def add_newname():
    new_name = request.form.get("new_name")

    if (Display_names.exists(new_name)):
        # return error
        return jsonify({"exists": True})
    else:
        # add name and return success
        Display_names(new_name)
        return jsonify({"exists": False})

# add new channel -- this will not emit it
# adding channel as soon as it is confirmed will avoid
# the possibility that a second request for the same name
# is approved and added before the emit-on process is completed.
# @app.route("/add_channel", methods=["POST"])
# def add_channel():
#     ch_name = request.form.get("new_ch")
#
#     if (Channel.exists(ch_name)):
#         # channel exists, return False
#         return jsonify({"success": False})
#     else:
#         # add channel and return success
#         owner =  request.form.get("ch_owner")
#         new_channel = Channel(ch_name, owner) # create new channel object
#         return jsonify({"success": True})


# add channel if it doesn't already exist
# client will emit channel with a True response
@app.route("/add_channel", methods=["POST"])
def channel_exists():
    ch_name = request.form.get("channel")
    ch_owner = request.form.get("ch_owner")

    if (Channel.exists(ch_name)):
        return jsonify({"success": False})
    else:
        Channel(ch_name, ch_owner) # create new channel object
        return jsonify({"success": True})



# called by client to load posts in a channel
@app.route("/get_posts", methods=["POST"])
def add_posts():

    ch_name = request.form.get("ch_name")

    if Channel.exists(ch_name):
        return Channel.jsonify_posts(ch_name)
    else:
        return jsonify({"error": True})

# called by client that needs to load the channel list
@app.route("/get_channels")
def get_channels():
    return Channel.jsonify_channels()

# END ROUTES ###############################################


# SOCKETS ###############################################

# emit new channel
@socketio.on("new_channel")
def new_channel(ch_name):
    Channel.emit_channel(ch_name);

# emit new channel
@socketio.on("add_post")
def add_post(post_ch, post_txt, post_user, post_time):
    new_post = Post(post_ch, post_txt, post_user, post_time);
    emit("add_new_post", new_post.get_post_dict(post_ch), broadcast=True);

# END SOCKETS ###############################################
