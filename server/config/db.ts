import mongoose from "mongoose";
import { config } from "./env.js";

let isConnecting = false;
let isConnected = false;
let connectionAttempt = 0;

export const connectDB = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  if (!config.mongoUri) {
    if (connectionAttempt === 0) {
      console.log("[Database] MONGODB_URI not configured. Operating in high-speed In-Memory Engine.");
      connectionAttempt++;
    }
    return false;
  }

  if (isConnecting) return false;

  try {
    isConnecting = true;
    connectionAttempt++;
    
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20,
      minPoolSize: 2,
    });

    isConnected = true;
    console.log("[Database] Connected successfully to MongoDB.");
    return true;
  } catch (err: any) {
    isConnected = false;
    console.warn(`[Database] MongoDB connection attempt ${connectionAttempt} failed: ${err.message || err}`);
    return false;
  } finally {
    isConnecting = false;
  }
};

mongoose.connection.on("connected", () => {
  isConnected = true;
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("[Database] MongoDB disconnected. Falling back to in-memory mode.");
});

mongoose.connection.on("error", (err) => {
  isConnected = false;
  console.error("[Database] MongoDB connection error:", err.message || err);
});

export const isDbConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const getDbStatus = () => {
  return {
    state: mongoose.connection.readyState === 1 ? "connected" : "in-memory-fallback",
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || "in-memory",
    name: mongoose.connection.name || "zorix_local",
  };
};
