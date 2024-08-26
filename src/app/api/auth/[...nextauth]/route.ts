import NextAuth from "next-auth/next";
import { authOptions } from "./options";

const handler = NextAuth(authOptions) // our options were complex so we put into another file

export { handler as GET, handler as POST }