import { User } from "./User";

export interface Post {
    id:        number 
    createdAt: string 
    updatedAt: string 
    title:     string   
    content?:   string
    published: boolean  
    author:    User 
    authorId:  number
}