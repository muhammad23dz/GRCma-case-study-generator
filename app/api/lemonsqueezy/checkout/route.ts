
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { configureLemonSqueezy, LEMONSQUEEZY_STORE_ID } from '@/lib/lemonsqueezy';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const { planId } = await request.json();

        // Map internal Plan IDs to Lemon Squeezy Variant IDs
        // These should be in your .env
        const variantMap: Record<string, string | undefined> = {
            'SOLO': process.env.LEMONSQUEEZY_VARIANT_SOLO,
            'BUSINESS': process.env.LEMONSQUEEZY_VARIANT_BUSINESS,
            'ENTERPRISE': process.env.LEMONSQUEEZY_VARIANT_ENTERPRISE
        };

        const variantId = variantMap[planId];

        if (!variantId) {
            return NextResponse.json({ error: 'Invalid Plan or Variant ID missing' }, { status: 400 });
        }

        // Ensure SDK is set up
        configureLemonSqueezy();

        // Get origin from request headers
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Create Checkout
        const newCheckout = await createCheckout(
            LEMONSQUEEZY_STORE_ID,
            variantId,
            {
                checkoutData: {
                    email: user.emailAddresses[0]?.emailAddress,
                    name: user.fullName || undefined,
                    custom: {
                        userId: userId,
                        planId: planId
                    }
                },
                productOptions: {
                    redirectUrl: `${origin}/dashboard?payment=success`
                }
            }
        );

        // Check for errors
        if (newCheckout.error) {
            throw new Error(newCheckout.error.message);
        }

        const checkoutUrl = newCheckout.data?.data.attributes.url;

        return NextResponse.json({ url: checkoutUrl });

    } catch (err: any) {
        console.error('Lemon Squeezy Checkout Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
