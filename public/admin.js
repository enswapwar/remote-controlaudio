// socket接続
const socket = io();

// UI取得
const select = document.getElementById("childSelect");
const fileInput = document.getElementById("uploadAudio");
const sendBtn = document.getElementById("sendAudio");
const playBtn = document.getElementById("play");
const stopBtn = document.getElementById("stop");
const volume = document.getElementById("volume");


// 子機リスト更新
socket.on("children-list", (list) => {

  select.innerHTML = "";

  list.forEach(child => {

    const option = document.createElement("option");

    option.value = child.id;      // 内部制御用ID
    option.textContent = child.name; // 表示用名前

    select.appendChild(option);

  });

});


// 通常再生
playBtn.onclick = () => {

  if (!select.value) return;

  socket.emit("play", select.value);

};


// 停止
stopBtn.onclick = () => {

  if (!select.value) return;

  socket.emit("stop", select.value);

};


// 音量
volume.oninput = (e) => {

  if (!select.value) return;

  socket.emit("volume", {
    id: select.value,
    value: parseFloat(e.target.value)
  });

};


// アップロードだけ
sendBtn.onclick = async () => {

  if (!fileInput.files[0]) return;

  const form = new FormData();
  form.append("audio", fileInput.files[0]);

  const res = await fetch("/upload", {
    method: "POST",
    body: form
  });

  const data = await res.json();

  socket.emit("upload-audio", data.url);

};


// admin音声再生
document.getElementById("playAdminAudio").onclick = () => {

  if (!select.value) return;

  socket.emit("play-admin-audio", select.value);

};
