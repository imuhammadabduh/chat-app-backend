const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const feedRoutes = require("./routes/feedRouters");
const messageRoutes = require("./routes/messageRouter");
const User = require("./models/User");
const Message = require("./models/Message");
const roomsStatic = [
  "Info UAD",
  "Belajar Programming",
  "Info Makan & Minuman",
  "Pengejar Sunnah",
  "Teknologi Terkini",
  "Anak Editor",
  "Asupan Ngakak",
  "Modif Kendaraan",
  "Pecinta Kucing",
  "Wibu Bau Bawang",
];
const cors = require("cors");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/users", userRoutes);
app.use("/feeds", feedRoutes);
app.use("/msg", messageRoutes);
require("./connection");

const server = require("http").createServer(app);
const PORT = process.env.PORT || 5001;
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

async function getLastMessagesFromRoom(room) {
  let roomMessages = await Message.aggregate([
    { $match: { to: room } },
    { $group: { _id: "$date", messagesByDate: { $push: "$$ROOT" } } },
  ]);
  return roomMessages;
}

function sortRoomMessagesByDate(messages) {
  return messages.sort(function (a, b) {
    let date1 = a._id.split("/");
    let date2 = b._id.split("/");

    date1 = date1[2] + date1[0] + date1[1];
    date2 = date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1;
  });
}

// socket connection

io.on("connection", (socket) => {
  socket.on("new-user", async () => {
    async function getCountMsg(data) {
      // const result = await Message.f({ to: data });
      return result
    }
    let members = [];
    const resultMembers = await User.find();
    // for (let member of resultMembers) {
    //   // const dataCount = await getCountMsg(member)
    //   // members.push({room,dataCount})
    // }
    io.emit("new-user", resultMembers);
  });

  socket.on("join-room", async (newRoom, previousRoom) => {
    socket.join(newRoom);
    socket.leave(previousRoom);
    let roomMessages = await getLastMessagesFromRoom(newRoom);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit("room-messages", roomMessages);
  });

  socket.on("message-room", async (room, content, sender, time, date) => {
    const newMessage = await Message.create({
      content,
      from: sender,
      time,
      date,
      to: room,
    });
    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    // sending message to room
    io.to(room).emit("room-messages", roomMessages);
    socket.broadcast.emit("notifications", room);
  });

  app.delete("/logout", async (req, res) => {
    try {
      const { _id, newMessages } = req.body;
      const user = await User.findById(_id);
      user.status = "offline";
      user.newMessages = newMessages;
      await user.save();
      const members = await User.find();
      socket.broadcast.emit("new-user", members);
      res.status(200).send();
    } catch (e) {
      console.log(e);
      res.status(400).send();
    }
  });
});

app.get("/rooms", async (req, res) => {
  let rooms = [];
  async function getCountMsg(data) {
    const result = await Message.countDocuments({ to: data });
    return result
  }
  for (let room of roomsStatic) {
    const dataCount = await getCountMsg(room)
    rooms.push({room,dataCount})
  }

  res.json(rooms);
});

server.listen(PORT, () => {
  console.log("listening to port", PORT);
});
