import dbConnect from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { TimeLog } from '@/models/TimeLog';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();

        const today = new Date().toLocaleDateString('en-CA');

        const logs = await TimeLog.find({ date: today }).sort({ updatedAt: -1 });
        return NextResponse.json({ success: true, data: logs});
    } catch {
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500});
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { studentId } = await req.json();

        const studentRecord = await Student.findOne({ studentId });
        if (!studentRecord) {
            return NextResponse.json({ error: 'Student not Found' }, { status: 404 });
        }

        const now = new Date();
        const hour = now.getHours();
        const today = now.toLocaleDateString('en-CA');
        const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true});

        let log = await TimeLog.findOne({ student: studentRecord._id, date: today });

        if (!log) {
            const isAm = hour < 12;
            log = new TimeLog({
                student: studentRecord._id,
                studentId: studentRecord.studentId,
                fullName: studentRecord.fullName,
                date: today, [isAm ? 'amIn' : 'pmIn']: currentTime,
                status: 'Incomplete'
            })

            await log.save();
            return NextResponse.json({ messgae: `Success: ${isAm ? 'AM' : 'PM'} In Logged.`, data: log });
        }

        let message = '';

        if (log.amIn && !log.amOut) {
            log.amOut = currentTime
            message = 'AM Out Logged successfully';
        } else if (!log.pmIn) {
            if (hour < 12) return NextResponse.json({ error: 'PM Shift starts at 12:00 PM onwards.' }, { status: 400 });
            log.pmIn = currentTime;
            message = 'PM`In logged successfully.';
        } else if (!log.pmOut) {
            log.pmOut = currentTime;
            log.status = 'Complete';
            message = 'PM Out Logged. Regular Shift Completed';
        } else if ( hour >= 17) {
            if (!log.pmOut) return NextResponse.json({ error: 'Finish PM Shift first' }, { status: 400 });

            if (!log.otIn) {
                log.otIn = currentTime;
                message = 'Overtime In Started';
            } else if (!log.otOut) {
                log.otOut = currentTime;
                message = 'Overtime Out Finished';
            } else {
                return NextResponse.json({ error: 'You have already completed all the logs for today.' }, { status: 400});
            }
        } else {
            return NextResponse.json({ error: 'Invalid log sequence or slot already filled.'}, {status: 400});
        }

        await log.save();
        return NextResponse.json({ message, data: log });

    } catch {
        return NextResponse.json({ error: 'Server Error '}, { status: 500 });
    }
}