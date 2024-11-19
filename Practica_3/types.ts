import { ObjectId } from "mongodb";

export type BookModel={
    _id: ObjectId,
    tittle: string,
    author: string,
    year: number
}
export type Book={
    id: string,
    tittle: string,
    author: string,
    year: number
}
//    year: {type: number, require: true},