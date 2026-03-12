const socket = io();

const audio = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");
const confirmBtn = document.getElementById("confirm");
const activateBtn = document.getElementById("activate");
const status = document.getElementById("status");
const nameInput = document.getElementById("nameInput");

let registered = false;
let childName = "";

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    audio.src = URL.createObjectURL(file);
  }
});

confirmBtn.addEventListener("click", () => {
  if (!audio.src) return;

  childName = nameInput.value.trim() || "NoName";

  socket.emit("register-child", childName);

  registered = true;
  status.textContent = "登録済み";
});

activateBtn.addEventListener("click", () => {
  audio.play().then(() => audio.pause());
});


/* 再接続時 */
socket.on("connect", () => {
  if (registered) {
    socket.emit("register-child", childName);
  }
});


socket.on("play", () => {
  if (registered) audio.play();
});

socket.on("stop", () => {
  if (registered) {
    audio.pause();
    audio.currentTime = 0;
  }
});

socket.on("play-url", (url) => {
  audio.src = url;
  audio.play();
});

socket.on("volume", (v) => {
  if (registered) audio.volume = v;
});
