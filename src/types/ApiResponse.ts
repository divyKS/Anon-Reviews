import { Message } from "@/model/User";

export interface ApiResponse{
    success: boolean,
    message: string,
    isAcceptingMessages?: boolean, // for signup etc we won't be doing anything with this field,
    messages?: Array<Message>, // for dashboard etc if we need reviews to be displayed
} 