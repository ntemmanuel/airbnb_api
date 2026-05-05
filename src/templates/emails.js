// =============================================================
// FILE: src/templates/emails.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Provides HTML templates for all system emails.
//   Consistent branding with Airbnb colors (#FF5A5F).
// =============================================================
const BRAND_COLOR = '#FF5A5F';
/**
 * 1. Welcome Email Template
 */
export const welcomeEmail = (name, role) => {
    const message = role === 'HOST'
        ? "We're excited to help you share your space. Start by creating your first listing to attract travelers!"
        : 'From cabins to castles, explore unique stays and experiences around the world.';
    return `
    <div style="font-family: sans-serif; color: #333; max-width: 600px;">
      <h1 style="color: ${BRAND_COLOR}">Welcome to Airbnb, ${name}!</h1>
      <p>${message}</p>
      <div style="margin-top: 20px;">
        <a href="http://localhost:3000/listings" 
           style="background-color: ${BRAND_COLOR}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
           ${role === 'HOST' ? 'Create a Listing' : 'Explore Stays'}
        </a>
      </div>
    </div>
  `;
};
export function bookingConfirmationEmail({ guestName, listingTitle, location, checkIn, checkOut, totalPrice, }) {
    return `
    <h1>Booking Confirmed 🎉</h1>
    <p>Hello ${guestName},</p>
    <p>Your booking at <strong>${listingTitle}</strong> (${location}) is confirmed.</p>
    <p>Check-in: ${checkIn}</p>
    <p>Check-out: ${checkOut}</p>
    <p>Total: $${totalPrice}</p>
  `;
}
/**
 * 3. Booking Cancellation Email Template
 */
export const bookingCancellationEmail = (guestName, listingTitle, checkIn, checkOut) => {
    return `
    <div style="font-family: sans-serif; color: #333; max-width: 600px;">
      <h1 style="color: #666;">Booking Cancelled</h1>
      <p>Hi ${guestName}, your reservation for <strong>${listingTitle}</strong> from ${checkIn} to ${checkOut} has been successfully cancelled.</p>
      <p>We're sorry to see you go! Feel free to explore other unique stays for your next trip.</p>
      <a href="http://localhost:3000/listings" style="color: ${BRAND_COLOR}; font-weight: bold;">Find another listing</a>
    </div>
  `;
};
/**
 * 4. Password Reset Email Template
 */
export const passwordResetEmail = (name, resetLink) => {
    return `
    <div style="font-family: sans-serif; color: #333; max-width: 600px;">
      <h1 style="color: ${BRAND_COLOR}">Reset your password</h1>
      <p>Hi ${name}, we received a request to reset your password. Click the button below to choose a new one:</p>
      <div style="margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: ${BRAND_COLOR}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
           Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">This link will expire in <strong>1 hour</strong>.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
};
//# sourceMappingURL=emails.js.map