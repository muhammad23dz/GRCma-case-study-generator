/**
 * Bootstrap script: Creates organization and sample data for authenticated user
 * Run after authenticating to populate the dashboard
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Find the most recent user (the one who just logged in)
    const user = await prisma.user.findFirst({
        orderBy: { id: 'desc' }
    });

    if (!user) {
        console.error('❌ No user found. Please sign in first.');
        return;
    }

    console.log(`👤 Found user: ${user.email}`);

    // 2. Create or find organization
    let org = user.orgId ? await prisma.organization.findUnique({ where: { id: user.orgId } }) : null;

    if (!org) {
        org = await prisma.organization.create({
            data: {
                name: `${user.name || 'My'}'s Organization`,
                plan: 'enterprise'
            }
        });
        console.log(`🏢 Created organization: ${org.name}`);

        // Link user to org
        await prisma.user.update({
            where: { id: user.id },
            data: { orgId: org.id, role: 'admin' }
        });
        console.log(`🔗 Linked user to organization as admin`);
    } else {
        console.log(`🏢 Using existing organization: ${org.name}`);
    }

    // 3. Seed sample data for this organization
    const existingRisks = await prisma.risk.count({ where: { organizationId: org.id } });

    if (existingRisks === 0) {
        console.log('📊 Seeding sample risks...');

        const risks = [
            { assetId: 'Customer Database', category: 'Security', likelihood: 4, impact: 5, status: 'open', narrative: 'Data Breach via Phishing - High risk of credential theft through sophisticated phishing attacks targeting employees.' },
            { assetId: 'AWS Infrastructure', category: 'Technical', likelihood: 3, impact: 5, status: 'mitigating', narrative: 'Cloud Misconfiguration - Potential exposure of S3 buckets and EC2 instances due to misconfigured security groups.' },
            { assetId: 'SaaS Vendors', category: 'Operational', likelihood: 3, impact: 4, status: 'open', narrative: 'Vendor Lock-in Risk - Over-dependence on single vendor for critical infrastructure components.' },
            { assetId: 'SOC 2 Certification', category: 'Compliance', likelihood: 4, impact: 5, status: 'open', narrative: 'Compliance Deadline Miss - Risk of failing to meet SOC 2 Type II audit deadline.' },
            { assetId: 'Engineering Team', category: 'Operational', likelihood: 2, impact: 5, status: 'accepted', narrative: 'Key Person Dependency - Critical knowledge concentrated in single team member.' },
        ];

        for (const r of risks) {
            await prisma.risk.create({
                data: {
                    assetId: r.assetId,
                    category: r.category,
                    likelihood: r.likelihood,
                    impact: r.impact,
                    score: r.likelihood * r.impact,
                    narrative: r.narrative,
                    status: r.status,
                    owner: user.email || 'unassigned',
                    organizationId: org.id,
                    drivers: {},
                }
            });
        }
        console.log(`✅ Created ${risks.length} sample risks`);
    } else {
        console.log(`📊 Found ${existingRisks} existing risks`);
    }

    // 4. Seed sample controls
    const existingControls = await prisma.control.count({ where: { organizationId: org.id } });

    if (existingControls === 0) {
        console.log('🛡️ Seeding sample controls...');

        const controls = [
            { title: 'Multi-Factor Authentication', controlType: 'preventive', controlRisk: 'high' },
            { title: 'Security Awareness Training', controlType: 'preventive', controlRisk: 'medium' },
            { title: 'Quarterly Access Reviews', controlType: 'detective', controlRisk: 'medium' },
            { title: 'Incident Response Plan', controlType: 'corrective', controlRisk: 'high' },
        ];

        for (const c of controls) {
            await prisma.control.create({
                data: {
                    ...c,
                    description: `Implementation of ${c.title}`,
                    owner: user.email || 'unassigned',
                    organizationId: org.id,
                }
            });
        }
        console.log(`✅ Created ${controls.length} sample controls`);
    } else {
        console.log(`🛡️ Found ${existingControls} existing controls`);
    }

    console.log('\n🎉 Platform data ready! Refresh your dashboard.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
