/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File management for avatars and listing photos via Cloudinary
 */
import { Router } from 'express';
import { upload } from '../../config/multer.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import {
  uploadAvatar,
  deleteAvatar,
  uploadListingPhotos,
  deleteListingPhoto,
} from '../../controllers/upload.controller.js';

const router = Router();

/**
 * @swagger
 * /users/{id}/avatar:
 *   post:
 *     summary: Upload or update user profile picture
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload (JPEG, PNG, WebP)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: No file uploaded or invalid file type
 *       403:
 *         description: Unauthorized - You can only update your own avatar
 */
// Routes mounted at /users in index.ts
router.post('/:id/avatar', authenticate, upload.single('image'), uploadAvatar);

/**
 * @swagger
 * /users/{id}/avatar:
 *   delete:
 *     summary: Remove profile picture
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Avatar removed successfully
 *       400:
 *         description: No avatar to remove
 */
router.delete('/:id/avatar', authenticate, deleteAvatar);

/**
 * @swagger
 * /users/listings/{id}/photos:
 *   post:
 *     summary: Upload multiple photos for a listing (Max 5)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Up to 5 image files
 *     responses:
 *       200:
 *         description: Photos uploaded successfully
 *       400:
 *         description: Limit exceeded or no files provided
 *       403:
 *         description: Unauthorized - Only the host can add photos
 */

router.post(
  '/listings/:id/photos',
  authenticate,
  upload.array('photos', 5),
  uploadListingPhotos,
);

/**
 * @swagger
 * /users/listings/{id}/photos/{photoId}:
 *   delete:
 *     summary: Delete a specific photo from a listing
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Listing ID
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Photo ID
 *     responses:
 *       200:
 *         description: Photo deleted successfully
 *       403:
 *         description: Unauthorized - Photo does not belong to this listing
 *       404:
 *         description: Photo not found
 */
router.delete(
  '/listings/:id/photos/:photoId',
  authenticate,
  deleteListingPhoto,
);

export default router;
