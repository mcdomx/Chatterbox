// localStorage.clear();

// Get localStorage item for display name -- setup if none exists
if ( !localStorage.getItem('display_name') )
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


// Load current value of dislpay_name

document.addEventListener('DOMContentLoaded', () => {

  // if no display name is set, show input form
  // if display name is set, show name
  if (localStorage.getItem('display_name') === "null") {

    // display input form
    show_register_block();

    //set new user name form to get AJAX data from server in order to
    //check of name conflict

    // enable button when entered display name is valid
    document.querySelector('#txtinput_dispname').onkeyup = () => {
    // TODO: Ensure name contains 3 visible characters
        if (document.querySelector('#txtinput_dispname').value.length > 3)
            document.querySelector('#btn_dispname').disabled = false;
        else
            document.querySelector('#btn_dispname').disabled = true;
    };

    document.querySelector('#frm_dispname').onsubmit = () => {

      //initialize new request
      const name_exists = new XMLHttpRequest();
      const new_name = document.querySelector('#txtinput_dispname').value;
      name_exists.open('POST', '/add_newname');

      //when request is completed
      name_exists.onload = () => {

        //extract JSON data from request
        const response = JSON.parse(name_exists.responseText)

        //check existing_users for new name
        if (response["success"]) {
          // add name to list of users
          localStorage.setItem('display_name', new_name);
          show_body_block();
        } else {
          // name exists - present error and allow new entry
          alert(`Display name '${new_name}' is already taken.  Try a differnet name.`);
        } // end if else

      } // end onload

      // Add data to send with request
      const data = new FormData();
      data.append('new_name', new_name);

      // Send request
      //TODO: See if I can do this without using FormData.  Just send new_name.  Will need to chaneg Python function.
      name_exists.send(data);
      return false; // avoid sending the form and creating an HTTP POST request

    } // end onsubmit frm_dispname

  } else {

    // user has created a display name already -- display chat window
    show_body_block();

  } // end if else - display name



  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // Once socket is connected, configure "Add" button for channel_list
  socket.on('connect', () => {

      // Build list of channels from server
      build_channel_list();

  }); // end on connect



  // start page with disabled "Add channel" button
  document.querySelector('#btn_add_channel').disabled = true;

  // enable "add channel" button when entered display name is valid
  document.querySelector('#txt_add_channel').onkeyup = () => {
  // TODO: Ensure name contains 3 visible characters
      if (document.querySelector('#txt_add_channel').value.length > 3)
          document.querySelector('#btn_add_channel').disabled = false;
      else
          document.querySelector('#btn_add_channel').disabled = true;
  };

  // *****************  ADD CHANNEL
  // first, check to see if channel name is in use.
  // If not in use, let server add channel to global list
  // and then let server emit new channelt to all clients.
  document.querySelector('#btn_add_channel').onclick = () => {

    // determine if channel already exists
    // initialize new request
    const ch_exists = new XMLHttpRequest();
    const new_ch = document.querySelector('#txt_add_channel').value;
    ch_exists.open('POST', '/add_channel');

    //when request is completed
    ch_exists.onload = () => {

      //extract JSON data from request
      const response = JSON.parse(ch_exists.responseText)

      //check existing channels for new channel name
      if (!response["success"]) {
        // name exists already - alert user - pick another name
        alert(`Channel '${new_ch}' is already being used.  Try a differnet name.`);
      } else {
        // emit new channel to to server
        document.querySelector('#txt_add_channel').value = "";
        socket.emit('emit_channel', new_ch);
      }

    } // end onload

    // Add channel name and display name to request sent to server
    const channel = new FormData();
    channel.append('new_ch', new_ch);
    channel.append('ch_owner', localStorage.getItem('display_name'))

    // Send request
    ch_exists.send(channel);
    return false; // avoid sending the form and creating an HTTP POST request

  } // end add channel on button click


  // When a new channel is announed by the server, add it to the channel list
  socket.on('add_new_channel', new_ch => {

      add_channel_card(new_ch.ch_name, new_ch.ch_owner);

  });
  // *****************  END ADD CHANNEL





  // *****************  ADD POST
  // first, check to see if channel name is in use.
  // If not in use, let server add channel to global list
  // and then let server emit new channelt to all clients.
  document.querySelector('#btn_add_post').onclick = () => {

        // emit new post to to server
        document.querySelector('#txt_add_post').value = "";
        socket.emit('emit_post', post_ch, post_txt, post_user, post_time);

  } // end add channel on button click


  // When a new channel is announed by the server, add it to the channel list
  socket.on('add_new_post', new_ch => {

      add_channel_card(new_ch.ch_name, new_ch.ch_owner);

  });
  // *****************  END ADD Post






    // updated channel and chat data from server to local storage
    // select most recently viewed channel
    // display updated chat messages


});





