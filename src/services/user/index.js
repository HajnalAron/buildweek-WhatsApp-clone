import express from "express";
import UserSchema from "./schema.js";
import { generateAccessToken } from "../auth/token.js";
import { JWTAuthMiddleware } from "../auth/authMiddle.js";

const userRouter = express.Router();

userRouter.post("/account", async (req, res, next) => {
  try {
    const newUser = await new UserSchema(req.body).save();
    const token = await generateAccessToken({ _id: newUser._id });
    res.send({ user: newUser, accessToken: token });
  } catch (error) {
    next(error);
  }
});

userRouter.get("/", async (req, res, next) => {
  try {
    const userName = req.query.username;
    const userEmail = req.query.email;
    let user;
    if (!userName && !userEmail) {
      user = await UserSchema.find({});
    } else {
      user = await UserSchema.find({
        $or: [{ username: userName }, { email: userEmail }]
      });
    }
    res.send(user);
  } catch (error) {
    next(error);
  }
});

userRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const filter = { _id: req.user._id };
    console.log(filter);
    const update = { ...req.body.newUserData };
    console.log(update);
    const updatedUser = await UserSchema.findOneAndUpdate(filter, update, {
      returnOriginal: false
      //new: true
    });
    console.log(updatedUser);
    await updatedUser.save();
    res.send(updatedUser);
  } catch (error) {
    next(error);
  }
});
userRouter.post("/me/avatar", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const filter = { _id: req.user._id };
    console.log(req.user);

    const update = { ...req.user._doc, avatar: req.body.newUserData.avatar };
    console.log(update);
    const updatedUser = await UserSchema.findOneAndUpdate(filter, update, {
      returnOriginal: false
    });

    await updatedUser.save();
    res.send(updatedUser);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/user/:id", async (req, res, next) => {
  try {
    console.log(req.params);
    const user = await UserSchema.findById(req.params.id);
    console.log(user);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/session", async (req, res, next) => {
  try {
    const user = await UserSchema.checkCredentials(req.body);
    const newAccessToken = await generateAccessToken({ _id: user._id });
    console.log(newAccessToken);

    res.send(newAccessToken);
  } catch (error) {
    next(error);
  }
});

export default userRouter;
