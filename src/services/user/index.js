import express from 'express'
import UserSchema from './schema.js'
import { generateAccessToken } from '../auth/token.js'


const userRouter = express.Router()

userRouter.post("/account", async (req, res, next) =>{
  try {
      const newUser = await new UserSchema(req.body).save()
      const token = await generateAccessToken({_id: newUser._id})
    res.send({user: newUser, accessToken: token})

  } catch (error) {
    next(error)
  }
})

userRouter.get("/", async (req, res, next) =>{
  try {
    const userName = req.query.username
    const userEmail = req.query.email
    let user 
    if(!userName && !userEmail){

     user = await UserSchema.find({})
    } else {
      user = await UserSchema.find({ $or: [ { username:userName }, { email : userEmail} ] }
      )
    }
    res.send(user)

  } catch (error) {
    next(error)
  }
})

userRouter.post("/account", async (req, res, next) =>{
  try {
    
  } catch (error) {
    next(error)
  }
})
userRouter.post("/account", async (req, res, next) =>{
  try {
    
  } catch (error) {
    next(error)
  }
})

export default userRouter