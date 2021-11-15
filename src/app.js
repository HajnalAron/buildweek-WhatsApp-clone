import express from 'express'
import cors from 'cors'
import listEndpoints from 'express-list-endpoints'
import userRouter from './services/user'

const app = express()
app.use(cors())
app.use(express.json())

app.use("/users", userRouter)

console.log(listEndpoints(app))

export {app}

