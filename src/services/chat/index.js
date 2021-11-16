import express from "express"
import { JWTAuthMiddleware } from "../auth/authMiddle.js"
import ChatSchema from "./schema.js"

const chatRouter = express.Router()


chatRouter.post("/", JWTAuthMiddleware, async(req, res, next) => {
    try {
        //First we have 2 id: one is the sender (req.user.id) and one the reciver ()
        const requesterId = req.user._id
        const reciverId = req.body.reciverId
        const message  = req.body.message
       
        
        const commonChat = await ChatSchema.find(
            // { members: { $in: [membersArr, myId ] }})
            // {$and: [{members: {oneID}}, {members: {otherID}}]
            {$and:[{ members: { $in: [ requesterId ] }} , {members:{$in:[reciverId]}} ] })
            if(commonChat && commonChat.members.length === 2) {
                ChatSchema.findOneAndUpdate({_id:commonChat._id},{$push:{history: message}})
            }
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
