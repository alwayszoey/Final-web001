import mongoose, { Document, Model, Schema } from "mongoose";

export interface IResourceLink {
  label: string;
  url: string;
}

export interface IResource extends Document {
  itemId: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  price: string;
  actionType: "link" | "purchase";
  imageUrl: string;
  videoUrl?: string;
  link?: string;
  downloadLinks?: IResourceLink[];
  purchaseDetails?: string;
  warning?: string;
  tags?: string[];
  fileSize?: string;
  isOutOfStock?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  requiresLogin?: boolean;
  dateAdded?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    itemId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, default: "Script" },
    shortDescription: { type: String, default: "" },
    fullDescription: { type: String, default: "" },
    price: { type: String, default: "ฟรี" },
    actionType: { type: String, enum: ["link", "purchase"], default: "link" },
    imageUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    link: { type: String, default: "" },
    downloadLinks: [
      {
        label: { type: String, default: "ดาวน์โหลด" },
        url: { type: String, default: "" },
      },
    ],
    purchaseDetails: { type: String, default: "" },
    warning: { type: String, default: "" },
    tags: [{ type: String }],
    fileSize: { type: String, default: "" },
    isOutOfStock: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    requiresLogin: { type: Boolean, default: false },
    dateAdded: { type: String, default: () => new Date().toISOString().split("T")[0] },
  },
  { timestamps: true }
);

export const Resource: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>("Resource", ResourceSchema);
