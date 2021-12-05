// default current host server
const socket = io();
const light = document.getElementById("light");
const users_count = document.getElementById("users_count");
const user_name = document.getElementById("user_name");
const users_online_list = document.getElementById("users_online_list");
let name;
let ball_user;

const randomColor = () =>
  "#" + Math.floor(Math.random() * 16777215).toString(16);

do {
  name = prompt("Enter your name");
} while (!name);

user_name.innerHTML = name;
const user = { name };

socket.on("connect", () => {
  const ball = document.createElement("div");
  ball.id = socket.id;
  ball.style.position = "absolute";
  ball.style.width = "10px";
  ball.style.height = "10px";
  ball.style.backgroundColor = randomColor();
  ball.style.borderRadius = "50%";
  ball.classList.add("ball");
  ball_user = ball;
  document.body.appendChild(ball);

  socket.emit("user_connect", user);
  window.addEventListener("mousemove", (e) => {
    socket.emit("mouse_coords", {
      x: e.x,
      y: e.y,
    });
  });
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

socket.on("mouse_coords_moved", (coords) => {
  const coordsParse = JSON.parse(coords);
  console.log(coordsParse);
  const ball = document.getElementById(socket.id);
  console.log(ball);
  ball.style.left = coordsParse.x + "px";
  ball.style.top = coordsParse.y + "px";
});

socket.on("trigger_light", (msj) => {
  if (msj == "on") light.src = "./img/on.png";
  else light.src = "./img/off.png";
});
