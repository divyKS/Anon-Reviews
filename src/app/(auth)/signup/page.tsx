"use client"
import * as z from "zod"
import { useForm } from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceValue, useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function SignInPage(){
    const [username, setUsername] = useState("")
    const [usernameMsg, setUsernameMsg] = useState("")
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    // const [debouncedUsername, setDebouncedUsername] = useDebounceValue(username, 300)
    const debounced = useDebounceCallback(setUsername, 300)
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            email: "",
            password: ""
        }
    })

    useEffect(() => {        
        const checkUsernameUniqueness = async () => {
            if(username){
                setIsCheckingUsername(true)
                setUsernameMsg("") // to reset the previous value/error, if any
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`)
                    setUsernameMsg(response.data.message)
                } catch (error: any) {
                    setUsernameMsg(error.response?.data.message || "Error in checking for uniqueness")
                } finally {
                    setIsCheckingUsername(false)
                }
            }
        }
        checkUsernameUniqueness()
    }, [username])

    const handleOnSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        // TODO: check this
        // console.log(data)
        try {
            const response = await axios.post<ApiResponse>('/api/signup', data)
            toast({
                title: "Success",
                description: response.data.message,
            })
            router.replace(`/verify/${username}`)
            setIsSubmitting(false)
        } catch (error: any) {
            console.log("error in signup of user ", error)
            const errorMsg = error.response?.data.message
            toast({
                title: "Signup failed",
                description: errorMsg,
                variant: "destructive"
            })
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join <i>Anon&True</i>
                    </h1>
                    <p className="mb-4">Sign up to start your anonymous adventure</p>
                </div>
                    
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-6">
                            <FormField
                                name="username"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Username"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e)
                                                    debounced(e.target.value) // not needed with react hook form, this we have to do for our state that we are maintaining
                                                }}
                                            />
                                        </FormControl>
                                        {isCheckingUsername && <Loader2 className="animate-spin" />}
                                        <p className={`text-sm ${usernameMsg === "Username is available" ? "text-green-500" : "text-red-500"}`}>
                                            test {usernameMsg}
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="email"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Email"
                                                {...field}
                                                // at the time of typing out we aren't doing anything, when the submit button is pressed then all that will happen automatically
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="password"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="password"
                                                placeholder="Password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSubmitting}>
                                {
                                    isSubmitting ? (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : ("Signup")
                                }
                            </Button>
                        </form>
                    </Form>
                    <div className="text-center mt-4">
                        <p>
                            Already a member?{' '}
                            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}