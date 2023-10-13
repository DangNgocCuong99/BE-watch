import express from "express"
import { inputOtp, login, register } from "../controller/auth"
const routerAuth = express.Router()
routerAuth.post('/register', register )
routerAuth.post('/login', login )
routerAuth.post('/otp',inputOtp)

export default routerAuth