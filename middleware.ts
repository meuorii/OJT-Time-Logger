import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('admin/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('admin/login', request.url));
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch ( error) {
            console.error('Middleware JWT Verification Error:', error);
            return NextResponse.redirect(new URL('admin/login', request.url));
        }
    }

    if (pathname === '/admin/login' && token) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            await jwtVerify(token, secret);
            return NextResponse.redirect(new URL('admin/dashboard', request.url));
        } catch {
            return NextResponse.next();
        }
    }
    return NextResponse.next();
}   

export const config = {
    matcher: ['/admin/:path*'],
};