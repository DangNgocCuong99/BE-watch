import express from "express"
import { login, register } from "../controller/auth"
const routerAuth = express.Router()
routerAuth.post('/register', register )
routerAuth.post('/login', login )

export default routerAuth