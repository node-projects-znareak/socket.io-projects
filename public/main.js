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
user_name.innerHTML = name;

function handleErrors(err) {
  document.write(err);
  console.log(err.name)
}

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


setInterval(() => {
  const start = Date.now();

  socket.volatile.emit("ping", () => {
    const latency = Date.now() - start;
    displayLatency(latency);
  });
}, 1000);
