import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Risk History...');

    // 1. Get or Create a Target Risk
    let risk = await prisma.risk.findFirst();

    if (!risk) {
        console.log('No risk found, creating one...');
        risk = await prisma.risk.create({
            data: {
                category: 'security',
                impact: 5,
                likelihood: 3,
                score: 15,
                narrative: 'Potential Data Breach via Unpatched Server',
                status: 'open',
            }
        });
    }

    console.log(`Using Risk ID: ${risk.id}`);

    // 2. Generate History (Trending Upwards over last 60 days)
    // We'll simulate a slow rise from score 5 to 15
    const historyPoints = [];
    const days = 60;

    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Linear trend + random noise
        const baseScore = 5 + ((15 - 5) * ((days - i) / days));
        const noise = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const score = Math.max(1, Math.min(25, Math.round(baseScore + noise)));

        historyPoints.push({
            riskId: risk.id,
            score,
            likelihood: Math.ceil(score / 5),
            impact: 5,
            calculatedAt: date
        });
    }

    // 3. Insert History
    // clear old history first
    await prisma.riskHistory.deleteMany({ where: { riskId: risk.id } });

    await prisma.riskHistory.createMany({
        data: historyPoints
    });

    console.log(`✅ Seeded ${historyPoints.length} history points for Risk ${risk.id}`);
    console.log(`Please visit /analytics/preview and update the ID to: ${risk.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
