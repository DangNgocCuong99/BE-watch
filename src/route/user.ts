import express from "express"
import { getUser } from "../controller/user"
import { protect, restrictTo } from "../controller/auth"
const routerUser = express.Router()
routerUser.use(protect)

routerUser.get('/',restrictTo("admin"), getUser )

export default routerUser