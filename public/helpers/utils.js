export const randomColor = () => {
  const hex = Math.floor((Math.random() * 0xffffff) << 0)
    .toString(16)
    .padStart(6, "0");
  return `#${hex}`;
};

export const checkExistsUser = () => {
  let name = localStorage.getItem("username");
  return name !== null;
};

export const getUsername = () => {
  let name = localStorage.getItem("username");
  if (!!name) {
    return name;
  }

  do {
    name = prompt("Enter your name");
  } while (!name);
  localStorage.setItem("username", name);
  return name;
};

export const createPlayer = ({ name, id, x = 0, y = 0 }) => {
  console.log(name);
  const ball = document.createElement("div");
  const span = document.createElement("span");
  span.textContent = name;
  span.style.cssText =
    "text-align:center; position:absolute;left:50%; transform: translateX(-50%); top:-1rem; background:#282828; color:#fff; padding:2px 4px; border-radius:4px; width: max-content; font-size:12px; display:block;";

  ball.id = id;
  ball.style.position = "absolute";
  ball.style.width = "50px";
  ball.style.height = "50px";
  ball.style.backgroundImage = "url(/img/p2.gif)";
  ball.style.backgroundSize = "cover";
  ball.style.textAlign = "center";
  ball.style.top = y + "px";
  ball.style.left = x + "px";
  ball.classList.add("ball");

  ball.appendChild(span);

  document.body.appendChild(ball);
  return ball;
};

export const displayUsers = (users) => {
  const users_online_list = getId("users_online_list");
  users_online_list.innerHTML = "<li class='title-online-users'><strong>Online players</strong></li>";

  for (const [id, user] of Object.entries(users)) {
    const li = document.createElement("li");
    li.textContent = user.name;
    li.setAttribute("data-socket-id", id);
    users_online_list.appendChild(li);
  }
};

export const displayLatency = (ms) => {
  getId("ping").textContent = ms;
};

export const getId = (id) => document.getElementById(id);
