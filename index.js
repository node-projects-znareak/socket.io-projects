const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

// Static files
app.use(express.static("public"));
let count = 0;
let sockets = [];
let users = [];

function sendInfoCount() {
  for (const _socket of sockets) {
    _socket.emit("users_count", count);
    _socket.emit("users_connected", JSON.stringify(users));
  }
}

function sendInfoMouseCoords(mouseCoords) {
  for (const _socket of sockets) {
    _socket.emit("mouse_coords_moved", JSON.stringify(mouseCoords));
  }
}

io.on("connection", (socket) => {
  sockets.push(socket);
  let trigger = 1;
  count++;

  socket.on("user_connect", (user) => {
    if (user.name !== null) {
      users.push({
        ...user,
        id: socket.id,
      });

      sendInfoCount();
    }
  });

  socket.on("disconnect", () => {
    count--;
    users = users.filter((user) => user.id !== socket.id);
    sockets = sockets.filter((_socket) => _socket.id !== socket.id);
    sendInfoCount();
  });

  socket.on("mouse_coords", (coords) => {
    sendInfoMouseCoords(coords);
    console.log(coords);
  });

  setInterval(() => {
    socket.emit("trigger_light", trigger ? "on" : "off");
    trigger = !trigger;
  }, 1000);
});

server.listen(5000, () => {
  console.log("listening on *:5000");
});
