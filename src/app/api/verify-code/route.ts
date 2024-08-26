import dbConnect from "@/lib/dbConnect"
import User from "@/model/User"

export async function POST(req: Request){
    await dbConnect()
    
    try {
        const { username, otpReceived } = await req.json()
        const decodedUsername = decodeURIComponent(username) // if we take something from url, its better to pass it through this function to be able to get the things as we want from the url, like ' ' would be replaced by %20 in the url, but we want the original blank space

        const user = await User.findOne({username: decodedUsername})

        if(!user){
            return Response.json({success: false, message: "User not found"}, {status: 500})
        }
        
        const isValidOTP = user.verifyCode === otpReceived
        const isOTPNotExpired = new Date(user.verifyCodeExpiry) > new Date()
        
        if(isValidOTP && isOTPNotExpired){
            user.isVerified = true
            await user.save()
            return Response.json({success: true, message: "User has been verified successfully"}, {status: 200})
        }
        else if(!isValidOTP){
            return Response.json({success: false, message: "Entered OTP is incorrect"}, {status: 500})
        }
        else if(!isOTPNotExpired){
            // TODO: signup to get a new verification code
            return Response.json({success: false, message: "This OTP is no longer valid, the verification code has expired, request again for a new verification code"}, {status: 500})
        }
    } catch (error) {
        console.log("Error in verifying user, ", error)
        return Response.json({success: false, message: "Error verifying user"}, {status: 500})
    }
}