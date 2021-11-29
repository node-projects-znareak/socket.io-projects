// default current host server
const socket = io();
const light = document.getElementById("light");
const users_count = document.getElementById("users_count");
const name = prompt("Enter your name");
const user = {
  name
};

socket.on("connect", () => {
  socket.emit("user_connect", user);
});

socket.on("users_count", (count) => {
  users_count.innerHTML = count;
});

socket.on("users_connected", (users) => {
  console.log(JSON.parse(users));
});

socket.on("trigger_light", (msj) => {
  if (msj == "on") light.src = "./img/on.png";
  else light.src = "./img/off.png";
});
