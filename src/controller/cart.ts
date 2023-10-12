import { RequestHandler } from "express"
import cartModel from "../model/cart"
import ProductModel from "../model/product"
import { dataReturn, errorReturn, getErrorMessage } from "../ulti/hook"

export const getCart: RequestHandler = async (_req, res) => {
    try {
        const data = await cartModel.find({ userId: '123' })
        const listIdProduct = data.map((i) => i.productId)
        const dataProduct = await ProductModel.findById(listIdProduct)
        res.send(dataReturn(dataProduct))
    } catch (error) {
        res.send(errorReturn(getErrorMessage(error)))
    }
}


export const addCart: RequestHandler = async (req, res) => {
    try {
        const { userId, productId } = req.body
        const checkTrung = await cartModel.findOne({ userId: userId, productId: productId })
        if (checkTrung) {
            const data = await cartModel.findByIdAndUpdate(checkTrung._id, { quantity: checkTrung.quantity + 1 })
            res.send(dataReturn(data,"them moi thanh cong"))
        } else {
            const data = await cartModel.create({ productId: productId, quantity: checkTrung.quantity, userId: userId })
            res.send(dataReturn(data,"them moi thanh cong"))
        }
    } catch (error) {
        res.send(errorReturn(getErrorMessage(error)))
    }
}

