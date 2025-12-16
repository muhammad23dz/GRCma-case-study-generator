
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

// Initialize Lemon Squeezy with API Key
// Ensure this runs once at startup
export function configureLemonSqueezy() {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
        console.warn("LEMONSQUEEZY_API_KEY is not defined in environment variables. Payment features will fail.");
        // Fallback for build time if needed, though strictly it should fail at runtime
        return;
    }
    lemonSqueezySetup({ apiKey });
}

// Configuration constants
export const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;

if (!LEMONSQUEEZY_STORE_ID && typeof window === 'undefined') {
    console.warn("LEMONSQUEEZY_STORE_ID is missing.");
}
