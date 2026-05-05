import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
declare const prisma: PrismaClient<{
    adapter: PrismaPg;
}, never, import("../generated/prisma/runtime/client.js").DefaultArgs>;
export declare function connectDB(): Promise<void>;
export default prisma;
//# sourceMappingURL=prisma.d.ts.map