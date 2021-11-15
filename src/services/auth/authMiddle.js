import createHttpError from "http-errors";
import { verifyJWT } from "./token.js";
import UserModel from "../user/schema.js";

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.body.accessToken) {
    next(
      createHttpError(
        401,
        "Please provide the access Token in request body! 👀"
      )
    );
  } else {
    try {
      const token = req.body.accessToken
      const decodedToken = await verifyJWT(token);
      const user = await UserModel.findById(decodedToken._id);
      if (user) {
        req.user = user;
        next();
      } else {
        next(createHttpError(404, "☠️ User not found!"));
      }
    } catch (err) {
      next(createHttpError(401, "☠️ Token not valid"));
    }
  }
};


