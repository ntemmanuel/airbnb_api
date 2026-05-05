// =============================================================
// FILE: src/config/multer.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Intercepts files from incoming requests.
//   It holds files in memory (RAM) temporarily before we
//   pass them to Cloudinary. It also acts as a "Security Filter"
//   to block non-image files or massive uploads.
// =============================================================
import multer from 'multer';
// 1. MEMORY STORAGE
// We don't save files to the server's hard drive because Cloudinary
// is our final destination. Memory storage keeps the file as a
// "Buffer" (raw data) in the request object.
const storage = multer.memoryStorage();
// 2. FILE FILTER (The Security Guard)
// We check the "mimetype" to ensure it's actually an image.
// Checking the extension (like .jpg) is easy to fake, but the
// mimetype is much more reliable.
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        // Null means no error, true means "Accept the file"
        cb(null, true);
    }
    else {
        // Reject the file with a helpful error message
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
};
// 3. CONFIGURE MULTER
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        // 5MB limit: (5 * 1024 * 1024 bytes)
        // This prevents "Memory Exhaustion" attacks from massive files.
        fileSize: 5 * 1024 * 1024,
    },
});
//# sourceMappingURL=multer.js.map