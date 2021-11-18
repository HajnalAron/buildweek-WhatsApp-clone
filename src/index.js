import { app } from "./app.js";
import mongoose from "mongoose";
import list from "express-list-endpoints";
import { httpServer } from "./io.js";

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("Connected to Mongo");
  app.listen(process.env.PORT, () => {
    httpServer.listen(process.env.HTTP_PORT);
    console.log("Server is running on port " + process.env.PORT);
    console.log(list(app));
  });
});
