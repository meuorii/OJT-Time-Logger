import dbConnect from '@/lib/mongodb';
import { Admin } from '@/models/Admin';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { username, email, password } = await req.json();
        
        const existingAdmin = await Admin.findOne({ $or: [{ username }, { email}]});
        if (existingAdmin) {
            return NextResponse.json({ error: 'Admin with this usernmae and email already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({ username, email, password: hashedPassword });
        return NextResponse.json({ message: 'Admin registered successfully', adminId: newAdmin._id }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}