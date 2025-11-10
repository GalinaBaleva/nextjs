import mongoose from 'mongoose';

// Define the type for our cached connection
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Extend the global type to include our mongoose cache
declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache | undefined;
}

// Define the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Initialize the cache
// In development, use a global variable to preserve the connection across hot reloads
// In production, the cache will be scoped to this module
let cached: MongooseCache = global.mongoose || {conn: null, promise: null};

if (!global.mongoose) {
    global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose
 *
 * This function implements connection caching to prevent multiple connections
 * from being created during development hot reloads or in serverless environments
 *
 * @returns Promise resolving to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
    // If connection already exists, return it
    if (cached.conn) {
        return cached.conn;
    }

    // If no promise exists, create a new connection
    if (!cached.promise) {

        // Validate that the MongoDB URI is defined
        if (!MONGODB_URI) {
            throw new Error(
                'Please define the MONGODB_URI environment variable inside .env.local'
            );
        }
        const opts = {
            bufferCommands: false, // Disable Mongoose buffering
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        // Wait for the connection to be established
        cached.conn = await cached.promise;
    } catch (e) {
        // Reset the promise on error so the next call will retry
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;
