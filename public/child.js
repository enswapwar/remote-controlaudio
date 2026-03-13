const socket = io();

const audio = document.getElementById("audio");        // child音声
const adminAudio = new Audio();                        // admin音声

const fileInput = document.getElementById("fileInput");
const confirmBtn = document.getElementById("confirm");
const activateBtn = document.getElementById("activate");
const status = document.getElementById("status");
const nameInput = document.getElementById("nameInput");

let registered = false;
let childName = "";

/* child音声選択 */
fileInput.addEventListener("change", () => {

  const file = fileInput.files[0];

  if (!file) return;

  audio.src = URL.createObjectURL(file);

});

/* 登録 */
confirmBtn.addEventListener("click", () => {

  if (!audio.src) return;

  childName = nameInput.value.trim() || "NoName";

  socket.emit("register-child", childName);

  registered = true;

  status.textContent = "登録済み";

});

/* ブラウザ音声ロック解除 */
activateBtn.addEventListener("click", () => {

  audio.play().then(() => audio.pause());
  adminAudio.play().then(() => adminAudio.pause());

});

/* 再接続時 */
socket.on("connect", () => {

  if (registered) {
    socket.emit("register-child", childName);
  }

});

/* child音声再生 */
socket.on("play", () => {

  if (registered) audio.play();

});

/* 停止 */
socket.on("stop", () => {

  if (!registered) return;

  audio.pause();
  audio.currentTime = 0;

  adminAudio.pause();
  adminAudio.currentTime = 0;

});

/* admin音声 */
socket.on("play-url", (url) => {

  if (!registered) return;

  adminAudio.src = url;

  adminAudio.load();

  adminAudio.play();

});

/* 音量 */
socket.on("volume", (v) => {

  if (!registered) return;

  audio.volume = v;
  adminAudio.volume = v;

});
