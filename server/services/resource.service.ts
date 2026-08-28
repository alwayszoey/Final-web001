import crypto from "crypto";
import { isDbConnected } from "../config/db.js";
import { Resource, IResource } from "../models/Resource.model.js";
import { MemoryCacheService } from "./cache.service.js";

// In-Memory store for resources (starts EMPTY as requested)
let memoryResources: any[] = [];

export class ResourceService {
  private static CACHE_KEY_PUBLIC = "public_resources_list_v3";
  private static CACHE_KEY_ADMIN = "admin_resources_list_v3";

  /**
   * Invalidates caches whenever resources change
   */
  static invalidateCache() {
    MemoryCacheService.del(this.CACHE_KEY_PUBLIC);
    MemoryCacheService.del(this.CACHE_KEY_ADMIN);
  }

  /**
   * Retrieves public catalog resources (sanitized - hides raw target download URLs for security)
   */
  static async getPublicResources(): Promise<any[]> {
    const cached = MemoryCacheService.get<any[]>(this.CACHE_KEY_PUBLIC);
    if (cached) return cached;

    let items: any[] = [];

    if (isDbConnected()) {
      try {
        const dbItems = await Resource.find().sort({ createdAt: -1 }).lean();
        items = dbItems.map((item) => ({
          id: item.itemId,
          itemId: item.itemId,
          title: item.title,
          category: item.category,
          shortDescription: item.shortDescription,
          fullDescription: item.fullDescription,
          price: item.price,
          actionType: item.actionType || "link",
          imageUrl: item.imageUrl,
          videoUrl: item.videoUrl,
          warning: item.warning,
          tags: item.tags || [],
          fileSize: item.fileSize,
          isOutOfStock: item.isOutOfStock,
          isPopular: item.isPopular,
          isFeatured: item.isFeatured,
          requiresLogin: item.requiresLogin,
          dateAdded: item.dateAdded || item.createdAt?.toISOString().split("T")[0],
          // Download links are sanitized so label is visible but direct URL is protected behind verification
          downloadLinks: (item.downloadLinks || []).map((dl) => ({
            label: dl.label,
            url: dl.url ? "protected" : "",
          })),
        }));
      } catch (err) {
        console.error("Error reading resources from DB:", err);
      }
    }

    if (items.length === 0 && memoryResources.length > 0) {
      items = memoryResources.map((item) => ({
        id: item.itemId,
        itemId: item.itemId,
        title: item.title,
        category: item.category,
        shortDescription: item.shortDescription,
        fullDescription: item.fullDescription,
        price: item.price,
        actionType: item.actionType || "link",
        imageUrl: item.imageUrl,
        videoUrl: item.videoUrl,
        warning: item.warning,
        tags: item.tags || [],
        fileSize: item.fileSize,
        isOutOfStock: item.isOutOfStock,
        isPopular: item.isPopular,
        isFeatured: item.isFeatured,
        requiresLogin: item.requiresLogin,
        dateAdded: item.dateAdded,
        downloadLinks: (item.downloadLinks || []).map((dl: any) => ({
          label: dl.label,
          url: dl.url ? "protected" : "",
        })),
      }));
    }

    MemoryCacheService.set(this.CACHE_KEY_PUBLIC, items, 30 * 1000);
    return items;
  }

  /**
   * Retrieves full resource details for Admin
   */
  static async getAdminResources(): Promise<any[]> {
    const cached = MemoryCacheService.get<any[]>(this.CACHE_KEY_ADMIN);
    if (cached) return cached;

    let items: any[] = [];

    if (isDbConnected()) {
      try {
        const dbItems = await Resource.find().sort({ createdAt: -1 }).lean();
        items = dbItems.map((item) => ({
          id: item.itemId,
          itemId: item.itemId,
          title: item.title,
          category: item.category,
          shortDescription: item.shortDescription,
          fullDescription: item.fullDescription,
          price: item.price,
          actionType: item.actionType || "link",
          imageUrl: item.imageUrl,
          videoUrl: item.videoUrl,
          link: item.link,
          downloadLinks: item.downloadLinks || [],
          purchaseDetails: item.purchaseDetails,
          warning: item.warning,
          tags: item.tags || [],
          fileSize: item.fileSize,
          isOutOfStock: item.isOutOfStock,
          isPopular: item.isPopular,
          isFeatured: item.isFeatured,
          requiresLogin: item.requiresLogin,
          dateAdded: item.dateAdded,
          createdAt: item.createdAt,
        }));
      } catch (err) {
        console.error("Error reading admin resources from DB:", err);
      }
    }

    if (items.length === 0 && memoryResources.length > 0) {
      items = [...memoryResources];
    }

    MemoryCacheService.set(this.CACHE_KEY_ADMIN, items, 15 * 1000);
    return items;
  }

  /**
   * Retrieves a single full resource (for download or buy logic)
   */
  static async getResource(itemId: string): Promise<any | null> {
    if (isDbConnected()) {
      try {
        const doc = await Resource.findOne({ itemId }).lean();
        if (doc) return doc;
      } catch (err) {
        console.error("Error finding resource by ID in DB:", err);
      }
    }

    return memoryResources.find((r) => r.itemId === itemId) || null;
  }

