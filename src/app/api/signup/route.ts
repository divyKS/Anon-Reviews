import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { NextRequest, NextResponse } from "next/server";

function getOTP(): string{
    return Math.floor(Math.random()*900000 + 100000).toString()
}

export async function POST(req: NextRequest){
    await dbConnect()

    try {
        const { username, email, password } = await req.json()
        const userWithSameEmail = await User.findOne({email})
        const userWithSameUsername = await User.findOne({username})

        // const existingVerifiedUserByUsername = await User.findOne({username,isVerified: true})
        
        if(userWithSameEmail){
            return NextResponse.json({success: false, message: "An account is already associated with this email"}, {status: 400})
        }
        
        if(userWithSameUsername){
            return NextResponse.json({success: false, message: "This username is already taken"}, {status: 400})
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        const verifyCode = getOTP()
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry: expiryDate,
            isVerified: false,
            isAcceptingMessages: false,
            messages: []
        })

        await newUser.save()

        // sending verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode)
        console.log("Email response - " + emailResponse)

        if(!emailResponse.success){
            return NextResponse.json({success: false, message: emailResponse.message}, {status: 400})
        }
        
        return NextResponse.json({success: true, message: "User registered successfully. Please verify you email"}, {status: 200})

    } catch (error) {
        console.log("Signup error ", error)
        return NextResponse.json({success: false, message: "Error in signup"}, {status: 500})
    }
     
}
