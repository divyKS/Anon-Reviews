import mongoose, {Schema, Document} from "mongoose";

// to ensure the interface represents a mongoose document, to tell TS that the interface not only includes these custom properties but also inherits the standard mongoose document properties and methods like _id, --v, save() ...  
export interface Message extends Document{
    content: string,
    createdAt: Date
}

const messageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

export interface User extends Document{
    username: string,
    email: string,
    password: string,
    verifyCode: string,
    verifyCodeExpiry: Date,
    isVerified: boolean,
    isAcceptingMessages: boolean,
    messages: Message[]
}

const userSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/.+\@.+\..+/, "Please use a valid email address"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    verifyCode: {
        type: String,
        required: [true, "Verify Code is required"],
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, "Verify Code Expiry is required"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAcceptingMessages: {
        type: Boolean,
        default: true,
    },
    messages: [messageSchema],
})

// const UserModel = mongoose.models.User || mongoose.model("User", userSchema)
// if the second part is used to assign the UserModel then TS would be able to infer the type, but if the mongoose.models cache is used to return the model then TS may not know the exact type  of the model
const UserModel = mongoose.models.User as mongoose.Model<User> || mongoose.model("User", userSchema)

export default UserModel