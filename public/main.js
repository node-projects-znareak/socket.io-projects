import {
  displayUsers,
  createPlayer,
  getUsername,
  getId,
  displayLatency,
} from "./helpers/utils.js";

// default current host server
const token = localStorage.getItem("token") || null;
const socket = io({ query: "token=" + "45646" });
const user_name = getId("user_name");
const name = getUsername();
const chatText = getId("chat-text");
const chatDisplay = getId("chat-display");
const btnSendChat = getId("send-chat");
const usersWritting = getId("users-writting");
let timer = null;

user_name.innerHTML = name;

function handleErrors(err) {
  document.write(err);
  console.log(err.name);
}

const scrollToBottom = (node) => {
  node.scroll({
    top: node.scrollHeight - node.clientHeight + 10,
    behavior: "smooth",
  });
};

function sendMessage() {
  const msj = {
    content: chatText.value.trim(),
    user: name,
  };
  if (msj.content.length > 0) {
    socket.emit("send_message", msj);
    chatText.value = "";
    scrollToBottom(chatDisplay);
  }
}

function sendUserWritting() {
  socket.emit("user_writting", name);
}

btnSendChat.addEventListener("click", sendMessage);
chatText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

chatText.addEventListener("input", (e) => {
  sendUserWritting();
  clearTimeout(timer);
  timer = setTimeout(() => {
    socket.emit("user_stop_writting", name);
  }, 1300);
});

socket.on("connect_error", handleErrors);
socket.on("connect_failed", handleErrors);
socket.on("disconnect", handleErrors);

socket.on("connect", () => {
  const user = { name };
  socket.emit("user_connect", user);
  createPlayer({ ...socket, ...user });

  window.addEventListener("mousemove", (e) => {
    socket.emit("mouse_coords", {
      x: e.x,
      y: e.y,
    });
  });
});

socket.on("user_connected", (user) => {});

socket.on("users_connected", (users) => {
  const usersObj = JSON.parse(users);
  displayUsers(usersObj);
  for (const [id, user] of Object.entries(usersObj)) {
    // avoid to duplicate the main player
    if (id !== socket.id) {
      console.log(user);
      createPlayer(user);
    }
  }
});

socket.on("mouse_coords_moved", (coords) => {
  const coordsParse = JSON.parse(coords);
  const ball = getId(coordsParse.socket_id);
  ball.style.left = coordsParse.x + "px";
  ball.style.top = coordsParse.y + "px";
});

// An player disconnected from socket network
socket.on("user_disconnected", (data) => {
  const { socket_id, users } = JSON.parse(data);
  console.log("Disconnected socket id: ", socket_id);
  getId(socket_id)?.remove();
  displayUsers(users);
});

// Incoming messages in the chat
socket.on("new_messages", (data) => {
  const isSelf = data.user === name;
  const className = `mb-1 chat-message${isSelf ? " me" : ""}`;

  chatDisplay.innerHTML += /*html*/ `
    <p class="${className}">
      <b class="chat-user">${data.user}</b>: ${data.content}
    </p>
  `;
  console.log(data);
});

socket.on("user_is_writting", (users) => {
  const len = users.length;
  if (len > 0) {
    const text =
      len > 3
        ? "varias personas están escribiendo"
        : `${users.join(", ")} está escribiendo...`;
    usersWritting.textContent = text;
  } else {
    usersWritting.textContent = "";
  }
});

setInterval(() => {
  const start = Date.now();

  socket.volatile.emit("ping", () => {
    const latency = Date.now() - start;
    displayLatency(latency);
  });
}, 1000);
