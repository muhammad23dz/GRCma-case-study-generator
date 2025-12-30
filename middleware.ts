import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    '/',                              // Landing page
    '/login(.*)',                     // Login pages
    '/signup(.*)',                    // Signup pages
    '/about',                         // About page
    '/api/webhooks(.*)',              // Webhooks (Clerk, Stripe, etc.)
    '/api/trust/public(.*)',          // Public trust center API
    '/api/trust-center/public(.*)',   // Public trust center pages
    '/api-docs',                      // API documentation
    '/icon.png',                      // Favicon/icons
    '/favicon.ico',
]);

export default clerkMiddleware(async (auth, request) => {
    // If route is not public, require authentication
    if (!isPublicRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
