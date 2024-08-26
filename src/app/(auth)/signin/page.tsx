"use client"

import { useSession, signIn, signOut } from "next-auth/react"

export default function Component(){
    const {data: session} = useSession()
    if(session){
        return (
            <>
                Signed in as {session.user.email} {/* able to access this because of the AuthProvider that we wrapped outside the body in the layout.tsx of the whole page */}
                <br />
                <button onClick={()=>signOut()}>Sign Out</button>
            </>
        )
    }

    return (
        <>
            Not Signed in
            <br />
            <button className="bg-orange-400 px-2" onClick={()=>signIn()}>Sign In</button>
        </>
    )
}