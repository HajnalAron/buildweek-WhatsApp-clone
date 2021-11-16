import express from "express"
import { JWTAuthMiddleware } from "../auth/authMiddle.js"
import ChatSchema from "./schema.js"

const chatRouter = express.Router()


chatRouter.post("/", JWTAuthMiddleware, async(req, res, next) => {
    try {
        //First we have 2 id: one is the sender (req.user.id) and one the reciver ()
        const myId = req.user._id
        const membersArr = req.body.members
        
        const commonChat = await ChatSchema.find(
            { members: { $in: [membersArr, myId ] }})
            // {$and: [{members: {oneID}}, {members: {otherID}}]
    } catch (error) {
        next(error)
    }
})

chatRouter.get("/",async(req, res, next) => {
    try {
        
    } catch (error) {
        next(error)
    }
})

chatRouter.get("/:id",async(req, res, next) => {
    try {
        
    } catch (error) {
        next(error)
    }
})

chatRouter.post("/:id/image",async(req, res, next) => {
    try {
        
    } catch (error) {
        next(error)
    }
})
