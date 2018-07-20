

// ########################  begin setup local storage ########################

// Get localStorage item for display name -- setup if none exists
if ( !localStorage.getItem('display_name') )
    localStorage.setItem('display_name', "null");

// Get the last active channel viewed - create localStorage item if none
// 'active_channel' holds the channel currently being viewed
if (!localStorage.getItem('active_channel')) {
    localStorage.setItem('active_channel', "null");
  }
// ########################  end setup local storage ########################



// ########################  begin DOMContentLoaded ########################
document.addEventListener('DOMContentLoaded', () => {

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  socket.on('connect', () => {
    // if no display name is set, show input form
    // if display name is set, show name
    if (localStorage.getItem('display_name') === "null") {
      // display new user input form
      show_register_block(socket);

    } else {
      // user has created a display name already -- display main window
      show_body_block(socket);
    } // end if else - display name
  }); // end on connect

});
// ########################  end DOMContentLoaded ########################





// ######################## BEGIN SUPPORTING FUNCTIONS ########################


// display textbox input form for user to enter a display name
function show_register_block(socket) {
  document.querySelector('#register_block').hidden = false;
  document.querySelector('#txt_dispname').hidden = true;

  // enable display name button when entered name is valid
  document.querySelector('#txtinput_dispname').onkeyup = () => {
  // TODO: Ensure name contains 3 visible characters
      if (document.querySelector('#txtinput_dispname').value.length > 3)
          document.querySelector('#btn_dispname').disabled = false;
      else
          document.querySelector('#btn_dispname').disabled = true;
  }

  //when then display name is submitted by the user
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
        show_body_block(socket);
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

  }; // end onsubmit frm_dispname
} // end show_register_block






// show main window with event methods attached to elements
function show_body_block(socket) {

  active_channel = localStorage.getItem('active_channel');

  // Build list of channels from server
  build_channel_list();

  if (localStorage.getItem('active_channel') == "null"){
    load_intro();
  } else {
    load_chat(active_channel); // loads chat window for active channel
  }

  // When a new channel is announed by the server, add it to the channel list
  socket.on('add_new_channel', new_ch => {
      add_channel_card(new_ch.name, new_ch);
  });

  // When a post is announed by the server, add it to the channel list
  socket.on('add_new_post', new_post => {

    // If post is to active channel update the window
    if (localStorage.getItem('active_channel') == new_post.ch_name) {
      add_post_to_window(new_post);
    }

    // update the channel card statisitics
      cn = new_post.ch_name.replace(/ /g,"_");
      document.querySelector('#'+cn+'numposts').innerHTML = new_post.num_posts;
      document.querySelector('#'+cn+'lastpost').innerHTML = disp_time(new_post.time);

    //animate

    document.querySelector(`#${cn}cardhead`).style.animationPlayState = 'running';
    // document.querySelector(`#${cn}cardhead`).style.animation = '';
    // reset_new_message_animation(document.querySelector(`#${cn}cardhead`));
    // document.querySelector(`#${cn}cardhead`).style.animationPlayState = 'paused';


  }); // end add_new_post on socket

  set_body_block_elements(socket);
  document.querySelector('#register_block').hidden = true;
  document.querySelector('#txt_dispname').hidden = false;
  document.querySelector('#body_block').hidden = false;
  document.querySelector('#txt_dispname').innerHTML =
                        `Display Name: ${localStorage.getItem('display_name')}`;

} // end show_body_block()


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
      add_channel_card(channel, channel_list[channel])
    }
  } // end onload

  get_channels.send();

} // end build_channel_list()





//load intro screen if no channel has been selected
function load_intro() {
  const intro = document.createElement('div');
  intro.className = "container"
  intro.innerHTML = `Welcome, ${localStorage.getItem('display_name')}`
  document.querySelector('#chat_listing').append(intro);
} // end load_intro()




//load the chat messages in chat window for active channel
function load_chat(channel) {



  //get channel's chat messages
  load_posts(channel);

  // Set header items
  document.querySelector('#header_chname').innerHTML = channel;

} // end load_chat()




