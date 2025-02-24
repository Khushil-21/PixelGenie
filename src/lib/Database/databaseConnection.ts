/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface DatabaseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached: DatabaseConnection = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
    try {
        if (cached.conn) return cached.conn;

        if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

        cached.promise = cached.promise || mongoose.connect(MONGODB_URI, { dbName: "PixelGenie", bufferCommands: false });

        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        console.log(error);
    }
};

