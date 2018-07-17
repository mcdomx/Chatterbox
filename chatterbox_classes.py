class Channel:

    max_posts = 100;
    all_channels = []  # class variable to hold list of all channels

    def __init__(self, name, owner):
        self.name = name
        self.owner = owner
        # add new channel to list of channels
        self.__class__.all_channels.append(self)
        all_posts = []  # instanace variable to hold list of channel posts

    def add_post(post):
        self.all_posts.append(post)

    def emit_channel(self):
        return self.jsonify()



class Post():
    def __init__(self, channel, user_name, user_post):
        self.user_name = user_name
        self.user_post = user_post
        self.post_time = datetime.datetime.now()
        channel.add_post(self)