function add_post_to_window(post) {
  //append post to chat listing  id="chat_listing"

  // if the post is to the active window - update WINDOW
  // otherwise, update the channel card # of posts and last post time
  const post_div = document.createElement('div');

  // if post is from owner, put on the right side
  if (post.user === localStorage.getItem('display_name')) {
    post_div.className = "col-8 offset-4  rounded mb-2 py-1 self_chatbox";
  } else {
    post_div.className = "col-8           rounded mb-2 py-1 other_chatbox";
  } // end if-else

  post_div.innerHTML = `${post.user}: ${post.txt}`;


  cn = (post.ch_name).toString().replace(/ /g,"_");
  console.log(cn);

  document.querySelector('#chat_listing').appendChild(post_div);
  //TODO: scroll to bottom of window slowly to highlight new post
  document.querySelector('#chat_listing').scrollTop = document.querySelector('#chat_listing').scrollHeight



  //update header elements in window
  document.querySelector('#header_posts').innerHTML = post.num_posts;
  document.querySelector('#header_last').innerHTML = disp_time(post.time);



} // end add_post_to_window()



// set properties of body_block elements
function set_body_block_elements(socket){

  setup_add_channel(socket);
  setup_add_post(socket);

} // end set_body_block_elements()



function setup_add_channel(socket) {

  document.querySelector('#btn_add_channel').disabled = true;

  // enable "add channel" button when entered display name is valid
  document.querySelector('#txt_add_channel').onkeyup = (e) => {
  // TODO: Ensure name contains 3 visible characters
      if (document.querySelector('#txt_add_channel').value.length > 2){
          document.querySelector('#btn_add_channel').disabled = false;
          if (e.keyCode == 13) { add_channel(socket); };
      } else {
          document.querySelector('#btn_add_channel').disabled = true;
          if (e.keyCode == 13) { };

      }
  };

  // first, check to see if channel name is in use.
  // If not in use, let server add channel to global list
  // and then let server emit new channelt to all clients.
  document.querySelector('#btn_add_channel').onclick = () => {
    add_channel(socket);
  }; // end add channel on button click

}// ****  END setup_add_channel


//will add channel to
function add_channel(socket) {
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
      document.querySelector('#btn_add_channel').disabled = true;
      socket.emit('new_channel', new_ch);
    }

  } // end onload

  // Add channel name and display name to request sent to server
  const channel = new FormData();
  channel.append('new_ch', new_ch);
  channel.append('ch_owner', localStorage.getItem('display_name'))

  // Send request
  ch_exists.send(channel);
  return false; // avoid sending the form and creating an HTTP POST request

} // end add_channel()


function setup_add_post(socket) {

  document.querySelector('#btn_add_post').disabled = true;

  // setup the txt box so that if empty can't submit
  document.querySelector('#txt_add_post').onkeyup = (e) => {
    if (document.querySelector('#txt_add_post').value.length > 0){
        document.querySelector('#btn_add_post').disabled = false;
        if (e.keyCode == 13) { add_post(socket); };
    } else {
        document.querySelector('#btn_add_post').disabled = true;
        if (e.keyCode == 13) { };

    }
  }


  document.querySelector('#btn_add_post').onclick = () => {
    add_post(socket);
  } // end add channel on button click

} // end setup_add_post()

// will add post to the chat window and set appropriate screen elements
function add_post(socket) {
  // assign data elements for post to Variables
  post_ch = localStorage.getItem('active_channel');
  post_txt = document.querySelector('#txt_add_post').value;
  post_user = localStorage.getItem('display_name');
  post_time = (new Date).getTime();

  // emit new post to to server
  socket.emit('add_post', post_ch, post_txt, post_user, post_time);
  document.querySelector('#btn_add_post').disabled = true;
  document.querySelector('#txt_add_post').value = "";
} // end add_post()


// load posts for channel name sent as parameter
function load_posts(channel) {

    // determine if channel already exists
    // initialize new request
    const get_chat = new XMLHttpRequest();

    get_chat.open('POST', '/get_posts');

    //when request is completed
    get_chat.onload = () => {
      //extract JSON data from request
      const response = JSON.parse(get_chat.responseText);

      console.log(response);
      if (response.error) {
        load_intro();
      } else {
        //loop through posts and add them to chat window
        for (post in response) {
          add_post_to_window(response[post]);
        } // end for loop
      }
    }; // end onload

    // Add channel name and display name to request sent to server
    const data = new FormData();
    data.append('ch_name', channel);

    // Send request
    get_chat.send(data);
    return false; // avoid sending the form and creating an HTTP POST request

} // end load_posts()


