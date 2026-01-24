import dbConnect from "@/lib/mongodb";
import { TimeLog } from "@/models/TimeLog";
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { type } = await req.json();
        const today = new Date().toLocaleDateString('en-CA');

        if (type == 'AM') {
            await TimeLog.updateMany(
                { date: today, amIn: { $exists: true }, amOut: null },
                { $set: { amOut: "12:00 PM"} }
            );
        } else if (type == 'PM') {
            await TimeLog.updateMany(
                { date: today, pmIn: { $exists: true }, pmOut: null },
                { $set: { pmOut: "05:00 PM", status: "Completed" } }
            );
        }

        return NextResponse.json({ message: "Auto-out successfully completed" }, { status: 200 });
    } catch  {
        return NextResponse.json({ error: 'Interval Server Error' }, { status: 500 });
    }
}