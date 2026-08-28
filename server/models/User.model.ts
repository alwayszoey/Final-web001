import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUserHistory {
  id: string;
  type: "link" | "purchase" | "download";
  title: string;
  details?: string;
  price?: string;
  date: Date;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  provider: "credentials" | "google" | "discord" | "multiple";
  googleId?: string;
  discordId?: string;
  avatarUrl?: string;
  role: "user" | "admin";
  history: IUserHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: false,
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "discord", "multiple"],
      default: "credentials",
      index: true,
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    discordId: {
      type: String,
      sparse: true,
      index: true,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    history: {
      type: [
        {
          id: { type: String, required: true },
          type: { type: String, enum: ["link", "purchase", "download"], default: "download" },
          title: { type: String, required: true },
          details: { type: String, default: "" },
          price: { type: String, default: "" },
          date: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

UserSchema.index({ createdAt: -1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
