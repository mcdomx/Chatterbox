import os
import datetime
import requests, json

from flask import Flask, session, jsonify, render_template, request
from flask_session import Session
from flask_socketio import SocketIO, emit

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

@app.route("/")
def index():
    return render_template("index.html", message="No message")
