# Project 2
Chatterbox

## Summary
This application is a chat platform where users can quickly setup an alias to begin sharing comments.  Any user can setup a channel where any user can readily jump in to and submit comments.  Once a channel is created, it cannot be deleted.  

Upon the user's first visit, the user is asked to provide a display name.  Once a user's "display name" is set, it cannot be changed.  No password is required.  User names must be unique.  After a name is set, the user can submit comments to existing channels or add a channel where comments can be seen and submitted by any user of the site.  New users are unable to submit posts to channels until they create a display name.  Channel names must be unique, cannot start with a number and must be less than 13 characters long.  New channels can be submitted by clicking the adjacent button or hitting the enter key.  New channels are added to the top of the list of channels.

When visiting a channel, the user's posts are displayed on the right side of the chat window while other users' comments are shown on the left side of the chat window.  When a new comment of the active channel is posted, the chat window header is updated with the number of posts in the channel as well as the time of the last post.  When any channel receives a new post (whether it is the active channel or not), the channel card in the left column will pulse briefly and the number of posts and time of the last post will be updated.  This indicates to the user that some other channel has received a post that may be worth reviewing.  New posts can be submitted by clicking the adjacent button or hitting the enter key.

New posts adjust the chat window so the newest post is always displayed at the bottom of the window.  If chats exceed the window size, the window will scroll.  When channels exceed the size of the vertical column holding the chats, they will also be in a scroll window.

The user can change a channel by clicking the respective channel card in the left column.  


## Data Structures
### Client-side
On the client, two variables are used and stored.  "display_name" stores the user's display name and "active_channel" stores the name of the channel currently being visited.

### Server-side
Server side data is supported using three classes: Display_names, Channel and Post.  The Python side of this site heavily relies on the methods supported by these classes to do the server-side work of the application.
### Display_names
New users are tracked in instance variables of the Display_names class.  A class-level variable stores a list of all user display names that have been created.  Upon initialization, the new object will add itself to the class-level variable that stores all user names.  One method is used to to test if a user name already exists or not.

#### Channel (name, owner)
New channel objects are initialized with a name and an owner.  The Channel class holds a class-level dictionary of all existing channels.  Each channel object is initialized with a name and owner and also sets up a variable to hold the time of the last post as well as an ordered list of Post objects which represent all the posts to the channel.  Upon initialization, the new channel will add itself to the list of all channels stored in the class-level variable that holds all channels.

The channel class offers several methods which get and set data as well as methods to prepare data to be emitted to clients using socket communications.

#### Post (channel, text, user, time)
Instances of Post objects are stored in their respective channel's list of chat messages.  Each Post is initialized with the text of the message, the user's display_name and the time of the post in epoch format.  The Post class supports a single method to put the post's data into a dictionary object which can be used to broadcast data using socket io.
