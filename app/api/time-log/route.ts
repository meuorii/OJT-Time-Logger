import dbConnect from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { TimeLog } from '@/models/TimeLog';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();
        const logs = await TimeLog.find({}).sort({ date: -1 });
        return NextResponse.json({ data: logs });
    } catch {
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}

const calculateDuration = (timeIn?: string, timeOut?: string, logDate?: string): number => {
    if (!timeIn || !timeOut) return 0;

    try {
        const anchorDate = logDate || "2026-01-01";
        const start = new Date(`${anchorDate} ${timeIn}`);
        const end = new Date(`${anchorDate} ${timeOut}`);
        
        let diff = (end.getTime() - start.getTime()) / (3600000);
        if (diff < 0) diff += 24;
        return diff
    } catch {
        return 0;
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { studentId } = await req.json();
        const studentRecord = await Student.findOne({ studentId });
        
        if (!studentRecord) return NextResponse.json({ error: 'Student not Found' }, { status: 404 });

        const now = new Date();
        const hour = now.getHours();
        const today = now.toLocaleDateString('en-CA');
        const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        let log = await TimeLog.findOne({ student: studentRecord._id, date: today });
        let message = '';

        if (!log) {
            const isAm = hour < 12;
            log = new TimeLog({
                student: studentRecord._id,
                studentId: studentRecord.studentId,
                fullName: studentRecord.fullName,
                date: today, 
                [isAm ? 'amIn' : 'pmIn']: currentTime,
                status: 'Incomplete'
            });
            message = `${isAm ? 'AM' : 'PM'} In Logged`
        } else {
            if (log.amIn && !log.amOut && hour >= 12) {
                log.amOut = "12:00 PM";
            }
            if (log.pmIn && !log.pmOut && hour >= 17) {
                log.pmOut = "05:00 PM";
                log.status = "Completed";
            }

            if (log.amIn && !log.amOut) {
                log.amOut = currentTime;
                message = 'AM Out Logged';
            } else if (!log.pmIn) {
                if (hour < 12) return NextResponse.json({ error: 'PM Shift starts at 12:00 PM.' }, { status: 400});
                log.pmIn = currentTime;
                message = 'Pm In Logged'
            } else if (!log.pmOut) {
                log.pmOut = currentTime;
                log.status = "Completed";
                message = 'PM Out Logged Duty Completed for Today'
            }

            else if (log.pmOut) {
                if (hour < 17) return NextResponse.json({ error: 'Overtime starts after 5:00 PM.' }, { status: 400 });

                if (!log.otIn) {
                    log.otIn = currentTime;
                    log.status = 'Incomplete';
                    message = 'Overtime Started.'
                } else if (!log.otOut) {
                    log.otOut = currentTime;
                    log.status = 'Complete';
                    message = 'Overtime Finished.'
                } else {
                    return NextResponse.json({ error: 'All logs completed.' }, { status: 400 })
                }
            } else {
                return NextResponse.json({ error: 'Invalid sequence'}, { status: 400 });
            }
        }

        // Calculate Totals
        const amHours = calculateDuration(log.amIn, log.amOut);
        const pmHours = calculateDuration(log.pmIn, log.pmOut);
        const otHours = calculateDuration(log.otIn, log.otOut);
        log.totalHours = (amHours + pmHours + otHours).toFixed(2);

        await log.save();
        return NextResponse.json({ message, data: log });

    } catch  {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}