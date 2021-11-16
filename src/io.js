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

  //   socket.on("outgoing-msg");
  //   socket.on("incoming-msg");
});

// connect
// disconnect
// outgoing-msg
// incoming-msg
