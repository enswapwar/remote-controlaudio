const socket = io();

const select = document.getElementById("childSelect");
const fileInput = document.getElementById("uploadAudio");
const sendBtn = document.getElementById("sendAudio");
const playBtn = document.getElementById("play");
const stopBtn = document.getElementById("stop");
const volume = document.getElementById("volume");
const playAdminAudio = document.getElementById("playAdminAudio");

socket.on("children-list", (list) => {

  select.innerHTML = "";

  list.forEach(child => {

    const option = document.createElement("option");

    option.value = child.id;
    option.textContent = child.name;

    select.appendChild(option);

  });

});

playBtn.onclick = () => {

  if (!select.value) return;

  socket.emit("play", select.value);

};

stopBtn.onclick = () => {

  if (!select.value) return;

  socket.emit("stop", select.value);

};

volume.oninput = (e) => {

  if (!select.value) return;

  socket.emit("volume", {
    id: select.value,
    value: parseFloat(e.target.value)
  });

};

sendBtn.onclick = async () => {

  if (!fileInput.files.length) return;

  const form = new FormData();
  form.append("audio", fileInput.files[0]);

  const res = await fetch("/upload", {
    method: "POST",
    body: form
  });

  const data = await res.json();

  socket.emit("upload-audio", data.url);

  alert("音声アップロード完了");

};

playAdminAudio.onclick = () => {

  if (!select.value) return;

  socket.emit("play-admin-audio", select.value);

};
