import { Server } from "socket.io";
import { createServer } from "http";
import { app } from "./app.js";
import ChatSchema from "./services/chat/schema.js";
import { verifyJWT } from "./services/auth/token.js";
import createHttpError from "http-errors";
import UserSchema from "./services/user/schema.js";
import { request } from "express";

export const httpServer = createServer(app);

const io = new Server(httpServer, { allowEIO3: true });

let onlineUsers = [];

io.on("connection", async (socket) => {
  try {
    const accessToken = socket.handshake.auth["Access-Token"];

    if (accessToken) {
      const decodedToken = await verifyJWT(accessToken);
      if (decodedToken) {
        const chatRooms = await ChatSchema.find({
          members: { $in: [decodedToken._id] }
        });
        const user = await UserSchema.findById(decodedToken._id);
        onlineUsers.push({
          username: user.username,
          _id: user._id,
          socketId: socket.id,
          rooms: []
        });
        // const userRoomArrayIndex = onlineUsers.findIndex(
        //   (targetUser) => user._id === targetUser._id
        // );

        chatRooms.map((r) => {
          console.log(r._id, "room join id");
          socket.join(r._id.valueOf());
          socket.emit("join", r._id);
        });

        // onlineUsers.rooms.map((r) => {
        //   socket.to(r).emit("userLoggedIn", user_id);
        // });
      }
    } else {
      const error = createHttpError(404, { message: "Missing access token" });
      socket.emit("disconnect", error);
    }
  } catch (error) {
    socket.emit("error", error);
    socket.disconnect();
  }

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
    // onlineUsers.rooms.map((r) => {
    //   socket.to(r).emit("userLoggedOut", user_id);
    // });
  });

  socket.on("outgoing-msg", async (requestData) => {
    try {
      const { message, requestTargetId } = requestData;
      const accessToken = socket.handshake.auth["Access-Token"];
      const decodedToken = await verifyJWT(accessToken);
      message.sender = decodedToken;

      const commonChat = await ChatSchema.find({
        $and: [
          { members: { $in: [decodedToken] } },
          { members: { $in: [requestTargetId] } }
        ]
      });
      if (commonChat.length > 0) {
        const updatedCommonChat = await ChatSchema.findByIdAndUpdate(
          commonChat[0]._id,
          { $push: { history: message } },
          { new: true }
        );
        io.to(updatedCommonChat._id.valueOf()).emit(
          "incoming-msg",
          updatedCommonChat._id
        );
      } else {
        const newChat = await new ChatSchema({
          members: [requestTargetId, decodedToken],
          history: [{ ...message }]
        }).save();

        const targetSocket = onlineUsers.find(
          (user) => user._id.valueOf() === requestTargetId
        );

        socket.emit("join", newChat._id.valueOf());
        socket.to(targetSocket.socketId).emit("join", newChat._id.valueOf());
        socket.emit("incoming-msg", newChat._id);
        io.to(targetSocket.socketId).emit("incoming-msg", newChat._id);
      }
    } catch (error) {
      socket.emit("error", error);
    }
  });
});
