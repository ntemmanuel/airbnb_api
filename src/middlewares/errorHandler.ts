import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/index.js";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors: err.flatten().fieldErrors 
    });
  }

  // 2. Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return res.status(409).json({ error: `Unique constraint failed on: ${err.meta?.target}` });
      case "P2025":
        return res.status(404).json({ error: "Record not found" });
      case "P2003":
        return res.status(400).json({ error: "Related record (Foreign Key) does not exist or is protected" });
      default:
        return res.status(500).json({ error: "Internal Database error" });
    }
  }

  // 3. Fallback for everything else
  console.error("🔥 Unexpected Error:", err);
  res.status(500).json({ error: "Something went wrong" });
}
