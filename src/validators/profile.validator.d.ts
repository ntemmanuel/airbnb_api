import { z } from "zod";
export declare const profileSchema: z.ZodObject<{
    bio: z.ZodOptional<z.ZodString>;
    website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    country: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateProfileSchema: z.ZodObject<{
    bio: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    website: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    country: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=profile.validator.d.ts.map