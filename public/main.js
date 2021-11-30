// default current host server
const socket = io();
const light = document.getElementById("light");
const users_count = document.getElementById("users_count");
const user_name = document.getElementById("user_name");
const users_online_list = document.getElementById("users_online_list");
let name;

do {
  name = prompt("Enter your name");
} while (!name);

user_name.innerHTML = name;
const user = { name };

socket.on("connect", () => {
  socket.emit("user_connect", user);
});

socket.on("users_count", (count) => {
  users_count.innerHTML = count;
});

socket.on("users_connected", (users) => {
  const usersObj = JSON.parse(users);
  users_online_list.innerHTML = "";

  for (const user of usersObj) {
    const li = document.createElement("li");
    li.textContent = user.name;
    users_online_list.appendChild(li);
  }
  console.log(usersObj);
});

socket.on("trigger_light", (msj) => {
  if (msj == "on") light.src = "./img/on.png";
  else light.src = "./img/off.png";
});
