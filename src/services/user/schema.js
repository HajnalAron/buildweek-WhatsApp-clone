import mongoose from "mongoose";
import bcrypt from 'bcrypt'

export const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, required: false }
});

UserSchema.pre("save", async function (next) {

  const User = this
  if (User.isModified("password")) {
    User.password = await bcrypt.hash(User.password, 10);
  }
  next()
});

UserSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.password
  delete userObject.__v
  
  return userObject
}

UserSchema.statics.checkCredentials = async function ({email, password}) {
  const user = await this.findOne({email})
console.log({email, password, user})
  if(user) {
    const isMatch = await bcrypt.compare(password, user.password)
    if(isMatch) return user

    else return false
  } else return false
}

export default mongoose.model("User", UserSchema)