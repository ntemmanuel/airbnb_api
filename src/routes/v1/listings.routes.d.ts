declare const router: import("express-serve-static-core").Router;
/**
 * @swagger
 * /listings/stats:
 *   get:
 *     summary: Get high-level statistics of all listings
 *     tags: [Listings]
 *     responses:
 *       200:
 *         description: Statistics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalListings: { type: integer }
 *                 averagePrice: { type: number }
 *                 byLocation: { type: object }
 *                 byType: { type: object }
 */
export default router;
//# sourceMappingURL=listings.routes.d.ts.map