import mongoose from "mongoose";
import { accountStatusType, roleAccountType } from "../ulti/types";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email: { type: String },
  status: { type: String, default: accountStatusType.inactive },
  otp: { type: String,default:"" },
  role: { type: String, default: roleAccountType.user },
  createdAt: { type: Date, default: Date.now }
});
const UserModel = mongoose.model('user', userSchema);
export default UserModel
