const socket = io();

const audio = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");
const confirmBtn = document.getElementById("confirm");
const activateBtn = document.getElementById("activate");
const status = document.getElementById("status");
const nameInput = document.getElementById("nameInput");

let registered = false;
let childName = "";

// 音声選択
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    audio.src = URL.createObjectURL(file);
  }
});

// 登録確定
confirmBtn.addEventListener("click", () => {

  if (!audio.src) return;

  childName = nameInput.value.trim() || "NoName";

  socket.emit("register-child", childName);

  registered = true;

  status.textContent = "登録済み";

});

// ブラウザ音声ロック解除
activateBtn.addEventListener("click", () => {
  audio.play().then(() => audio.pause());
});

// 再接続時の自動再登録
socket.on("connect", () => {
  if (registered) {
    socket.emit("register-child", childName);
  }
});

// 再生
socket.on("play", () => {
  if (registered) audio.play();
});

// 停止
socket.on("stop", () => {
  if (registered) {
    audio.pause();
    audio.currentTime = 0;
  }
});

// URL音声再生（親アップロード）
socket.on("play-url", (url) => {
  if (!registered) return;

  audio.src = url;
  audio.play();
});

// 音量変更
socket.on("volume", (v) => {
  if (registered) audio.volume = v;
});
