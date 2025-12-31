import dbConnect from "@/lib/mongodb";
import { Admin } from '@/models/Admin';
import bcrypt from "bcryptjs";
import { NextResponse } from 'next/server';

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

        return NextResponse.json({ message: 'Login Successfull', adminId: admin._p });
    } catch {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}