import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const connection = await dbConnect();
        const isConnected = connection.readyState === 1;
        return NextResponse.json({ message: isConnected ? 'Successfully connected to MongoDB' : 'Connecting....', status: connection.readyState });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message: 'Unknown error occurred';
        return NextResponse.json({ message: 'Failed to connect to MongoDB', error: errorMessage }, { status: 500})
    }
}