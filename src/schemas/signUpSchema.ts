import { z } from "zod";

// this validation logic is for just one value hence no need of 
export const usernameValidation = z
    .string()
    .min(2, "Username should have a minimum length of 2")
    .max(12, "Username can have a maximum length of 12")
    .regex(/^[a-zA-Z0-9_]+$/, "Username should not contain special characters")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(6, "Password needs to have a minimum length of 6")
})