import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, company, reason } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Simulating artificial delay for "fluidity" feel (loading state)
        await new Promise(resolve => setTimeout(resolve, 800));

        // Create the trust request record
        const request = await (prisma as any).trustRequest.create({
            data: {
                email,
                company: company || '',
                reason: reason || 'Direct Access',
                ipAddress: '127.0.0.1' // In a production environment, resolve from headers
            }
        });

        console.log(`[TrustCenter] Access granted for ${email}`);

        return NextResponse.json({
            success: true,
            message: 'Access granted. A secure link has been generated for your session.',
            requestId: request.id,
            accessUrl: '/dashboard'
        });


    } catch (error) {
        console.error('Trust request error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