// convert epoch time to human readbale time for display
function disp_time(epoch_time) {
    t = new Date(epoch_time);
    y = t.getFullYear().toString().slice(-2);
    m = t.getMonth()+1;
    d = t.getDate();
    h = ("0" + (t.getHours()+1)).slice(-2);
    mm = ("0" + (t.getMinutes()+1)).slice(-2);

    return `${m}/${d}/${y} ${h}:${mm}`;
}

// add HTML for channel card to left side column
function add_channel_card(ch_name, ch_data) {

  //reaplce spaces in channel name for data-type elements
  cn = ch_name.replace(/ /g,"_");

  const row = document.createElement('div');
  row.className = "row mx-auto";


  const card = document.createElement('div');

  card.className = "card text-white bg-primary my-1 mx-auto"
  // var card_attr1 = document.createAttribute("class");
  // card_attr1.value = "card text-white bg-primary my-1 mx-auto";
  // card.setAttributeNode(card_attr1);

  var card_attr2 = document.createAttribute("style")
  card_attr2.value = "min-width: 14rem";
  card.setAttributeNode(card_attr2);

  const anchor = document.createElement('a');
  var a_attr1 = document.createAttribute("href");
  a_attr1.value = "";
  anchor.setAttributeNode(a_attr1);
  var a_attr2 = document.createAttribute("data-channel");
  a_attr2.value = ch_name;
  anchor.setAttributeNode(a_attr2);
  var a_attr3 = document.createAttribute("class");
  a_attr3.value = "ch_link";
  anchor.setAttributeNode(a_attr3);

  anchor.onclick = () => {
      const sel_channel = anchor.dataset.channel;
      // what to do when clicked
      localStorage.setItem('active_channel', sel_channel);
      build_chat_window();
      return false;
  };

  const card_head = document.createElement('div');
  card_head.className = "card-header";
  card_head.id = cn+"cardhead";
  // var card_head_attr = document.createAttribute("class");
  // card_head_attr.value = "card-header";
  // card_head.setAttributeNode(card_head_attr);
  reset_new_message_animation(card_head);

  card_head.addEventListener("animationend", (element) => {
    reset_new_message_animation(element);
    alert("ran reset");
  });

  // card_head.style.animation = "flash_badge 1s 1";
  // card_head.style.animationPlayState = 'paused';

  card_head.innerHTML = ch_name

  //add pill badge to card header
  const counter = document.createElement('span');
  counter.className = "badge badge-pill badge-danger ml-2";
  counter.id = cn+"numposts";
  card_head.appendChild(counter);
  counter.innerHTML = ch_data.num_posts;

  //channel card body
  const card_body = document.createElement('div');
  var card_body_attr = document.createAttribute("class");
  card_body_attr.value = "card-body pt-1 pb-2 px-3";
  card_body.setAttributeNode(card_body_attr);

  //channel card text
  const card_text = document.createElement('p');
  var card_text_attr = document.createAttribute("class");
  card_text_attr.value = "card-text mx-0";
  card_text.setAttributeNode(card_text_attr);

  // ASSIGN CONTENT TO TAGS
  const p_owner = document.createElement('p');
  p_owner.innerHTML = "Owner: " + ch_data.owner;

  const p_lastpost = document.createElement('p');
  p_lastpost.innerHTML = "Last: ";
  const s_lastpost = document.createElement('span');
  s_lastpost.id = cn+'lastpost';
  if (ch_data.last_post == 0) {
    s_lastpost.innerHTML = "no posts";
  } else {
    s_lastpost.innerHTML = disp_time(ch_data.last_post);
  }
  p_lastpost.appendChild(s_lastpost);

  card_text.appendChild(p_owner);
  card_text.appendChild(p_lastpost);
  card_body.appendChild(card_text);
  anchor.appendChild(card_head);
  anchor.appendChild(card_body);
  card.appendChild(anchor);
  row.appendChild(card);

  document.querySelector('#channel_listing').appendChild(row);

} // end build_channel_card()

function reset_new_message_animation (element) {
  console.log(element);
  //cn = ch.replace(/ /g,"_");
  // element.style.animation = "null";
  //element = document.querySelector(`#${cn}element`).style;
  console.log(element);
  element.animation = "flash_badge 1s ease 1";
  element.animationPlayState = 'paused';
}

// ######################## END SUPPORTING FUNCTIONS ########################
