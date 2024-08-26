import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number 
}

const connection: ConnectionObject = {}

// void here means the data can be of any type
async function dbConnect(): Promise<void>{
    if(connection.isConnected){
        console.log("Already connected to DB")
        return
    }
    
    try {
        const db = await mongoose.connect(process.env.MONGO_URI || "")
        // !TODO: check this
        // console.log(db)
        // console.log(db.connections)
        connection.isConnected = db.connections[0].readyState
        console.log("Successfully connected to DB ")
    } catch (error) {
        console.log("Could not connect to DB, exiting the application")
        console.log(error)
        process.exit(1)
    }
}

export default dbConnect