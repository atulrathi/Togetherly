const { Server } = require("socket.io");
const Message = require("../models/Message.model");

let io;

const initSocket = (server) => {

  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("send_message", async (data) => {

      const message = await Message.create(data);

      io.to(data.receiverId).emit("receive_message", message);

    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });

  });

};

module.exports = { initSocket };