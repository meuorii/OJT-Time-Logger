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

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const { id, studentId, fullName } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Student ID (_id) is required for update' }, { status: 400 });
        }

        const updateStudent = await Student.findByIdAndUpdate(id, { studentId, fullName }, { new: true, runValidators: true });

        if (!updateStudent) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Student updated successfully', data: updateStudent }, { status: 200 })
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500})
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: 'Student ID (_id) is required for deletion'}, { status: 400 })
        }

        const deleteStudent = await Student.findByIdAndDelete(id);

        if (!deleteStudent) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}