// SUPPORTING FUNCTIONS

// display textbox input form for user to enter a display name
function show_register_block() {
  document.querySelector('#register_block').hidden = false;
  document.querySelector('#txt_dispname').hidden = true;

};

// display user's display name
function show_body_block() {
  document.querySelector('#register_block').hidden = true;
  document.querySelector('#txt_dispname').hidden = false;
  document.querySelector('#body_block').hidden = false;
  document.querySelector('#txt_dispname').innerHTML =
                        `Display Name: ${localStorage.getItem('display_name')}`;

};



// on initial load of page, build the list of of channels stored on server
function build_channel_list() {

  //initialize new request
  const get_channels = new XMLHttpRequest();
  get_channels.open('GET', '/get_channels');

  //when request is completed
  get_channels.onload = () => {

    //extract JSON data from request
    const channel_list = JSON.parse(get_channels.responseText)

    // for each channel in the list, add a channel card
    for (channel in channel_list) {
      add_channel_card(channel, channel_list[channel]['ch_owner'])
    }

    //build cards for channel list

  } // end onload

  get_channels.send();

} // end build_channel_list()



function add_channel_card(ch_name, ch_owner) {

  const row = document.createElement('div');
  var row_attr = document.createAttribute("class");
  row_attr.value = "row mx-auto";
  row.setAttributeNode(row_attr)

  const card = document.createElement('div');
  var card_attr1 = document.createAttribute("class");
  card_attr1.value = "card text-white bg-primary my-1 mx-auto";
  card.setAttributeNode(card_attr1);
  var card_attr2 = document.createAttribute("style")
  card_attr2.value = "min-width: 14rem";
  card.setAttributeNode(card_attr2);

  const anchor = document.createElement('a');
  var a_attr = document.createAttribute("href");
  a_attr.value = "#" + ch_name;
  anchor.setAttributeNode(a_attr);

  const card_head = document.createElement('div');
  var card_head_attr = document.createAttribute("class");
  card_head_attr.value = "card-header";
  card_head.setAttributeNode(card_head_attr);
  card_head.innerHTML = ch_name

  const card_body = document.createElement('div');
  var card_body_attr = document.createAttribute("class");
  card_body_attr.value = "card-body pt-1 pb-2 px-3";
  card_body.setAttributeNode(card_body_attr);

  const card_text = document.createElement('p');
  var card_text_attr = document.createAttribute("class");
  card_text_attr.value = "card-text mx-0";
  card_text.setAttributeNode(card_text_attr);

  // ASSIGN CONTENT TO TAGS
  const p_owner = document.createElement('p');
  p_owner.innerHTML = "Owner: " + ch_owner;

  const p_numposts = document.createElement('p');
  p_numposts.innerHTML = "# of posts: ";

  const p_lastpost = document.createElement('p');
  p_lastpost.innerHTML = "Last Post: ";

  card_text.appendChild(p_owner);
  card_text.appendChild(p_numposts);
  card_text.appendChild(p_lastpost);
  card_body.appendChild(card_text);
  anchor.appendChild(card_head);
  anchor.appendChild(card_body);
  card.appendChild(anchor);
  row.appendChild(card);
  document.querySelector('#channel_listing').appendChild(row);


} // end build_channel_card()


// var h1 = document.getElementsByTagName("H1")[0];   // Get the first <h1> element in the document
// var att = document.createAttribute("class");       // Create a "class" attribute
// att.value = "democlass";                           // Set the value of the class attribute
// h1.setAttributeNode(att);

// <!-- CHANNEL -->
// <div class="row">
//   <div class="card text-white bg-primary my-1" style="min-width: 14rem">
//     <a href="#1">
//       <div class="card-header">Channel 1</div>
//       <div class="card-body pt-1 pb-2 px-3">
//         <!-- <h5 class="card-title">Primary card title</h5> -->
//         <p class="card-text mx-0">
//           <span>Owner: </span><br>
//           <span># of Posts: </span><br>
//           <span>Last Post: </span>
//         </p>
//       </div> <!-- END CARD BODY -->
//     </a>
//   </div><!-- END CARD  -->
// </div> <!-- END ROW -->
// <!-- END CHANNEL -->

    //
    // document.querySelector('#counter').innerHTML = counter;
    //
    // setInterval(() => {
    //         counter++;
    //         document.querySelector('#counter').innerHTML = counter;
    //         localStorage.setItem('counter', counter)
    //     }, 1000);

    // Create new item for list
    // const li = document.createElement('li');
    // li.innerHTML = document.querySelector('#task').value;
    //
    // // Add new item to task list
    // document.querySelector('#tasks').append(li);
