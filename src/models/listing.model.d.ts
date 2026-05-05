export interface Listing {
    id: number;
    title: string;
    description: string;
    location: string;
    pricePerNight: number;
    guests: number;
    type: 'apartment' | 'house' | 'villa' | 'cabin';
    amenities: string[];
    rating?: number;
    host: string;
}
export declare const listings: Listing[];
//# sourceMappingURL=listing.model.d.ts.map