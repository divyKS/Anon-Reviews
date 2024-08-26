import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { Message } from "@/model/User"

export async function POST(req: Request){
    await dbConnect()

    const { username, content } = await req.json() // content form the person who is sending the anon review for which username

    try {
        const user = await UserModel.findOne({username})
        if(!user){
            return Response.json({success:false, message: "user not found to send message to "}, {status: 404})
        }
        
        if(user.isAcceptingMessages){
            const newMessage = {
                content,
                createdAt: new Date()
            }
            
            user.messages.push(newMessage as Message)

            await user.save()

            return Response.json({success:true, message: "message has been sent successfully"}, {status: 200})
        }
        else{
            return Response.json({success:false, message: "user not accepting messages"}, {status: 403})
        }
    } catch (error) {
        console.log("error while sending message to user ", error)
        return Response.json({success:false, message: "message could not be sent to user"}, {status: 500})        
    }
}