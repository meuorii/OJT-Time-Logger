import dbConnect from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();
        const students = await Student.find({}).sort({ fullName: 1});
        return NextResponse.json({ data: students });
    } catch  {
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    } 
}