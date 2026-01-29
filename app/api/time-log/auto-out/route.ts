import dbConnect from "@/lib/mongodb";
import { TimeLog } from "@/models/TimeLog";
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');

        const now = new Date();
        const phTime = new Date(
            now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
        );

        const hour = phTime.getHours(); // 24-hour format

        const phDate = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(now);

        if (type === 'AM') {
            // AM auto-out only AFTER 12:00 PM
            if (hour < 12) {
                return NextResponse.json({ message: "Too early for AM auto-out" });
            }

            await TimeLog.updateMany(
                { date: phDate, amIn: { $exists: true }, amOut: null },
                { $set: { amOut: "12:00 PM" } }
            );
        }

        else if (type === 'PM') {
            // PM auto-out only AFTER 5:00 PM
            if (hour < 17) {
                return NextResponse.json({ message: "Too early for PM auto-out" });
            }

            await TimeLog.updateMany(
                { date: phDate, pmIn: { $exists: true }, pmOut: null },
                { $set: { pmOut: "05:00 PM", status: "Completed" } }
            );
        }

        return NextResponse.json({ message: "Auto-out successfully completed" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
