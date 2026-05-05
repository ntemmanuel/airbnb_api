/**
 * 1. Welcome Email Template
 */
export declare const welcomeEmail: (name: string, role: string) => string;
/**
 * 2. Booking Confirmation Email Template
 */
type BookingEmailParams = {
    guestName: string;
    listingTitle: string;
    location: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
};
export declare function bookingConfirmationEmail({ guestName, listingTitle, location, checkIn, checkOut, totalPrice, }: BookingEmailParams): string;
/**
 * 3. Booking Cancellation Email Template
 */
export declare const bookingCancellationEmail: (guestName: string, listingTitle: string, checkIn: string, checkOut: string) => string;
/**
 * 4. Password Reset Email Template
 */
export declare const passwordResetEmail: (name: string, resetLink: string) => string;
export {};
//# sourceMappingURL=emails.d.ts.map