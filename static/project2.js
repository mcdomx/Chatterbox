

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
      if (response["exists"]) {
        // name exists - present error and allow new entry
        alert(`Display name '${new_name}' is already taken.  Try a differnet name.`);

      } else {
        // add name to list of users
        localStorage.setItem('display_name', new_name);
        show_body_block(socket);
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

  // Build list of channels from server
  build_channel_list();

  active_channel = localStorage.getItem('active_channel');

  if ( active_channel == "null" || !channel_exists(active_channel, socket) ){
    //no previously selected channel or channel doesn't exist - select general
    localStorage.setItem('active_channel', "general");
    active_channel = localStorage.getItem('active_channel');
  }

  change_channel(active_channel);


  // When a new channel is announed by the server, add it to the channel list
  socket.on('add_new_channel', new_ch => {
      new_card = add_channel_card(new_ch.name, new_ch);
      new_card.setAttribute("id", `${cn}cardappear`)
      new_card.style.animationPlayState = 'running';

      // if the new channel was created by the user, switch to new channel
      if (new_ch.owner == localStorage.getItem('display_name')) {
        change_channel(new_ch.name);
      }

  });

  // When a post is announed by the server, add it to the channel list
  socket.on('add_new_post', new_post => {

    cn = new_post.ch_name;

    // If post is to active channel update the window
    if (localStorage.getItem('active_channel') == cn) {
      add_post_to_window(new_post);
    }

    // update the channel card statisitics
    document.querySelector('#'+cn+'numposts').innerHTML = new_post.num_posts;
    document.querySelector('#'+cn+'lastpost').innerHTML = disp_time(new_post.time);

    //Start channel card animation by adding animation id to element
    //When animation is done, the 'animationend' event will trigger which
    //will remove the animation id and allow a subsequent trigger of the animation
    document.querySelector(`[data-channel=${cn}]`).childNodes[0].setAttribute("id", `${cn}cardflash`)
    document.querySelector(`#${cn}cardflash`).style.animationPlayState = 'running';

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




// append a new post to the current chat_listing window
function add_post_to_window(post, full_loading=false) {

  const post_div = document.createElement('div');
  const chat_listing = document.querySelector('#chat_listing');


  if (post.user === localStorage.getItem('display_name')) {
    // if post is from owner, put on the right side
    post_div.className = "col-8 offset-4  rounded mb-2 py-1 self_chatbox";
  } else {
    // put on left side
    post_div.className = "col-8           rounded mb-2 py-1 other_chatbox";
  } // end if-else

  //post text for display
  post_div.innerHTML = `${post.user}: ${post.txt}`;

  // add the animation
  // find the previous newpost id and remove that id from the element
  prev_post = document.getElementById('newpost');
  if (prev_post !== null) {
    prev_post.removeAttribute("id");
  }

  // now, add newpost id to the newly posted item
  post_div.setAttribute("id", `newpost`);

  //add the newly created posting to the chat listing
  chat_listing.appendChild(post_div);
  chat_listing.scrollTop = chat_listing.scrollHeight

  // run the animation, but only when not loading the full list
  if (full_loading) {
    post_div.style.animationDuration = "0s";
  }
  post_div.style.animationPlayState = 'running';

  //update header elements
  document.querySelector('#header_posts').innerHTML = post.num_posts;
  document.querySelector('#header_last').innerHTML = disp_time(post.time);

} // end add_post_to_window()


// set properties of body_block elements
function set_body_block_elements(socket){
  setup_add_channel(socket);
  setup_add_post(socket);
} // end set_body_block_elements()


function setup_add_channel(socket) {

  //assign variables to elements for readability
  btn = document.querySelector('#btn_add_channel');
  txtbox = document.querySelector('#txt_add_channel');

  btn.disabled = true;  //start with disabled add button

  // enable "add channel" button when entered display name is valid
  // channel names can't start with a number of be longer than 12 characters
  txtbox.onkeyup = (e) => {
    if (txtbox.value.length > 12) {
      //limit channel name to 12 characters
      txtbox.value = txtbox.value.slice(0, -1);
    }
    else if (txtbox.value.length == 1){
      //test first charcter in channel name for a digit
      if (txtbox.value >=0 || txtbox.value <=9) {
        txtbox.value = txtbox.value.slice(0, 0);
      }
    }
    else if (txtbox.value.length > 2){
      //enable add button if 3 character minimum is reached
      btn.disabled = false;
      if (e.keyCode == 13) { add_channel(socket); };
    }
    else {
      //otherewise disable the add button
      btn.disabled = true;
      if (e.keyCode == 13) { };
    }
  };

  // add channel to server upon click
  // server will emit new channel when created
  document.querySelector('#btn_add_channel').onclick = () => {
    add_channel(socket);
  }; // end add channel on button click

}// ****  END setup_add_channel



// will add a channel to the server based on text in txt_add_channel box
// when server creates channel, it will emit the new channel
function add_channel(socket) {

  const new_ch = document.querySelector('#txt_add_channel').value.toString();
  //replace spaces with _
  cn = new_ch.replace(/ /g,"_").toString();

  if (channel_exists(cn, socket)){
    alert(`Channel '${new_ch}' is already being used.  Try a differnet name.`);
  } else {
    // emit new channel to to server
    document.querySelector('#txt_add_channel').value = "";
    document.querySelector('#btn_add_channel').disabled = true;
    socket.emit('new_channel', cn, localStorage.getItem('display_name'));
  }

} // end add_channel()


//return true if a channel already exists, false if it does not
function channel_exists(channel, socket) {

  // initialize new request
  const ch_exists = new XMLHttpRequest();
  const new_ch = channel.toString();

  //replace spaces with _
  cn = new_ch.replace(/ /g,"_").toString();

  ch_exists.open('POST', '/channel_exists');

  //when request is completed
  ch_exists.onload = () => {

    //extract JSON data from request
    const response = JSON.parse(ch_exists.responseText)

    //check existing channels for new channel name
    if (response["exists"]) {
      // name exists
      return true;
    } else {
      return false;
    }

  } // end onload

  // Add channel name and display name to request sent to server
  const check_channel = new FormData();
  check_channel.append('channel', cn);

  // Send request
  ch_exists.send(check_channel);
  return false; // avoid sending the form and creating an HTTP POST request


}


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
  }

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

function clear_posts() {
  chat_window = document.querySelector('#chat_listing');
  while (chat_window.firstChild) {
    chat_window.removeChild(chat_window.firstChild);
  }

} // end clear_posts()


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

      if (response.error) {
        // something really wrong - select general channel
        change_channel("general")
      } else {
        //loop through posts and add them to chat window
        for (post in response) {
          add_post_to_window(response[post], true);
        } // end for loop
      }

      //remove the underscore for display
      ch_name_display = channel.replace(/_/g," ");
      // dislay the newly selected channel's name in the header
      document.querySelector('#header_chname').innerHTML = ch_name_display;

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

function change_channel(channel) {

  //clear posts from window
  clear_posts();

  //remove animation from current active channel
  //removing id ensures no partial animations linger
  prev_ch = document.getElementById(`${localStorage.getItem('active_channel')}cardpulse`);
  if (prev_ch !== null){
    prev_ch.removeAttribute("id");
  }

  //clear header elements in window
  document.querySelector('#header_posts').innerHTML = 0;
  document.querySelector('#header_last').innerHTML = '-';

  //load new channel's chat messages from server to client window
  load_posts(channel);

  //change localStorage
  localStorage.setItem('active_channel', channel);

  //add animation to selected channel
  active_card = document.querySelector(`[data-channel=${channel}]`);
  if (active_card !== null) {
    active_card = document.querySelector(`[data-channel=${channel}]`).parentNode;
    active_card.setAttribute("id", `${channel}cardpulse`);
    active_card.style.animationPlayState = 'running';
  }

}

// add HTML for channel card to left side column
function add_channel_card(ch_name, ch_data) {

  //reaplce spaces in channel name for display purposes
  ch_name_display = ch_name.replace(/_/g," ");

  //row setup
  const row = document.createElement('div');
  row.className = "row mx-auto";

  //channel card setup
  const card = document.createElement('div');
  card.className = "card text-white bg-primary my-1 mx-auto"

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
  anchor.className = "ch_link";

  anchor.onclick = () => {
      const sel_channel = anchor.dataset.channel;
      change_channel(sel_channel);
      return false;
  };

  const card_head = document.createElement('div');
  card_head.className = "card-header";

  card_head.addEventListener("animationend", (element) => {
    reset_new_message_animation(element);
  });

  card_head.innerHTML = ch_name_display;

  //add pill badge to card header
  const counter = document.createElement('span');
  counter.className = "badge badge-pill badge-danger ml-2";
  counter.id = ch_name+"numposts";
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
  s_lastpost.id = ch_name+'lastpost';
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

  //add the new row to the top of the channel listing
  chat_window = document.querySelector('#channel_listing');
  chat_window.insertBefore(row, chat_window.firstChild);

  // return the newly added row to add an id and initiate animation
  return row;

} // end add_channel_card()


//removes id from the card header
//the id contains the css for animation
//id will be readded when the next animation is supposed to happen
//this process allows an animation to be re-triggered several times on demand
function reset_new_message_animation (animation) {
  ch_name = animation.srcElement.firstChild.data;
  ch_name_display = ch_name.replace(/ /g,"_");

  element = document.querySelector(`[data-channel=${ch_name_display}]`).childNodes[0];
  element.removeAttribute("id");

}


// ######################## END SUPPORTING FUNCTIONS ########################
