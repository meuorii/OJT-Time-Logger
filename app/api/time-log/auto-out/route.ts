import dbConnect from "@/lib/mongodb";
import { TimeLog } from "@/models/TimeLog";
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type')

        const phDate = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit"
        }).format(new Date());

        if (type == 'AM') {
            await TimeLog.updateMany(
                { date: phDate, amIn: { $exists: true }, amOut: null },
                { $set: { amOut: "12:00 PM"} }
            );
        } else if (type == 'PM') {
            await TimeLog.updateMany(
                { date: phDate, pmIn: { $exists: true }, pmOut: null },
                { $set: { pmOut: "05:00 PM", status: "Completed" } }
            );
        }

        return NextResponse.json({ message: "Auto-out successfully completed" }, { status: 200 });
    } catch  {
        return NextResponse.json({ error: 'Interval Server Error' }, { status: 500 });
    }
}