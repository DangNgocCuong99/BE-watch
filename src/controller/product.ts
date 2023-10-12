import { RequestHandler } from "express"
import productModel from "../model/product"
import { dataReturn, errorReturn, getErrorMessage } from "../ulti/hook"
import FavoriteModel from "../model/favorite"

export const getProduct: RequestHandler = async (req, res)=>{
    try {
        const userId =123
        const data = await productModel.find()
        const listIdFavoriteProduct = (await FavoriteModel.find({userId: userId})).map((i)=> i.productId)
        data.map((i)=>(
            {
                ...data,
                favorite: listIdFavoriteProduct.includes(i._id)
            }
        ))
        res.send(dataReturn(data))
    } catch (error) {
        res.send(errorReturn(getErrorMessage(error)))
    }
}

// export const createProduct: RequestHandler = async (req) => {
    export const createProduct = async () => {
    try {
        // const dataBody = req.body
        const dataBody = {
            name: "san pham 2",
            originalPrice: 900000,
            discountedPrice: 1000,
            images: ["img1.jpg", "img2.jpg"],
        }
        const data = await productModel.create(dataBody)
        console.log(dataReturn(data,'them moi thanh cong'))
    } catch (error) {
        console.log(error)
    }
}

