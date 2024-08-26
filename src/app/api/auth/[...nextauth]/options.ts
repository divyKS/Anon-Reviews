import dbConnect from "@/lib/dbConnect";
import {NextAuthOptions} from "next-auth";
import CredentailsProviders  from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import User from "@/model/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentailsProviders({
            id: "credentials",
            name: "Credentials",
            credentials: {
                // these are the fields that we need on the frontend while signing in
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                // for a custom credential way, nextauth does not know how to authorize, so we have to right that ourselves
                await dbConnect()
                try {
                    // we do not know which one should would be used to signin the user, so we put in both conditions using the $or operator, now we can put in the various conditions in the array that follows
                    const user = await User.findOne({$or: [{email: credentials.identifier.email}, {username: credentials.identifier.username}]})
                    
                    if(!user){
                        throw new Error("User not found with this email/username")
                    }
                    
                    if(!user.isVerified){
                        throw new Error("Please verify your account before logging in")
                    }
                    
                    // TODO: log credentials
                    // username is found in identifier, password isn't, (log credentials to check)
                    const passMatch = await bcrypt.compare(credentials.password.toString(), user.password)

                    if(passMatch){
                        return user // all this logic here was done to return user from this function, and it is returned to the provider
                    }
                    else{
                        throw new Error("Credentials do not match")
                    }

                } catch (error: any) {
                    throw new Error(error)
                }
            },
        })
    ],
    callbacks: {
        // we have to change these - by default the token would have just the token & session, here we want them to have a lot of more info, saves querying to db
        async session({session, token}) {
            // only return session from here
            if(token){
                session.user._id = token._id?.toString()
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
        },
        async jwt({token, user}){
            // only return the token from here
            // this user is the one that we returned from the authorize() above
            if(user){
                token._id = user._id?.toString() // the next-auth user does not have all these types, so we are adding these in the types folder by creating a type file for the next-auth
                token.isVerified = user.isVerified
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }
            return token
        }
    },
    pages: {
        // the things that we want to override
        // so that our route isn't the default api/auth/signin
        // now it is api/signin
        signIn: "/signin"
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXT_AUTH_SECRET
}