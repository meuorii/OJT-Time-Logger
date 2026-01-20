import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json({ message: 'Logout Successfully' }, { status: 200 });

        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // Ito ang magsasabi sa browser na burahin na ang cookie agad
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Logout Route Error.', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}