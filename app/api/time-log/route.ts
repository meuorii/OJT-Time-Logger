import dbConnect from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { TimeLog } from '@/models/TimeLog';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) { 
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const filterDate = searchParams.get('date');
        const query = filterDate ? { date: filterDate } : {};
        const logs = await TimeLog.find(query).sort({ date: -1, createdAt: -1 });
        return NextResponse.json({ data: logs });
    } catch (error) {
        console.error("Fetch Error:", error);
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
        
        if (!studentRecord) {
            return NextResponse.json({ error: 'Student not Found' }, { status: 404 });
        }

        const TIME_ZONE = 'Asia/Manila'; 
        const now = new Date();

        const hour = parseInt(new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit', hour12: false, timeZone: TIME_ZONE
        }).format(now));

        const today = new Intl.DateTimeFormat('en-CA', { 
            timeZone: TIME_ZONE 
        }).format(now);

        const currentTime = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TIME_ZONE 
        });

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
            message = `${isAm ? 'AM' : 'PM'} In Logged`;
        } 
        
        else {
            if (log.amIn && !log.amOut && hour >= 12) {
                log.amOut = "12:00 PM";
            }
            if (log.pmIn && !log.pmOut && hour >= 17) {
                log.pmOut = "05:00 PM";
            }

            if (log.amIn && !log.amOut && hour < 12) {
                log.amOut = currentTime;
                message = 'AM Out Logged';
            } 
            else if (!log.pmIn) {
                if (hour < 12) {
                    return NextResponse.json({ error: 'PM Shift starts at 12:00 PM.' }, { status: 400});
                }
                log.pmIn = currentTime;
                message = 'PM In Logged';
            } 
            else if (!log.pmOut) {
                log.pmOut = hour >= 17 ? "05:00 PM" : currentTime;
                log.status = "Completed";
                message = 'PM Out Logged';
            } 

            else {
                if (hour < 17) {
                    return NextResponse.json({ error: 'Overtime starts after 5:00 PM.' }, { status: 400 });
                }

                if (!log.otIn) {
                    log.otIn = currentTime;
                    log.status = 'Incomplete';
                    message = 'Overtime Started.';
                } else if (!log.otOut) {
                    log.otOut = currentTime;
                    log.status = 'Completed'; 
                    message = 'Overtime Finished.';
                } else {
                    return NextResponse.json({ error: 'All logs completed for today.' }, { status: 400 });
                }
            }
        }

        const amHours = calculateDuration(log.amIn, log.amOut, today);
        const pmHours = calculateDuration(log.pmIn, log.pmOut, today);
        const otHours = calculateDuration(log.otIn, log.otOut, today);  
        log.totalHours = (amHours + pmHours + otHours).toFixed(2);

        await log.save();
        return NextResponse.json({ message, data: log });

    } catch (error) {
        console.error("POST Error:", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}