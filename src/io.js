import { Server } from "socket.io";
import { createServer } from "http";
import { app } from "./app.js";
import ChatSchema from "./services/chat/schema.js";
import { verifyJWT } from "./services/auth/token.js";
import createHttpError from "http-errors";
import UserSchema from "./services/user/schema.js";

export const httpServer = createServer(app);

const io = new Server(httpServer, { allowEIO3: true });

let onlineUsers = [];

io.on("connection", async (socket) => {
  try {
    const accessToken = socket.handshake.headers["access-token"];

    if (accessToken) {
      const decodedToken = await verifyJWT(accessToken);

      if (decodedToken) {
        const chatHistory = await ChatSchema.find({
          members: { $in: [decodedToken] }
        });

        const user = await UserSchema.findById(decodedToken);

        chatHistory.map((c) => {
          socket.join(c._id);
          socket.emit("join", c._id);
        });

        onlineUsers.push({
          username: user.username,
          _id: user._id,
          socketId: socket.id
        });
      }
    } else {
      const error = createHttpError(404, { message: "Missing access token" });
      socket.emit("error", error);
    }
  } catch (error) {
    socket.emit("error", error);
  }

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
  });

  socket.on("outgoing-msg", async ({message, requestTargetId})=> {
    try {
      console.log(message)
    const accessToken = socket.handshake.headers["access-token"];
    const decodedToken = await verifyJWT(accessToken);
    const requesterId = decodedToken;
    const reciverId = mongoose.Types.ObjectId(requestTargetId);
    message.sender = requesterId
    const commonChat = await ChatSchema.find({
      $and: [
        { members: { $in: [requesterId] } },
        { members: { $in: [reciverId] } }
      ]
    });
    // console.log(commonChat);

    if (commonChat.length > 0) {
      const updatedCommonChat = await ChatSchema.findByIdAndUpdate(
        commonChat[0]._id,
        { $push: { history: message } },
        { new: true }
      );
      console.log(updatedCommonChat)
        //1. send the new chat data to the other client, socket.to(clinetID).emit("incoming msg ", messageData)
        //2. make the other client refetch the message data socket.to(clientId).emit("incongi message", id of the chat)
    } else {
      const newChat = await new ChatSchema({
        members: [reciverId, requesterId],
        history: [message]
      }).save();
    }
  } catch (error) {
    socket.emit("error", error)
  }
});
  });


  // socket.on("incoming-msg")   


// connect
// disconnect
// outgoing-msg
// incoming-msg
