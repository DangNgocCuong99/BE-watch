import { RequestHandler } from 'express';
import UserModel from "../model/user"
import { dataReturn, errorReturn, getErrorMessage } from "../ulti/hook"


export const getUser: RequestHandler = async (req, res) => {
    try {
        const data = await UserModel.find()
        res.send(dataReturn(data))
    } catch (error) {
        res.send(errorReturn(getErrorMessage(error)))
    }
}

