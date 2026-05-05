export {};
/**
 * @swagger
 * components:
 *   schemas:
 *     # --- CORE MODELS ---
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Emmanuel Ntem"
 *         email:
 *           type: string
 *           example: "emmanuel@klab.rw"
 *         username:
 *           type: string
 *           example: "emmanuel_host"
 *         phone:
 *           type: string
 *           example: "+250780000000"
 *         role:
 *           type: string
 *           enum: [HOST, GUEST, ADMIN]
 *           example: "HOST"
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: "https://cloudinary.com"
 *         bio:
 *           type: string
 *           nullable: true
 *           example: "Software developer and travel enthusiast."
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Listing:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *           example: "Modern Kigali Apartment"
 *         description:
 *           type: string
 *         location:
 *           type: string
 *         pricePerNight:
 *           type: number
 *         guests:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [APARTMENT, HOUSE, VILLA, CABIN]
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *         rating:
 *           type: number
 *           nullable: true
 *         hostId:
 *           type: integer
 *         host:
 *           $ref: '#/components/schemas/User'
 *
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         checkIn:
 *           type: string
 *           format: date-time
 *         checkOut:
 *           type: string
 *           format: date-time
 *         totalPrice:
 *           type: number
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED]
 *         guestId:
 *           type: integer
 *         listingId:
 *           type: integer
 *         guest:
 *           $ref: '#/components/schemas/User'
 *         listing:
 *           $ref: '#/components/schemas/Listing'
 *
 *     # --- INPUT SCHEMAS (POST/PUT) ---
 *     RegisterInput:
 *       type: object
 *       required: [name, email, username, phone, password]
 *       properties:
 *         name: { type: string }
 *         email: { type: string }
 *         username: { type: string }
 *         phone: { type: string }
 *         password: { type: string, minLength: 8 }
 *         role: { type: string, enum: [HOST, GUEST], default: "GUEST" }
 *
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string }
 *         password: { type: string }
 *
 *     CreateListingInput:
 *       type: object
 *       required: [title, description, location, pricePerNight, guests, type, amenities]
 *       properties:
 *         title: { type: string }
 *         description: { type: string }
 *         location: { type: string }
 *         pricePerNight: { type: number }
 *         guests: { type: integer }
 *         type: { type: string, enum: [APARTMENT, HOUSE, VILLA, CABIN] }
 *         amenities: { type: array, items: { type: string } }
 *
 *     CreateBookingInput:
 *       type: object
 *       required: [listingId, checkIn, checkOut]
 *       properties:
 *         listingId: { type: integer }
 *         checkIn: { type: string, format: date-time }
 *         checkOut: { type: string, format: date-time }
 *
 *     # --- RESPONSE SCHEMAS ---
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Resource not found"
 */
//# sourceMappingURL=docs.routes.js.map