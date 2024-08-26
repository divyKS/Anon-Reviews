import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    // next-auth has it's User, we are adding more fields to it
    interface User {
        _id?: string,
        isVerified?: boolean,
        isAcceptingMessages?: boolean,
        username?: string
    }
    
    interface Session{
        user:{
            _id?: string,
            isVerified?: boolean,
            isAcceptingMessages?: boolean,
            username?: string
        } & DefaultSession['user'] // the default session will have a key 'user', it's later if it does or does not have values inside it
    }
}

// alternate way to write
declare module "next-auth/jwt" {
    interface JWT{
        _id?: string,
        isVerified?: boolean,
        isAcceptingMessages?: boolean,
        username?: string
    }
}