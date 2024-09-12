'use client'
import { MessageCard } from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Message } from "@/model/User"
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Loader2, RefreshCcw } from "lucide-react"
import { User } from "next-auth"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"

const DashboardPage = ({}) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading]  = useState(false)
    const [isSwitchLoading, setIsSwitchLoading] = useState(false)

    const {toast} = useToast()

    // optimistic UI - you liked something, it is liked for you on the UI, the change in the server we'll do afterwards

    const handleDeleteMessage = (messageId: string) => {
        // updating the state for updating the UI instantly
        const updatedMessages = messages.filter(message => message._id !== messageId)
        setMessages(updatedMessages)
    }

    const { data: session } = useSession()

    const form = useForm({
        resolver: zodResolver(acceptMessageSchema)
    })

    const {register, watch, setValue} = form // or can use form.handleSubmit etc. ...

    const acceptMessages = watch("acceptMessages") // this field we will add as 'name' in the UI

    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true)
        try {
            const response = await axios.get<ApiResponse>('/api/accept-messages')
            setValue("acceptMessages", response.data.isAcceptingMessages)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to fetch message settings",
                variant: "destructive"
            })
        } finally {
            setIsSwitchLoading(false)
        }
    }, [setValue])

    const fetchAllMessages = useCallback(async (refresh: boolean = false) => {
        //TODO: optimize to fetch when already fetching
        setIsLoading(true)
        setIsSwitchLoading(false)
        try {
            const response = await axios.get<ApiResponse>('/api/get-messages')
            setMessages(response.data.messages || [])
            if(refresh){
                toast({
                    title: "Refreshed Messages",
                    description: "Showing latest messages"
                })
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to fetch all messages",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
            setIsSwitchLoading(false)
        }
    }, [setIsLoading, setMessages])

    useEffect(() => {
        if(!session || !session.user){
            return 
        }
        fetchAllMessages()
        fetchAcceptMessage()
    }, [session, setValue, fetchAcceptMessage, fetchAllMessages])

    const handleSwitchChange = async () => {
        try {
            const response = await axios.post<ApiResponse>(`/api/accept-messages`, {
                acceptMessages: !acceptMessages
            })
            setValue("acceptMessages", !acceptMessages) // for change in UI
            toast({
                title: response.data.message,
                variant: "default"
            })

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to handle switch change and messages",
                variant: "destructive"
            })
        }
    }
    
    if(!session || !session.user){
        return (
            <>
                <div>
                    Please login
                </div>
            </>
        )
    }
    
    const { username } = session.user as User;
    // TODO: other ways to find baseUrl in next/react/client component
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const profileUrl = `${baseUrl}/u/${username}`;
  
    const copyToClipboard = () => {
        // navigator is for client components
      navigator.clipboard.writeText(profileUrl);
      toast({
        title: 'URL Copied!',
        description: 'Profile URL has been copied to clipboard.',
      });
    };

	return (
        <>
            <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
                <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

                <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
                    <div className="flex items-center">
                    <input
                        type="text"
                        value={profileUrl}
                        disabled
                        className="input input-bordered w-full p-2 mr-2"
                    />
                    <Button onClick={copyToClipboard}>Copy</Button>
                    </div>
                </div>

                <div className="mb-4">
                    <Switch
                        {...register('acceptMessages')} // have to write acceptMessages here
                        checked={acceptMessages}
                        onCheckedChange={handleSwitchChange}
                        disabled={isSwitchLoading}
                    />
                    <span className="ml-2">
                        Accept Messages: {acceptMessages ? 'On' : 'Off'}
                    </span>
                </div>

                <Separator />

                <Button
                    className="mt-4"
                    variant="outline"
                    onClick={(e) => {
                    e.preventDefault();
                    fetchAllMessages(true);
                    }}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                        <RefreshCcw className="h-4 w-4" />
                    )}
                </Button>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {messages.length > 0 ? (
                        messages.map((message, index) => (
                            // TODO: error!??
                            <MessageCard
                                key={message._id}
                                message={message}
                                onMessageDelete={handleDeleteMessage}
                            />
                        ))
                    ) : (
                        <p>No messages to display.</p>
                    )}
                </div>
            </div>
        </>
    )
}

export default DashboardPage