  /**
   * Resolves the real download URL for an item
   */
  static async resolveDownloadUrl(itemId: string, linkIndex?: number): Promise<string | null> {
    const resource = await this.getResource(itemId);
    if (!resource) return null;

    if (Array.isArray(resource.downloadLinks) && resource.downloadLinks.length > 0) {
      const idx = typeof linkIndex === "number" && linkIndex >= 0 && linkIndex < resource.downloadLinks.length ? linkIndex : 0;
      return resource.downloadLinks[idx]?.url || resource.link || null;
    }

    return resource.link || null;
  }

  /**
   * Creates a new resource
   */
  static async createResource(data: any): Promise<any> {
    const itemId = data.itemId?.trim() || `item_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const actionType: "link" | "purchase" = data.actionType === "purchase" ? "purchase" : "link";
    const newResource = {
      itemId,
      title: data.title?.trim() || "สินค้าไม่มีชื่อ",
      category: data.category?.trim() || "Script",
      shortDescription: data.shortDescription?.trim() || "",
      fullDescription: data.fullDescription?.trim() || "",
      price: data.price !== undefined ? String(data.price).trim() : "ฟรี",
      actionType,
      imageUrl: data.imageUrl?.trim() || "",
      videoUrl: data.videoUrl?.trim() || "",
      link: data.link?.trim() || "",
      downloadLinks: Array.isArray(data.downloadLinks)
        ? data.downloadLinks.filter((l: any) => l && l.url)
        : data.link
        ? [{ label: "ดาวน์โหลดหลัก", url: data.link }]
        : [],
      purchaseDetails: data.purchaseDetails?.trim() || "",
      warning: data.warning?.trim() || "",
      tags: Array.isArray(data.tags)
        ? data.tags.map((t: string) => String(t).trim()).filter(Boolean)
        : typeof data.tags === "string"
        ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [],
      fileSize: data.fileSize?.trim() || "",
      isOutOfStock: Boolean(data.isOutOfStock),
      isPopular: Boolean(data.isPopular),
      isFeatured: Boolean(data.isFeatured),
      requiresLogin: Boolean(data.requiresLogin),
      dateAdded: data.dateAdded || new Date().toISOString().split("T")[0],
    };

    if (isDbConnected()) {
      try {
        const created = await Resource.create(newResource);
        this.invalidateCache();
        if (created) return created.toObject();
      } catch (err) {
        console.error("Error creating resource in DB:", err);
      }
    }

    memoryResources.unshift(newResource);
    this.invalidateCache();
    return newResource;
  }

  /**
   * Updates an existing resource
   */
  static async updateResource(itemId: string, data: any): Promise<any> {
    const updates: any = {};
    if (data.title !== undefined) updates.title = data.title.trim();
    if (data.category !== undefined) updates.category = data.category.trim();
    if (data.shortDescription !== undefined) updates.shortDescription = data.shortDescription.trim();
    if (data.fullDescription !== undefined) updates.fullDescription = data.fullDescription.trim();
    if (data.price !== undefined) updates.price = String(data.price).trim();
    if (data.actionType !== undefined) updates.actionType = data.actionType === "purchase" ? "purchase" : "link";
    if (data.imageUrl !== undefined) updates.imageUrl = data.imageUrl.trim();
    if (data.videoUrl !== undefined) updates.videoUrl = data.videoUrl.trim();
    if (data.link !== undefined) updates.link = data.link.trim();
    if (data.downloadLinks !== undefined) updates.downloadLinks = data.downloadLinks;
    if (data.purchaseDetails !== undefined) updates.purchaseDetails = data.purchaseDetails.trim();
    if (data.warning !== undefined) updates.warning = data.warning.trim();
    if (data.tags !== undefined) {
      updates.tags = Array.isArray(data.tags)
        ? data.tags.map((t: string) => String(t).trim()).filter(Boolean)
        : typeof data.tags === "string"
        ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [];
    }
    if (data.fileSize !== undefined) updates.fileSize = data.fileSize.trim();
    if (data.isOutOfStock !== undefined) updates.isOutOfStock = Boolean(data.isOutOfStock);
    if (data.isPopular !== undefined) updates.isPopular = Boolean(data.isPopular);
    if (data.isFeatured !== undefined) updates.isFeatured = Boolean(data.isFeatured);
    if (data.requiresLogin !== undefined) updates.requiresLogin = Boolean(data.requiresLogin);

    if (isDbConnected()) {
      try {
        const updated = await Resource.findOneAndUpdate({ itemId }, { $set: updates }, { new: true });
        this.invalidateCache();
        if (updated) return updated.toObject();
      } catch (err) {
        console.error("Error updating resource in DB:", err);
      }
    }

    const index = memoryResources.findIndex((r) => r.itemId === itemId);
    if (index !== -1) {
      memoryResources[index] = { ...memoryResources[index], ...updates };
      this.invalidateCache();
      return memoryResources[index];
    }

    throw new Error("ไม่พบสินค้าที่ต้องการแก้ไข");
  }

  /**
   * Deletes a resource
   */
  static async deleteResource(itemId: string): Promise<boolean> {
    if (isDbConnected()) {
      try {
        await Resource.deleteOne({ itemId });
      } catch (err) {
        console.error("Error deleting resource from DB:", err);
      }
    }

    memoryResources = memoryResources.filter((r) => r.itemId !== itemId);
    this.invalidateCache();
    return true;
  }

  /**
   * Deletes all resources (Clears catalog)
   */
  static async clearAllResources(): Promise<boolean> {
    if (isDbConnected()) {
      try {
        await Resource.deleteMany({});
      } catch (err) {
        console.error("Error deleting all resources from DB:", err);
      }
    }

    memoryResources = [];
    this.invalidateCache();
    return true;
  }
}
