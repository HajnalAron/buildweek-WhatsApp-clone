import { Server } from "socket.io";
import { createServer } from "http";
import { app } from "./app.js";
import ChatSchema from "./services/chat/schema.js";
import { verifyJWT } from "./services/auth/token.js";

export const httpServer = createServer(app);

const io = new Server(httpServer, { allowEIO3: true });

io.on("connection", async (socket) => {
  const accessToken = socket.handshake.headers["access-token"];
  const decodedToken = await verifyJWT(accessToken);
  const chatHistory = await ChatSchema.find({
    members: { $in: [decodedToken] }
  });
  chatHistory.map((c) => {
    socket.join(c._id);
    socket.emit("join", c._id);
  });
});
