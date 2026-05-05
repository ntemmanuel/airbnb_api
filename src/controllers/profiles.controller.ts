// src/controllers/profiles.controller.ts
import type { NextFunction, Request, Response } from 'express';
import prisma from '../config/prisma.js';
import {
  profileSchema,
  updateProfileSchema,
} from '../validators/profile.validator.js';

// GET /users/:id/profile
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params['id'] as string;

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

// POST /users/:id/profile
export const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params['id'] as string;
    const validatedData = profileSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = await prisma.profile.findUnique({
      where: { userId },
    });

    if (existing) {
      return res.status(409).json({ message: 'User already has a profile' });
    }

    const profile = await prisma.profile.create({
      data: {
        userId,
        bio: validatedData.bio ?? null,
        website: validatedData.website ?? null,
        country: validatedData.country ?? null,
      },
    });

    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
};

// PUT /users/:id/profile
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params['id'] as string;
    const validatedData = updateProfileSchema.parse(req.body);

    const updated = await prisma.profile.update({
      where: { userId },
      data: {
        ...(validatedData.bio !== undefined && {
          bio: validatedData.bio,
        }),
        ...(validatedData.website !== undefined && {
          website: validatedData.website,
        }),
        ...(validatedData.country !== undefined && {
          country: validatedData.country,
        }),
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
