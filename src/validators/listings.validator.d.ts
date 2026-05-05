import { z } from 'zod';
export declare const createListingSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    location: z.ZodString;
    pricePerNight: z.ZodNumber;
    guests: z.ZodNumber;
    type: z.ZodEnum<{
        APARTMENT: "APARTMENT";
        HOUSE: "HOUSE";
        VILLA: "VILLA";
        CABIN: "CABIN";
    }>;
    amenities: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const updateListingSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    pricePerNight: z.ZodOptional<z.ZodNumber>;
    guests: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<{
        APARTMENT: "APARTMENT";
        HOUSE: "HOUSE";
        VILLA: "VILLA";
        CABIN: "CABIN";
    }>>;
    amenities: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=listings.validator.d.ts.map