# Project 2
Chatterbox

## Summary
This application is a chat platform where unregistered users can quickly setup an alias to begin sharing comments.  Any user can setup a channel where any user can readily jump in to and submit comments.  Channels freeze after 100 comments.

New users are unable to submit posts to channels until they create a display name.  

Channels are listed in the main screen in collapsable chat boxes.  Users can choose how channels are sorted and whether one or many chats can be un-collapsed at once.

User-submitted posts are right aligned while other user posts are left aligned.

Each channel is represented by a randomly chosen color.  The header bar for each chat indicates the number of posts and the time of the last post.

OPTIONAL:  Users can choose to put two chats side-by-side in the main screen.

Chat and channel data is stored in a single server-side dictionary:
  channel_chat[<channel_name>: <list of posts> ]
