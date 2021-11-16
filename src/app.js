import express from 'express'
import cors from 'cors'
import listEndpoints from 'express-list-endpoints'
import userRouter from './services/user/index.js'
import chatRouter from './services/chat/index.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use("/users", userRouter)
app.use("/chats", chatRouter)

console.log(listEndpoints(app))

export {app}

