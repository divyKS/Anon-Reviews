import dbConnect from "@/lib/dbConnect"
import User from "@/model/User"
import {z} from "zod"
import { usernameValidation, signUpSchema } from "@/schemas/signUpSchema"
import { NextRequest } from "next/server"

// from the usernameValidation schema we will make a query schema, and then just run the safeParse() on this schema
const usernameQuerySchema = z.object({
    username: usernameValidation
})

// before sending the data to the db, we want the data to be checked - while the user is typing and before the submit button has been pressed
export async function GET(req: NextRequest){

    // can be used in routes where we have to tell that only a certain type of request would be accepted
    // if(req.method !== "GET"){
    //     return Response.json({success: false, message: "Method not allowed"}, {status: 405})
    // }
    // not works now, 

    await dbConnect()
    
    try {
        // the username will be a query parameter
        const { searchParams } = new URL(req.url) // localhost:3000/api/check-username-unique?username=one?phone=android

        // has to be made an object
        const queryParam = {
            username: searchParams.get("username")
        }
        // now validating it with zod
        const result = usernameQuerySchema.safeParse(queryParam)
        // TODO:check this log
        // console.log(result)

        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({success: false, message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "Invalid query parameters"}, {status: 400})
        }

        const { username } = result.data // this username is confirmed to follow our zod rules

        // TODO: this logic of unverified username can be taken if that account verifies first
        // const userAlreadyExists = await User.findOne({username, isVerified: true})
        const userAlreadyExists = await User.findOne({username})

        if(userAlreadyExists){
            return Response.json({success: false, message: "Username has been already taken"}, {status: 400})
        }
        
        return Response.json({success: true, message: "Username is available"}, {status: 400})
        
    } catch (error) {
        console.log("error checking uniqueness of username ", error)
        return Response.json({success: false, message: "error checking username"}, {status: 500})
    }
}

