import dbConnect from '@/lib/mongodb';
import { TimeLog } from '@/models/TimeLog';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const logs = await TimeLog.find({
            createdAt: { $gte: startOfToday, $lte: endOfToday }
        }).sort({ createdAt: -1 });;

        return NextResponse.json({ data: logs })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch time logs' }, { status: 500})
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { studentId, fullName } = await req.json();

        const today = new Date().toISOString().split('T')[0];
        const existingLog = await TimeLog.findOne({ studentId, date: today });
        if (!existingLog) {
            const newLog = new TimeLog ({ studentId, fullName, date: today, timeIn: new Date(), })
            return NextResponse.json({ message: 'Time In Logged Successfully', data: newLog })
        }

        if (!existingLog.timeOut) {
            existingLog.timeOut = new Date();
            await existingLog.save();
            return NextResponse.json({ message: 'Time Out Logged Successfully', data: existingLog })
        }

        return NextResponse.json({ message: 'You have already logged your Attendance for today.' }, { status: 400 });

    } catch (error: unknown ) {
        const msg = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ message: msg }, { status: 500 })
    }
}