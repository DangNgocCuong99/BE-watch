import { RequestHandler } from "express"
import CartModel from "../model/cart"
import favoriteModel from "../model/favorite"
import { dataReturn, errorReturn, getErrorMessage } from "../ulti/hook"

export const getFavorite: RequestHandler = async (_req, res) => {
    try {
        const data = await favoriteModel.find({ userId: '123' })
        const listId = data.map((i) => i.productId)
        const dataProduct = await CartModel.findById(listId)
        res.send(dataReturn(dataProduct))
    } catch (error) {
        res.send(errorReturn(getErrorMessage(error)))
    }
}

export const handleFavorite: RequestHandler = async (req, res) => {
    try {
        const { userId, productId } = req.body
        const checkTrung = await favoriteModel.findOne({ userId: userId, productId: productId })
        if (checkTrung) {
            const data = await favoriteModel.findByIdAndDelete(checkTrung._id)
            res.send(dataReturn(data, "huy yeu thich thanh cong"))
        } else {
            const data = await favoriteModel.create({ userId: userId, productId: productId })
            res.send(dataReturn(data, "them yeu thich thanh cong"))
        }
    } catch (error) {
        res.send(errorReturn(getErrorMessage(error)))
    }
}