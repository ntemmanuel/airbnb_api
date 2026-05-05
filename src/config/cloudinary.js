// =============================================================
// FILE: src/config/cloudinary.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Connection to Cloudinary for image management.
//   Handles uploading raw image data (buffers) and deleting
//   files using their unique public IDs.
// =============================================================
import { v2 as cloudinary } from "cloudinary";
// 1. CONFIGURE CLOUDINARY
// This connects your local code to your Cloudinary dashboard.
cloudinary.config({
    cloud_name: process.env["CLOUDINARY_CLOUD_NAME"],
    api_key: process.env["CLOUDINARY_API_KEY"],
    api_secret: process.env["CLOUDINARY_API_SECRET"],
});
/**
 * Uploads a file buffer (from Multer) to Cloudinary.
 * @param buffer - The file data in memory
 * @param folder - The folder name in Cloudinary (e.g., "avatars")
 */
export async function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        // upload_stream is best for handling files directly from memory (buffers)
        const uploadStream = cloudinary.uploader.upload_stream({
            folder,
            resource_type: "auto", // Automatically detects if it's a jpg, png, etc.
        }, (error, result) => {
            if (error)
                return reject(error);
            if (!result)
                return reject(new Error("Cloudinary upload failed"));
            // We return the HTTPS URL and the ID needed for later deletion
            resolve({
                url: result.secure_url,
                publicId: result.public_id,
            });
        });
        // Write the actual file data to the stream
        uploadStream.end(buffer);
    });
}
/**
 * Deletes an image from Cloudinary using its Public ID.
 * Always call this when a user updates their photo to prevent "ghost files".
 */
export async function deleteFromCloudinary(publicId) {
    try {
        await cloudinary.uploader.destroy(publicId);
    }
    catch (error) {
        console.error("❌ Failed to delete from Cloudinary:", error);
    }
}
export default cloudinary;
//# sourceMappingURL=cloudinary.js.map