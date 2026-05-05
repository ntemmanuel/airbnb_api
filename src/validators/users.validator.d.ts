import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    phone: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<{
        HOST: "HOST";
        GUEST: "GUEST";
    }>>;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        HOST: "HOST";
        GUEST: "GUEST";
    }>>>;
}, z.core.$strip>;
//# sourceMappingURL=users.validator.d.ts.map