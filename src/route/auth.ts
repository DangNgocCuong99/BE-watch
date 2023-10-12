import express from "express"
import { login, register } from "../controller/auth"
const routerAuth = express.Router()
routerAuth.get('/register', register )
routerAuth.get('/login', login )

export default routerAuth