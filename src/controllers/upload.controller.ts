import type { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../config/cloudinary.js';

// POST /users/:id/avatar
export const uploadAvatar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params['id'] as string);

    // 1. Ownership Check
    if (req.userId !== id) {
      return res
        .status(403)
        .json({ error: 'You can only update your own avatar' });
    }

    // 2. Check if file exists (Multer puts it in req.file)
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 3. Cleanup: Delete old avatar from Cloudinary if it exists
    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    // 4. Upload new file to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'airbnb/avatars');

    // 5. Update Database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        avatar: result.url,
        avatarPublicId: result.publicId,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

// DELETE /users/:id/avatar
export const deleteAvatar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params['id'] as string);

    if (req.userId !== id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || !user.avatarPublicId) {
      return res.status(400).json({ error: 'No avatar to remove' });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(user.avatarPublicId);

    // Clear from Database
    await prisma.user.update({
      where: { id },
      data: {
        avatar: null,
        avatarPublicId: null,
      },
    });

    res.status(200).json({ message: 'Avatar removed successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /listings/:id/photos
export const uploadListingPhotos = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params['id'] as string);
    const files = req.files as Express.Multer.File[];

    // 1. Find and Verify Listing Ownership
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.hostId !== req.userId)
      return res.status(403).json({ error: 'Unauthorized' });

    // 2. Enforce 5-Photo Limit
    const existingCount = await prisma.listingPhoto.count({
      where: { listingId: id },
    });
    if (existingCount >= 5) {
      return res
        .status(400)
        .json({ error: 'Maximum of 5 photos allowed per listing' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // 3. Process Uploads (Only up to remaining slots)
    const limit = 5 - existingCount;
    const filesToUpload = files.slice(0, limit);

    const uploadPromises = filesToUpload.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, 'airbnb/listings');
      return prisma.listingPhoto.create({
        data: {
          url: result.url,
          publicId: result.publicId,
          listingId: id,
        },
      });
    });

    await Promise.all(uploadPromises);

    // 4. Return listing with fresh photos
    const updatedListing = await prisma.listing.findUnique({
      where: { id },
      include: { photos: true },
    });

    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

// DELETE /listings/:id/photos/:photoId
export const deleteListingPhoto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const listingId = parseInt(req.params['id'] as string);
    const photoId = parseInt(req.params['photoId'] as string);

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.hostId !== req.userId)
      return res.status(403).json({ error: 'Unauthorized' });

    const photo = await prisma.listingPhoto.findUnique({
      where: { id: photoId },
    });
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Security: Ensure photo actually belongs to this specific listing
    if (photo.listingId !== listingId) {
      return res
        .status(403)
        .json({ error: 'Photo does not belong to this listing' });
    }

    // Delete from Cloudinary and DB
    await deleteFromCloudinary(photo.publicId);
    await prisma.listingPhoto.delete({ where: { id: photoId } });

    res.status(200).json({ message: 'Photo deleted successfully' });
  } catch (error) {
    next(error);
  }
};
