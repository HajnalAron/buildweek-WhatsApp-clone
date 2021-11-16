import express from "express";
import { JWTAuthMiddleware } from "../auth/authMiddle.js";
import ChatSchema from "./schema.js";
import mongoose from "mongoose";
import { HttpError } from "http-errors";

const chatRouter = express.Router();

chatRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const requesterId = req.user._id;
    const reciverId = mongoose.Types.ObjectId(req.body.reciverId);
    const message = req.body.message;

    req.body.message.sender = requesterId;

    const commonChat = await ChatSchema.find({
      $and: [
        { members: { $in: [requesterId] } },
        { members: { $in: [reciverId] } }
      ]
    });
    console.log(commonChat);

    if (commonChat.length > 0) {
      const updatedCommonChat = await ChatSchema.findByIdAndUpdate(
        commonChat[0]._id,
        { $push: { history: message } },
        { new: true }
      );

      res.send(updatedCommonChat);
    } else {
      const newChat = await new ChatSchema({
        members: [reciverId, requesterId],
        history: [message]
      }).save();

      res.send(newChat);
    }
  } catch (error) {
    next(error);
  }
});

chatRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const chatHistory = await ChatSchema.find({
      members: { $in: [req.user._id] }
    });
    res.send(chatHistory);
  } catch (error) {
    next(error);
  }
});

chatRouter.get("/:id", async (req, res, next) => {
  try {
    const chat = await ChatSchema.findById(req.params.id);
    res.send(chat);
  } catch (error) {
    next(error);
  }
});

chatRouter.post("/:id/image", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const chat = await ChatSchema.findById(req.params.id);
    if (chat.members.includes(req.user._id)) {
      chat.picture = req.body.picture;
      chat.save();
      res.send(chat);
    } else {
      //create http errors
    }
  } catch (error) {
    next(error);
  }
});

export default chatRouter;
