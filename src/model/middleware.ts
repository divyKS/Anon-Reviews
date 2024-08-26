// this file would run before the things we want to

import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export { default } from "next-auth/middleware"

export async function middleware(request: NextRequest) {
    const token = await getToken({req: request})
    const url = request.nextUrl

    if(token && (url.pathname.startsWith('/signin') || url.pathname.startsWith('/signup') || url.pathname.startsWith('/verify') || url.pathname.startsWith('/'))){
        // if user has token, then he doesn't have to signin or anything, directly move to the dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    if(!token && url.pathname.startsWith('/dashboard')){
        return NextResponse.redirect(new URL('/signin', request.url))
    }

	return NextResponse.redirect(new URL('/home', request.url));
}

// where should the middleware run
export const config = {
	matcher: ['/signin', "/singup", "/", "/dashboard/:path*", "/verify/:path*"]
};
