
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get('x-signature');
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

        if (!secret || !signature) {
            return NextResponse.json({ error: 'Missing secret or signature' }, { status: 400 });
        }

        // Verify Signature
        const hmac = crypto.createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
        const signatureBuffer = Buffer.from(signature, 'utf8');

        if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const payload = JSON.parse(rawBody);
        const eventName = payload.meta.event_name;
        const data = payload.data;

        console.log(`Received Lemon Squeezy Event: ${eventName}`);

        switch (eventName) {
            case 'subscription_created':
            case 'subscription_updated':
                await handleSubscriptionUpdate(data);
                break;

            case 'order_created':
                await handleOrderCreated(data);
                break;

            default:
                // Ignore other events
                break;
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Lemon Squeezy Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook Handler Failed' }, { status: 500 });
    }
}

async function handleSubscriptionUpdate(data: any) {
    const attrs = data.attributes;
    const customData = data.meta?.custom_data || {};
    const userId = customData.userId;

    if (!userId) {
        // If userId is not in meta (e.g. renewal), try to find by customer ID or subscription ID
        // But for initial create, it should be there.
        console.warn("No userId in webhook metadata");
        return;
    }

    // Map Lemon Squeezy status to our status
    // LS: on_trial, active, paused, past_due, unpaid, cancelled, expired
    const status = attrs.status;

    // We typically care about variant_id to know the plan
    const variantId = attrs.variant_id.toString();

    // Determine internal Plan ID based on variant
    let planId = 'FREE';
    if (variantId === process.env.LEMONSQUEEZY_VARIANT_SOLO) planId = 'SOLO';
    if (variantId === process.env.LEMONSQUEEZY_VARIANT_BUSINESS) planId = 'BUSINESS';
    if (variantId === process.env.LEMONSQUEEZY_VARIANT_ENTERPRISE) planId = 'ENTERPRISE';

    await prisma.subscription.upsert({
        where: { userId: userId },
        create: {
            userId: userId,
            planId: planId,
            status: status,
            lemonSqueezyCustomerId: attrs.customer_id.toString(),
            lemonSqueezySubscriptionId: attrs.first_subscription_item.subscription_id.toString(), // or data.id check docs
        },
        update: {
            planId: planId,
            status: status,
            lemonSqueezyCustomerId: attrs.customer_id.toString(),
            // Ensure we track the sub ID
        }
    });
}

async function handleOrderCreated(data: any) {
    const attrs = data.attributes;
    const customData = data.meta?.custom_data || {};
    const userId = customData.userId;

    if (attrs.status !== 'paid') return;

    if (userId) {
        await prisma.transaction.create({
            data: {
                amount: new Prisma.Decimal(attrs.total / 100), // LS is in cents
                currency: attrs.currency,
                status: 'succeeded',
                lemonSqueezyOrderId: data.id.toString(),
                subscription: { connect: { userId } }
            }
        });
    }
}
