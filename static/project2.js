

// Get localStorage item for display name -- setup if none exists
if (!localStorage.getItem('display_name'))
    localStorage.setItem('display_name', "null");

// DEVELOPMENT: set dislpay_name localStorage item to null
// localStorage.setItem('display_name', "null")


// Get localStorage item for channels and chats -- setup if none exists
if (!localStorage.getItem('channels')) {
    localStorage.setItem('channels', "null");
  }

post1 = {"date": 1531517747, "by": "Mark", "post": "This is the first message in my new system"};
post2 = {"date": 1531517847, "by": "Jerry", "post": "Wow!  Great work."};
post3 = {"date": 1531517947, "by": "Mark", "post": "Thanks, I can't believe that I got this to work"};

ch_posts = [post1, post2, post3];


channels = ["Master Chat", "Race Cars", "Hangout"];
localStorage.setItem('channel_list', channels);



// Load current value of dislpay_name

document.addEventListener('DOMContentLoaded', () => {

  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // Once socket is connected, configure "Add" button for channel_list
  socket.on('connect', () => {

      // "Add" button should emit a new channel
      document.querySelector('btn_add_channel').onclick =
              function() {
                const new_channel = document.querySelector('#txt_add_channel').value;
                socket.emit('add_channel', new_channel);
          };
      });

  // if no display name is set, show input form
  // if display name is set, show name
  if (localStorage.getItem('display_name') === "null") {

    // display input form
    fn_display_inputfrm();

    //set button function
    document.querySelector('#btn_dispname').onclick =
            function() {
              localStorage.setItem('display_name', document.querySelector('#txtinpt_dispname').value);
              fn_display_name();
            }

    // enable button when entered display name is valid
    document.querySelector('#txtinpt_dispname').onkeyup = () => {
    // TODO: Ensure name contains 3 visible characters
    // TODO: Ensure display name is not taken by anyone else
        if (document.querySelector('#txtinpt_dispname').value.length > 3)
            document.querySelector('#btn_dispname').disabled = false;
        else
            document.querySelector('#btn_dispname').disabled = true;
    };

  } else {

    // displpay name
    fn_display_name();

  }

  // enable button when entered display name is valid
  // start page with disabled button
  document.querySelector('#btn_add_channel').disabled = true;

  document.querySelector('#txt_add_channel').onkeyup = () => {
  // TODO: Ensure name contains 3 visible characters
  // TODO: Ensure that channel name is unique
      if (document.querySelector('#txt_add_channel').value.length > 3)
          document.querySelector('#btn_add_channel').disabled = false;
      else
          document.querySelector('#btn_add_channel').disabled = true;
  };


  // When a new vote is announced, increase the count
  socket.on('add_channel', new_channel => {
      channels.append(new_channel)
  });

    // updated channel and chat data from server to local storage
    // setup local storage variable for channel and chat data


    // then, draw channel column
    // select most recently viewed channel
    // display updated chat messages

    // add channel when Add button is pressed
    // first, ensure that a localStorage item exists for


});





// SUPPORTING FUNCTIONS

// display textbox input form for user to enter a display name
function fn_display_inputfrm() {
  document.querySelector('#frm_dispname').hidden = false
  document.querySelector('#txt_dispname').hidden = true

}

// display user's display name
function fn_display_name() {
  document.querySelector('#frm_dispname').hidden = true
  document.querySelector('#txt_dispname').hidden = false
  document.querySelector('#txt_dispname').innerHTML =
                        `Display Name: ${localStorage.getItem('display_name')}`

}


    //
    // document.querySelector('#counter').innerHTML = counter;
    //
    // setInterval(() => {
    //         counter++;
    //         document.querySelector('#counter').innerHTML = counter;
    //         localStorage.setItem('counter', counter)
    //     }, 1000);
