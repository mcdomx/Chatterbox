# CLASS DEFINITIONS FOR CHAT APPLICATION
# Display_names: Holds all name of chat users
# Channel: Chat Channel.  Includes getter and setter functions.



from flask import jsonify
from flask_socketio import SocketIO, emit

# CLASS DEFINITIONS

# class to manage display name of all users
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


# class to manage all functions of channels from the server side
class Channel:

    # max number of posts held on server side.
    max_posts = 100;

    # hols dictionary of all channels created
    channels = {} # dict{"ch_name": ch_object}

    def __init__(self, name, owner):
        self.name = name
        self.owner = owner
        self.last_post = 0
        self.all_posts = []  # instanace var to hold ordered list of post objects
        Channel.channels[self.name] = self # add channel to class-level list

    def add_post(self, post):
        self.all_posts.append(post)
        self.last_post = post.time
        if len(self.all_posts) > Channel.max_posts:
            self.all_posts.pop(0)
        # emit the number of posts and the time of the last post

    def get_posts(self):
        return self.all_posts

    def get_channel(ch_name):
        return Channel.channels[ch_name]

    def get_channels():
        return Channel.channels

    def get_numposts(ch_name):
        return len(Channel.channels[ch_name].all_posts)

    def jsonify_channels():
        ch_dict = {}
        # TODO: If no channels exist - give appropriate reponse -- or make a general channel

        for ch_name, ch_obj in Channel.get_channels().items():
            if ch_name == None:
                continue
            ch_dict[ch_name] = {'owner': ch_obj.owner,
                                'last_post': ch_obj.last_post,
                                'num_posts': Channel.get_numposts(ch_name)}

        return jsonify(ch_dict)

    #returns all channel posts in JSON format. Used for emit to clients.
    def jsonify_posts(ch_name):
        all_posts = Channel.get_channel(ch_name).get_posts()
        post_dict = [] # ordered list of dictionary objects

        for post in all_posts:
            post_dict.append(Post.get_post_dict(post, ch_name))

        return jsonify(post_dict)

    # broadcast channel data
    def emit_channel(ch_name):
        ch_dict = {}
        ch = Channel.get_channel(ch_name)
        ch_dict = { 'name': ch_name,
                    'owner': ch.owner,
                    'last_post': ch.last_post,
                    'num_posts': Channel.get_numposts(ch_name)}
        emit("add_new_channel", ch_dict, broadcast=True)

    # return True if channel name already exists; False if name does not exist
    def exists(ch_name):
        if ch_name in Channel.channels:
            return True
        else:
            return False

    # return epoch time of last post to channel
    def get_lastpost_time(ch_name):
        ch = get_channel(ch_name)
        return ch.last_post


# class for the structre of a post
class Post():
    def __init__(self, post_ch, txt, user, time):
        self.txt = txt
        self.user = user
        self.time = time

        # get the channel that the post will be added to
        channel = Channel.get_channel(post_ch)

        # add the post to the channel is belongs to
        channel.add_post(self)

    # return a dictionary object of relevant post data that will be broadcast
    def get_post_dict(self, ch_name):
        return {"ch_name": ch_name, "txt": self.txt, "user": self.user, "time": self.time, "num_posts": Channel.get_numposts(ch_name)}


# END CLASS DEFINITIONS
