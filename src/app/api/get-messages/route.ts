import { getServerSession } from "next-auth" // function to help with getting to know the session on the backend, since the frontend wont be telling which user is logged in or so, we need to figure that out ourselves + frontend can any request and we should not rely on that for certainty of the problem
import { authOptions } from "../auth/[...nextauth]/options"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { User } from "next-auth"
import mongoose from "mongoose"

export async function GET(req: Request){
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    const currentUser: User = session?.user as User 

    if(!session || !session.user){
        return Response.json({success: false, message: "Not authenticated, no session/user found, can not get messages"}, {status: 401})
    }

    // const userId = currentUser._id
    // this would be string since we did that in the options.ts file, this in model.find/findById etc. is taken care of internally, but if we use aggregation pipelines there it will surely have error

    const userId = new mongoose.Types.ObjectId(currentUser._id)

    try {
        const user = await UserModel.aggregate([
            {$match: {id: userId}}, // find the user with given id
            {$unwind: "$messages"},
            {$sort: {"$messages.createdAt": -1}},
            {$group: {_id: "$_id", messages: {$push: "$messages"}}} //group all those broken down documents based on id and create a messages field and push all the messages field in the broken down documents into the message field
        ])

        if(!user || user.length === 0){
            return Response.json({success: false, message: "User not found, no messages could be found"}, {status: 401})
        }
        
        // see return type of aggregation pipelines
        return Response.json({success: true, messages: user[0].messages}, {status: 200})

    } catch (error) {
        return Response.json({success: false, message: "User not found, no messages could be found"}, {status: 401})
    }
}