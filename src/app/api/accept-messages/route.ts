import { getServerSession } from "next-auth" // function to help with getting to know the session on the backend, since the frontend wont be telling which user is logged in or so, we need to figure that out ourselves + frontend can any request and we should not rely on that for certainty of the problem
import { authOptions } from "../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { User } from "next-auth"

// toggle option of accepting messages
export async function POST(req: Request){
    await dbConnect()

    const session = await getServerSession(authOptions) // to get the currently logged in user
    // another benefit of getting authOptions separately since this function needs the authOptions

    // the User type from next-auth
    const currentUser: User = session?.user as User // idk why has to assert

    if(!session || !session.user){
        return Response.json({success: false, message: "Not authenticated, no session found"}, {status: 401})
    }

    const userId = currentUser._id

    const {acceptMessages} = await req.json() // from the frontend, we will get the toggle from the frontend request

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, {isAcceptingMessage: acceptMessages}, {new: true}) // new true returns us the user with updated values
        
        if(!updatedUser){
            return Response.json({success: false, message: "failed to update user status to accept messages"}, {status: 401})
        }
        return Response.json({success: true, message: "message acceptance status updated successfully", updatedUser}, {status: 200})
        
    } catch (error) {
        console.log("failed to update user status to accept messages")
        return Response.json({success: false, message: "failed to update user status to accept messages"}, {status: 500})
    }
}

// to check if the user is accepting messages or not
export async function GET(req: Request){
    await dbConnect()

    const session = await getServerSession(authOptions)
    const currentUser: User = session?.user as User

    if(!session || !session.user){
        return Response.json({success: false, message: "Not authenticated, no session found"}, {status: 401})
    }

    const userId = currentUser._id

    try {
        const user = await UserModel.findById({userId})

        if(!user){
            return Response.json({success: false, message: "user not found "}, {status: 404})
        }
        
        return Response.json({success: true, isAcceptingMessages: user.isAcceptingMessages}, {status: 200})
    } catch (error) {
        console.log("failed to check the status of the user regarding accepting of messages")
        return Response.json({success: false, message: "error in getting message accepting status"}, {status: 500})
    }
}