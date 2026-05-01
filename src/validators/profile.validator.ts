// src/validators/profile.validator.ts
import { z } from "zod";

export const profileSchema = z.object({
  bio: z.string().max(300, "Bio must be under 300 characters").optional(),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
  country: z.string().optional(),
});

export const updateProfileSchema = profileSchema.partial();
