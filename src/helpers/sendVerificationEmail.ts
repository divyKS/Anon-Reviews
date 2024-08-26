import { resend } from "@/lib/resend"
import VerificationEmail from '../../emails/VerificationEmail'
import { ApiResponse } from '@/types/ApiResponse'

// # TODO: how all these email sending services work

export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse> {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'TrulyAnon - Verification Email',
            react: VerificationEmail({ username, otp: verifyCode }),
        });
        return {success: true, message: "Verification email sent successfully"}
    } catch (error) {
        console.log("Could not send verification email")
        console.log(error)
        return {success:false, message: "Failed to send verification email"}
    }
}