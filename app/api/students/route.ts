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

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { studentId, fullName } = await req.json();

        if (!fullName || !studentId) {
            return NextResponse.json({ error: 'Both Full Name and Student ID are required' }, { status: 400 });
        }

        const existingStudent = await Student.findOne({ studentId });
        if (existingStudent) {
            return NextResponse.json({ error: 'This Student ID already exists' }, { status: 400 });
        }

        const newStudent = new Student({ studentId, fullName });
        await newStudent.save();
        return NextResponse.json({ message: 'Student added successfully', data: newStudent }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500})
    }
}