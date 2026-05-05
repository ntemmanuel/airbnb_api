import { v2 as cloudinary } from "cloudinary";
/**
 * Uploads a file buffer (from Multer) to Cloudinary.
 * @param buffer - The file data in memory
 * @param folder - The folder name in Cloudinary (e.g., "avatars")
 */
export declare function uploadToCloudinary(buffer: Buffer, folder: string): Promise<{
    url: string;
    publicId: string;
}>;
/**
 * Deletes an image from Cloudinary using its Public ID.
 * Always call this when a user updates their photo to prevent "ghost files".
 */
export declare function deleteFromCloudinary(publicId: string): Promise<void>;
export default cloudinary;
//# sourceMappingURL=cloudinary.d.ts.map