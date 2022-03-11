const fs = require("fs");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const io = new Server(server, {
  cors: {
    origin: "*",
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

// Static files
app.use(express.static("public"));

const sockets = new Set();
let count = 0;
let users = {};

function sendSockectDisconnect(socket) {
  const data = {
    socket_id: socket.id,
    users,
  };
  for (const _socket of sockets) {
    _socket.emit("user_disconnected", JSON.stringify(data));
  }
}

function sendUsersConnected() {
  for (const _socket of sockets) {
    _socket.emit("users_connected", JSON.stringify(users));
  }
}

function sendInfoCount() {
  for (const _socket of sockets) {
    _socket.emit("users_count", count);
  }
}

function sendInfoMouseCoords(socket, mouseCoords) {
  mouseCoords.socket_id = socket.id;
  for (const _socket of sockets) {
    _socket.emit("mouse_coords_moved", JSON.stringify(mouseCoords));
  }
}

io.use(function (socket, next) {
  if (socket.handshake.query && socket.handshake.query.token) {
    next();
    // jwt.verify(
    //   socket.handshake.query.token,
    //   "SECRET_KEY",
    //   function (err, decoded) {
    //     if (err) return next(new Error("Authentication error"));
    //     socket.decoded = decoded;
    //     next();
    //   }
    // );
  } else {
    const authError = new Error({name:"Authentication error token"});
    authError.name = "AuthenticationError";
    next(authError);
  }
});

io.on("connection", (socket) => {
  sockets.add(socket);
  count++;

  socket.on("ping", (cb) => {
    cb();
  });

  socket.on("user_connect", (user) => {
    if (!!user.name) {
      users[socket.id] = {
        ...user,
        id: socket.id,
      };

      sendInfoCount();
      sendUsersConnected();

      socket.emit("user_connected", JSON.stringify(users[socket.id]));
    }
  });

  socket.on("disconnect", () => {
    count--;
    delete users[socket.id];
    sockets.delete(socket);
    //sockets = sockets.filter((_socket) => _socket.id !== socket.id);
    sendInfoCount();
    sendSockectDisconnect(socket);
  });

  socket.on("mouse_coords", (coords) => {
    sendInfoMouseCoords(socket, coords);
  });
});

server.listen(5000, () => {
  console.log("listening on *:5000");
});
