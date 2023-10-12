import express from "express"
import { isLoggedIn } from "../controller/auth"
import { getFavorite } from "../controller/favorite"
const routerFavorite = express.Router()
routerFavorite.get('/',isLoggedIn, getFavorite )

export default routerFavorite