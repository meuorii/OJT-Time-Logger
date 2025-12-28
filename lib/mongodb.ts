import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error('Please Define the MONGODB_URI envirnment variable inside .env.local');
}

interface MongooseCache {
    conn: Connection | null;
    promise: Promise<Connection> | null;
}

declare global {
    var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Connection> {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts ={ bufferCommands: false, };
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m.connection);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;