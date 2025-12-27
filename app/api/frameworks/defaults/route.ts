import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch default frameworks setting
        const setting = await prisma.systemSetting.findUnique({
            where: {
                userId_key: {
                    userId,
                    key: 'compliance_defaultFrameworks'
                }
            }
        });

        // Common definition map to hydrate the strings
        const COMMON_FRAMEWORKS: Record<string, any> = {
            'ISO 27001': { name: 'ISO 27001', version: '2022', description: 'Information Security Management' },
            'SOC 2': { name: 'SOC 2', version: 'Type II', description: 'Service Organization Control' },
            'NIST CSF': { name: 'NIST CSF', version: '2.0', description: 'Cybersecurity Framework' },
            'GDPR': { name: 'GDPR', version: 'EU 2016/679', description: 'General Data Protection Regulation' },
            'HIPAA': { name: 'HIPAA', version: '2013', description: 'Health Insurance Portability and Accountability Act' },
            'PCI DSS': { name: 'PCI DSS', version: '4.0', description: 'Payment Card Industry Data Security Standard' }
        };

        const frameworkNames = setting?.value?.split(',') || ['ISO 27001', 'SOC 2'];
        const frameworks = frameworkNames.map(name => COMMON_FRAMEWORKS[name.trim()] || { name, version: '1.0', description: 'Custom Framework' });

        return NextResponse.json({ frameworks });
    } catch (error: any) {
        console.error('Error fetching defaults:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
