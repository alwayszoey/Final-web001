import mongoose, { Document, Model, Schema } from "mongoose";

export interface IStat extends Document {
  name: string;
  views: number;
  downloads: number;
}

const StatSchema = new Schema<IStat>(
  {
    name: { type: String, required: true, unique: true, default: "global", index: true },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Stat: Model<IStat> =
  mongoose.models.Stat || mongoose.model<IStat>("Stat", StatSchema);

export default Stat;
