// // import mongoose from 'mongoose';

// // let cached = (global as any).mongoose;

// // if (!cached) {
// //   cached = (global as any).mongoose = { conn: null, promise: null };
// // }

// // const connectDB = async () => {
// //   const MONGO_URI = process.env.MONGO_URI as string;

// //   if (!MONGO_URI) {
// //     console.error("❌ MONGO_URI is NOT defined in environment variables");
// //     throw new Error('Please define the MONGO_URI environment variable');
// //   }

// //   if (cached.conn) {
// //     return cached.conn;
// //   }

// //   if (!cached.promise) {
// //     const opts = {
// //       bufferCommands: false,
// //       maxPoolSize: 1, // Crucial for serverless environments
// //       serverSelectionTimeoutMS: 5000,
// //       socketTimeoutMS: 45000,
// //       maxIdleTimeMS: 10000,
// //       family: 4
// //     };

// //     cached.promise = mongoose.connect(MONGO_URI, opts)
// //       .then((mongooseInstance) => {
// //         console.log("✅ MongoDB Connection Established");
// //         return mongooseInstance;
// //       })
// //       .catch((err) => {
// //         console.error("❌ MongoDB Connection Failed:", err.message);
// //         throw err;
// //       });
// //   }

// //   try {
// //     cached.conn = await cached.promise;
// //   } catch (e) {
// //     console.error("❌ Error while awaiting MongoDB connection:", e);
// //     cached.promise = null;
// //     throw e;
// //   }

// //   return cached.conn;
// // };

// // export default connectDB;


// // db.ts
// import mongoose from 'mongoose';

// let cached = (global as any).mongoose;

// if (!cached) {
//   cached = (global as any).mongoose = { conn: null, promise: null };
// }

// const connectDB = async () => {
//   const MONGO_URI = process.env.MONGO_URI;

//   if (!MONGO_URI) {
//     throw new Error('Please define the MONGO_URI environment variable');
//   }

//   if (cached.conn) {
//     // return cached connection if already connected
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false, // fail fast if DB not connected
//       maxPoolSize: 5,        // serverless-friendly
//       serverSelectionTimeoutMS: 5000,
//       socketTimeoutMS: 45000,
//       maxIdleTimeMS: 10000,
//       family: 4
//     };

//     cached.promise = mongoose.connect(MONGO_URI, opts)
//       .then((mongooseInstance) => {
//         console.log('✅ MongoDB Connection Established');
//         return mongooseInstance;
//       })
//       .catch((err) => {
//         console.error('❌ MongoDB Connection Failed:', err.message);
//         throw err;
//       });
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// };

// export default connectDB;


import mongoose from 'mongoose';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend NodeJS global so the cache survives hot-reloads in dev
// and across invocations within the same Lambda container on Vercel
declare global {
  // eslint-disable-next-line no-var
  var __mongoose_cache: MongooseCache | undefined;
}

// ------------------------------------------------------------------
// Initialise once per process
// ------------------------------------------------------------------
if (!global.__mongoose_cache) {
  global.__mongoose_cache = { conn: null, promise: null };
}

const cache = global.__mongoose_cache;

// ------------------------------------------------------------------
// Connection options tuned for serverless
// ------------------------------------------------------------------
const MONGO_OPTS: mongoose.ConnectOptions = {
  bufferCommands: true,          // buffer in-flight ops during reconnect (safe for serverless)
  maxPoolSize: 10,               // Atlas free tier allows 500 total; 10 per lambda is safe
  minPoolSize: 1,                // keep 1 alive to avoid cold-start on the next invocation
  maxIdleTimeMS: 60_000,         // close idle sockets after 60 s
  serverSelectionTimeoutMS: 8_000,
  socketTimeoutMS: 45_000,
  heartbeatFrequencyMS: 10_000,  // detect dead primaries quickly
  connectTimeoutMS: 10_000,
  retryWrites: true,
  retryReads: true,
  family: 4,                     // force IPv4 — avoids DNS issues on some Vercel regions
};

// ------------------------------------------------------------------
// connectDB — idempotent, cached, safe for concurrent lambda calls
// ------------------------------------------------------------------
const connectDB = async (): Promise<typeof mongoose> => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error('[DB] MONGO_URI environment variable is not defined.');
  }

  // 1. Return the existing connection only if it is truly ready.
  //    readyState 1 = connected. Do NOT return on 2 (connecting) — await the promise instead.
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  // 2. If a connection attempt is already in flight, wait for it.
  //    This is crucial — concurrent lambda invocations must share one promise,
  //    not each start their own connection (that's what blows the Atlas pool limit).
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGO_URI, MONGO_OPTS)
      .then((mg) => {
        console.log('[DB] ✅ MongoDB connected');
        return mg;
      })
      .catch((err) => {
        // Reset so the next call retries cleanly
        cache.promise = null;
        cache.conn = null;
        console.error('[DB] ❌ MongoDB connection error:', err.message);
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
};

// ------------------------------------------------------------------
// Attach lifecycle events once (mongoose emits these globally)
// ------------------------------------------------------------------
mongoose.connection.on('disconnected', () => {
  console.warn('[DB] ⚠️  MongoDB disconnected — resetting cache');
  cache.conn = null;
  cache.promise = null;
});

mongoose.connection.on('error', (err) => {
  console.error('[DB] ❌ MongoDB error:', err.message);
  cache.conn = null;
  cache.promise = null;
});

export default connectDB;