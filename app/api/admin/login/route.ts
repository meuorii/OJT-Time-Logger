import dbConnect from "@/lib/mongodb";
import { Admin } from '@/models/Admin';
import bcrypt from "bcryptjs";
import { NextResponse } from 'next/server';
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { username, password } = await req.json();

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return NextResponse.json({ error: 'Invalid Credentials'}, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, admin.password)
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid Credentials'}, { status:401 })
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("CRITICAL ERROR: JWT_SECRET is not defined in .env.local");
            return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
        }

        // 1. Create the JWT Token
        const token = jwt.sign(
            { 
                adminId: admin._id, 
                username: admin.username,
                role: 'admin' 
            },
            secret,
            { expiresIn: '1d' }
        );

        const response = NextResponse.json({ 
            message: 'Login Successful',
            adminId: admin._id 
        });

        response.cookies.set('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax', 
            maxAge: 60 * 60 * 24, 
            path: '/', 
        });

        return response;
    } catch (error) {
        console.error('Login Route Error.', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}