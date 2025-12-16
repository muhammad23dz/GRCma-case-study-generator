import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Impact Graph Data...');

    // 1. Ensure "SOC2" Framework exists
    let soc2 = await prisma.framework.findUnique({ where: { name: 'SOC2' } });
    if (!soc2) {
        soc2 = await prisma.framework.create({
            data: {
                name: 'SOC2',
                version: '2017',
                jurisdiction: 'United States',
                description: 'Service Organization Control 2'
            }
        });
    }

    // 2. Create Requirement "CC6.1 - Logical Access"
    const req = await prisma.frameworkRequirement.upsert({
        where: {
            frameworkId_requirementId: {
                frameworkId: soc2.id,
                requirementId: 'CC6.1'
            }
        },
        update: {},
        create: {
            frameworkId: soc2.id,
            requirementId: 'CC6.1',
            title: 'Logical Access Security',
            description: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events to meet the entity\'s objectives.'
        }
    });

    // 3. Create Controls mapped to this requirement
    const controls = [
        { title: 'MFA for Prod Access', category: 'Access Control' },
        { title: 'Quarterly Access Reviews', category: 'Governance' },
        { title: 'Offboarding Process', category: 'HR Security' }
    ];

    const createdControls = [];

    for (const c of controls) {
        const control = await prisma.control.create({
            data: {
                title: c.title,
                description: `Implementation of ${c.title}`,
                controlType: 'preventive', // Defaulting to preventive
                controlRisk: 'medium',
                // frameworkId and requirementId are not on Control, they are via Mapping
            }
        });
        createdControls.push(control);

        // Link via FrameworkMapping (The engine uses this)
        await prisma.frameworkMapping.create({
            data: {
                controlId: control.id,
                frameworkId: soc2.id,
                frameworkControlId: req.requirementId,
            }
        });
    }

    // 4. Create Risks linked to these controls
    const risks = [
        { narrative: 'Unauthorized Access to Customer Data', score: 25 },
        { narrative: 'Insider Threat Data Exfiltration', score: 20 },
        { narrative: 'Delayed Account Deactivation', score: 15 }
    ];

    for (const r of risks) {
        const risk = await prisma.risk.create({
            data: {
                narrative: r.narrative,
                category: 'Security',
                impact: 5,
                likelihood: r.score / 5,
                score: r.score,
            }
        });

        // Link Risk <-> Control
        // Randomly link to one of the created controls
        const randomControl = createdControls[Math.floor(Math.random() * createdControls.length)];

        await prisma.riskControl.create({
            data: {
                riskId: risk.id,
                controlId: randomControl.id,
                effectiveness: 'effective'
            }
        });
    }

    console.log(`✅ Seeded Impact Graph: SOC2 -> 3 Controls -> 3 High Risks`);
    console.log(`Use Framework ID: ${soc2.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
