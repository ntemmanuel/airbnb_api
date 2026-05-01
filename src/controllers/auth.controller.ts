// =============================================================
// FILE: src/controllers/auth.controller.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Handles user registration and authentication.
//   It ensures passwords are secure and issues digital ID cards (JWT).
// =============================================================

import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

/**
 * POST /auth/register
 * Creates a new user account with a hashed password.
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, email, username, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 2. Validate password length
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 8 characters' });
    }

    // 3. Security: Prevent self-assigning ADMIN role
    if (role === 'ADMIN') {
      return res
        .status(403)
        .json({ error: 'Cannot register as an administrator' });
    }

    // 4. Check for existing user (Email or Username)
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: 'Email or username already in use' });
    }

    // 5. Hash the password before saving
    // 10 is the 'salt rounds'—the higher the number, the harder to hack (but slower).
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        role: role ?? 'GUEST',
        phone: req.body.phone || '', // Adding phone as it's required in our schema
      },
    });

    // 7. Remove password from the response object
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error); // Pass to global error handler
  }
}

/**
 * POST /auth/login
 * Verifies credentials and issues a digital "keycard" (JWT).
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // 2. Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // 3. Security: Check if user exists AND if password matches
    // We use the same "Invalid credentials" message for both to prevent
    // attackers from guessing which emails are registered.
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Sign the JWT (The "Keycard")
    // We include the userId and role in the payload (the card data).
    // This allows us to check permissions later without asking the database again.
    const token = jwt.default.sign(
      { userId: user.id, role: user.role },
      process.env['JWT_SECRET'] as string,
      { expiresIn: (process.env['JWT_EXPIRES_IN'] || '7d') as any },
    );

    // 5. Send back the token and user details (clean of sensitive data)
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /auth/me
 * Retrieves the currently logged-in user's profile and relevant data.
 */
export async function getMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;

    // Guard Clause: If authenticate middleware worked, this should exist,
    // but TS needs us to be explicit.
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        // If HOST, include their listings
        listings:
          req.role === 'HOST'
            ? {
                include: { _count: { select: { bookings: true } } },
              }
            : false,
        // If GUEST, include their bookings
        bookings:
          req.role === 'GUEST'
            ? {
                include: {
                  listing: { select: { title: true, location: true } },
                },
              }
            : false,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Strip password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/change-password
 * Allows a logged-in user to update their password.
 */
export async function changePassword(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // 1. Basic Validation
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: 'New password must be at least 8 characters' });
    }

    // Guard Clause: If authenticate middleware worked, this should exist,
    // but TS needs us to be explicit.
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // 2. Fetch User
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 3. Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // 4. Hash and Update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/forgot-password
 * Initiates the reset process without leaking user existence.
 */
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email } = req.body;

    // 1. Always give the same response to prevent email harvesting
    const successMessage =
      'If that email is registered, a reset link has been sent.';

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ message: successMessage });
    }

    // 2. Generate a secure raw token to send to the user
    const rawToken = crypto.randomBytes(32).toString('hex');

    // 3. Hash the token for database storage (Safety: DB theft won't leak tokens)
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    // 4. Set expiry to 1 hour from now
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    // 5. Update user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiry,
      },
    });

    // 6. Log the link (Since we don't have an email provider set up yet)
    console.log(`\n📧 RESET EMAIL SENT TO: ${email}`);
    console.log(
      `🔗 Link: http://localhost:3000/auth/reset-password/${rawToken}\n`,
    );

    res.status(200).json({ message: successMessage });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/reset-password/:token
 * Validates the token and updates the password.
 */
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token: rawToken } = req.params;
    const { password } = req.body;

    // 1. Hash the incoming raw token to compare with the DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken as string)
      .digest('hex');

    // 2. Find user with matching token that hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // 3. Validate new password
    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 8 characters' });
    }

    // 4. Hash new password and CLEAR token fields (makes token one-time use)
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
}
