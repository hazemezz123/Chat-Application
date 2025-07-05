import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}
const userSocketMap = {}; //
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chat-application-git-socket-integr-554003-hazemezz123s-projects.vercel.app",
    ],
  },
});

io.on("connection", (socket) => {
  console.log("A user is Connected", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
export { io, app, server };
