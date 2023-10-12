import { IDataReturn, IErrorReturn } from "./types"

export const dataReturn  = (data:unknown,message?:string):IDataReturn=>{
    return {
        status:true,
        data:data,
        message:message
    }
}

export const errorReturn  = (message?:string):IErrorReturn=>{
    return {
        status:false,
        message:message
    }
}

export const getErrorMessage = (error: unknown) =>{
    if (error instanceof Error) return error.message
    return String(error)
  }