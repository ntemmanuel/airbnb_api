import { z } from 'zod';
export const createListingSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    location: z.string().min(2),
    pricePerNight: z.number().positive(),
    guests: z.number().int().min(1),
    type: z.enum(["APARTMENT", "HOUSE", "VILLA", "CABIN"]),
    // Add this line:
    // hostId: z.number().int().positive("A valid hostId is required"), 
    amenities: z.array(z.string()).min(1),
});
export const updateListingSchema = createListingSchema.partial();
// .partial() makes all fields optional — perfect for PUT/PATCH
//# sourceMappingURL=listings.validator.js.map