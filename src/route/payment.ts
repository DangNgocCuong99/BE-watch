import express from "express"
import { createPaymentUrl } from "../controller/vnpay"
const routerPayment = express.Router()
routerPayment.post('/', createPaymentUrl )

export default routerPayment