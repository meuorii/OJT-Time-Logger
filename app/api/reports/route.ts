import dbConnect from "@/lib/mongodb";
import { TimeLog } from "@/models/TimeLog";
import { NextResponse } from "next/server";

interface FilterQuery {
    studentId?: string;
    date?: {
        $gte?: string;
        $lte?: string;
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const query: FilterQuery = {};

        if (studentId) query.studentId = studentId;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }

        const logs = await TimeLog.find(query).sort({ date: -1 });
        return NextResponse.json({ data: logs});
    } catch {
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}