export type IDataReturn = {
    status:boolean,
    data:unknown,
    message?:string
}

export type IErrorReturn = {
    status:boolean,
    message?:string
}

export enum accountStatusType {
    inactive="inactive" ,
    active="active" ,
    delete="delete" 
  }
export enum roleAccountType {
    admin="admin",
    user="user"
}