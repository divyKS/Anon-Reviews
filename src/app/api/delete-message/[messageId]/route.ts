//  message is inside an array of messages, fetch all, filter, then update again
// or use pull operator

import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { User } from "next-auth"
 
// weird TS
export async function DELETE(req: Request, {params}: {params: {messageId: string}}){
    const messageId = params.messageId
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    const currentUser: User = session?.user as User 

    if(!session || !session.user){
        return Response.json({success: false, message: "Not authenticated, no session/user found, can not get messages"}, {status: 401})
    }
    
    try {
        const updatedMessages = await UserModel.updateOne(
            {_id: currentUser._id},
            {$pull: {messages: {_id: messageId}}}
        )
        if(updatedMessages.modifiedCount == 0){
            return Response.json({success: false, message: "Message not found/already deleted"}, {status: 404})
        }
        return Response.json({success: true, message: "Message deleted"}, {status: 200})
        
    } catch (error) {
        console.log("error in delete message route, " , error)
        return Response.json({success: false, message: "Error deleting message"}, {status: 500})        
    }

}