const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

/* upload */
app.post("/upload", upload.single("audio"), (req, res) => {

  const dir = "./audio";

  fs.readdir(dir, (err, files) => {

    if (err) return;

    if (files.length > 5) {

      const sorted = files
        .map(f => ({
          name: f,
          time: fs.statSync(dir + "/" + f).mtime.getTime()
        }))
        .sort((a,b)=>a.time-b.time);

      const remove = sorted.slice(0, files.length - 5);

      remove.forEach(f => {
        fs.unlinkSync(dir + "/" + f.name);
      });

    }

  });

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

  socket.on("upload-audio", (url) => {
    uploadedAudio = url;
  });

  socket.on("play-admin-audio", (id) => {

    if (!uploadedAudio) return;

    children[id]?.socket.emit("play-url", uploadedAudio);

  });

});

server.listen(3000, () => {
  console.log("サーバーが起動したよ！");
});
