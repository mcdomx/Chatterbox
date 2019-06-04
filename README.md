# Chtterbox
Barebones web-chat with no fuss.

## Summary
This application is a chat platform where users can quickly setup an alias to begin sharing comments.  Any user can setup a channel where any user can readily jump in and submit comments.   

Upon the user's first visit, the user is asked to provide a display name.  Once a user's "display name" is set, it cannot be changed.  No password is required.  User names must be unique.  After a display name is set, the user can submit comments to existing channels or add a channel where comments can be seen and submitted by any user of the site.  Visitors are unable to submit posts to channels until they create a display name.  Channel names must be unique, cannot start with a number and must be less than 13 characters long.  New channels can be submitted by clicking the 'Add button or hitting the enter key.  New channels are added to the top of the list of channels.  Once a channel is created, it cannot be deleted.

When visiting a channel, the user's posts are displayed on the right side of the chat window while other users' comments are shown on the left side of the chat window.  When a new comment of the active channel is posted, the chat window header is updated with the number of posts in the channel as well as the time of the last post.  When any channel receives a new post (whether it is the active channel or not), the channel card in the left column will pulse briefly and the number of posts and time of the last post will be updated.  This indicates to the user that some other channel has received a post that may be worth reviewing.  New posts can be submitted by clicking the 'Post' button or hitting the enter key.

New posts adjust the chat window so the newest post is always displayed at the bottom of the window.  If chats exceed the window size, the window will scroll.  When channels exceed the size of the vertical column holding the chats, they will also be in a scroll window.  Only 100 messages are stored on the server for any channel.  

The user can change to a different channel by clicking the respective channel card in the left column.

## Docker Build and Run
The application can be run in a docker container.  This is preferred to isolate the program from the target operating environment.

The image should be build using:
        <code>docker build -t chatterbox .</code>
Alternatively, the image can be built using the --no-cache option to ensure new requirements are installed:
        <code>docker build --no-cache -t chatterbox .</code>
        
The image is built on a <code>python:3.6-slim-stretch</code> os image.  When the image is built, respective Flask environment variables are set and necessary depedencies are added.  

To run the application from Docker:
        <code>docker run -d -p 5000:5000 --name chatterbox chatterbox</code>

The application will be available on port 5000:
        <a href="http://http://127.0.0.1:5000">http://127.0.0.1:5000</a>

To enter the command line for the application <optional>:
    <code>docker exec -it chatterbox bash</code>

To stop the Docker container and terminate the application:
    <code>docker kill chatterbox</code>
    
To re-run the application, launch without the --name option:
    <code>docker run -d -p 5000:5000 chatterbox</code>
    
To run the application on a different local port (e.g: 8080):
    <code>docker run -d -p 8080:5000 chatterbox</code>

To remove the container:
    <code>docker rm chatterbox</code>
    
To delete the image:
    <code>docker rmi chatterbox</code>


## Limitations / Future Improvements
The database is not persistent.  All data is lost when the Flask server is terminated.

The layout is not mobile-first and not responsive the the full scope of user window adjustments.

The application is not scaled and relies on a single instance.  

No security is implemented.  


## Javascript Animations
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
