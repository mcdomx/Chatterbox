# Project 2
Chatterbox

## Summary
This application is a chat platform where users can quickly setup an alias to begin sharing comments.  Any user can setup a channel where any user can readily jump in and submit comments.   

Upon the user's first visit, the user is asked to provide a display name.  Once a user's "display name" is set, it cannot be changed.  No password is required.  User names must be unique.  After a display name is set, the user can submit comments to existing channels or add a channel where comments can be seen and submitted by any user of the site.  Visitors are unable to submit posts to channels until they create a display name.  Channel names must be unique, cannot start with a number and must be less than 13 characters long.  New channels can be submitted by clicking the 'Add button or hitting the enter key.  New channels are added to the top of the list of channels.  Once a channel is created, it cannot be deleted.

When visiting a channel, the user's posts are displayed on the right side of the chat window while other users' comments are shown on the left side of the chat window.  When a new comment of the active channel is posted, the chat window header is updated with the number of posts in the channel as well as the time of the last post.  When any channel receives a new post (whether it is the active channel or not), the channel card in the left column will pulse briefly and the number of posts and time of the last post will be updated.  This indicates to the user that some other channel has received a post that may be worth reviewing.  New posts can be submitted by clicking the 'Post' button or hitting the enter key.

New posts adjust the chat window so the newest post is always displayed at the bottom of the window.  If chats exceed the window size, the window will scroll.  When channels exceed the size of the vertical column holding the chats, they will also be in a scroll window.  Only 100 messages are stored on the server for any channel.  

The user can change a channel by clicking the respective channel card in the left column.


## Improvements
Because a database is not being used, the integrity of data depends on Flask remaining up-and-running.  Once Flask stops, the application will not act as intended.  As this was not clarified as a requirement, I made little effort to account for anomalies that happen when Flask restarts (e.g - a user's display could be re-added by someone else, the user's active channel no longer exists, etc.).  

The layout is not as responsive to changes in the window size as I would prefer.  I used bootstrap to do much of the design and struggled to get the chat window to resize instead of jumping to a second row of display elements.  As a result, the user needs to use a reasonable window width to see the app reasonably.

I would like to have moved some of the javascript to another file, but the options seemed complex or not universally supported, so I left all the javascript in a single file. (sorry for that. I know it's hard to read in one file.)

## Personal Touch
As a personal touch, I added animations:
- newly added channels slide into place at the top of the channel listing
- the active channel pulses mildly in the channel listing on the left
- new messages received by any channel cause the channel card to flash briefly
- new messages on the active channel fade in and flash briefly to highlight their arrival


## Data Structures
### Client-side
On the client, two variables are used and stored.  "display_name" stores the user's display name and "active_channel" stores the name of the channel currently being visited.

### Server-side
Server side data is supported using three classes: Display_names, Channel and Post.  The Python side of this site heavily relies on the methods supported by these classes to do the server-side work of the application.  These classes are in the classes.py file.

#### Display_names
New users are tracked in instance variables of the Display_names class.  A class-level variable stores a list of all user display names that have been created.  Upon initialization, the new object will add itself to the class-level variable that stores all user names.  One method is used to to test if a user name already exists or not.

#### Channel (name, owner)
New channel objects are initialized with a name and an owner.  The Channel class holds a class-level dictionary of all existing channels.  Each channel object is initialized with a name and owner and also sets up a variable to hold the time of the last post as well as an ordered list of Post objects which represent all the posts to the channel.  Upon initialization, the new channel will add itself to the list of all channels stored in the class-level variable that holds all channels.

The channel class offers several methods which get and set data as well as methods to prepare data to be emitted to clients using socket communications.

Note: The process for adding a channel ensures that a duplicate channel name is not created.  When the client checks if the name exists, a channel is created on the server immediately if the name is available.  The server then communicates back to the client that the channel was successfully added.  At this point, the client will emit a new channel request to the server and the server will broadcast the new server.  This process may seem cumbersome, but is necessary to ensure that a duplicate channel name is not created.

#### Post (channel, text, user, time)
Instances of Post objects are stored in their respective channel's list of chat messages.  Each Post is initialized with the text of the message, the user's display_name and the time of the post in epoch format.  The Post class supports a single method to put the post's data into a dictionary object which can be used to broadcast data using socket io.
