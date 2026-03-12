const multer = require("multer");
const path = require("path");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use(express.static(__dirname));
app.use("/audio", express.static("audio"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "audio"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

app.post("/upload", upload.single("audio"), (req, res) => {
  res.json({ url: "/audio/" + req.file.filename });
});

let children = {};
let uploadedAudio = "";

function broadcastList() {

  const list = Object.entries(children).map(([id, data]) => ({
    id,
    name: data.name
  }));

  io.emit("children-list", list);
}

io.on("connection", (socket) => {

  socket.emit("children-list",
    Object.entries(children).map(([id, data]) => ({
      id,
      name: data.name
    }))
  );

  socket.on("register-child", (name) => {

    children[socket.id] = {
      socket,
      name
    };

    broadcastList();
  });

  socket.on("disconnect", () => {

    delete children[socket.id];

    broadcastList();
  });

  socket.on("play", (id) => {
    children[id]?.socket.emit("play");
  });

  socket.on("stop", (id) => {
    children[id]?.socket.emit("stop");
  });

  socket.on("volume", ({ id, value }) => {
    children[id]?.socket.emit("volume", value);
  });

  /* admin音声アップロード通知 */
  socket.on("upload-audio", (url) => {
    uploadedAudio = url;
  });

  /* admin音声再生 */
  socket.on("play-admin-audio", (id) => {

    if (!uploadedAudio) return;

    children[id]?.socket.emit("play-url", uploadedAudio);

  });

});

server.listen(3000, () => {
  console.log("サーバーが起動したよ！");
});
