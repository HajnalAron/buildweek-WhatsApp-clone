import mongoose from "mongoose"

const { Schema, model } = mongoose

const MessageSchema = new Schema(
    {
        sender: {type: Schema.Types.ObjectId, ref: "User", required: true},
        content: {
            text: {type: String},
            media: {type: String}
        }
    },
    {
        timestamps: true
    }
    )


const ChatSchema = new Schema(
    {
        members: [{type: Schema.Types.ObjectId, ref: "User", required: true}],
        // name: {type: String},
        history: { default:[], type: [MessageSchema]},      
    }
)

ChatSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.__v
  return userObject
}

export default model("Chat", ChatSchema)