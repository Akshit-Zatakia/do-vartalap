const socket = io();

// elements
const $messageForm = document.querySelector("#message-form");
const $messageInput = $messageForm.querySelector("input");
const $sendMessage = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// template
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// auto scrolling
const autoScroll = () => {
  // New Message element
  const $newMessage = $messages.lastElementChild;

  // height of the new message
  const $newMessageStyle = getComputedStyle($newMessage);
  const $newMessageMargin = parseInt($newMessageStyle.marginBottom);
  const $newMessageHeight = $newMessage.offsetHeight + $newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // height of messages container
  const containerHeight = $messages.scrollHeight;

  // how far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - $newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (msg) => {
  console.log(msg);
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $sendMessage.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (message) => {
    $sendMessage.removeAttribute("disabled");
    $messageInput.value = "";
    $messageInput.focus();
    console.log(message);
  });
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });

  document.querySelector("#sidebar").innerHTML = html;
});

socket.on("locationMessage", (msg) => {
  console.log(msg);
  const html = Mustache.render(locationTemplate, {
    username: msg.username,
    url: msg.url,
    createdAt: moment(msg.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

$locationButton.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }

  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      (msg) => {
        $locationButton.removeAttribute("disabled");
        console.log(msg);
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
