import { PrismaClient } from '@/lib/generated/client';
import { prisma } from '@/lib/prisma';

interface RiskTrend {
    date: string;
    score: number;
    projected?: boolean;
}

interface PredictionResult {
    currentScore: number;
    projectedScore: number;
    trend: 'up' | 'down' | 'stable';
    confidence: number;
    dataPoints: RiskTrend[];
}

export class PredictiveService {
    /**
     * Forecasts the risk score for a given risk over the next 30 days
     * using simple linear regression on historical data.
     */
    async forecastRisk(riskId: string, daysToProject: number = 30): Promise<PredictionResult | null> {
        const risk = await prisma.risk.findUnique({
            where: { id: riskId },
            include: {
                // @ts-ignore: RiskHistory verified in schema but types may lag
                history: {
                    orderBy: { calculatedAt: 'asc' },
                    take: 90, // Last 90 days context
                },
            },
        });

        if (!risk) return null;

        // Use current score if no history, otherwise use history
        const typedRisk = risk as unknown as { history: { calculatedAt: Date; score: number }[] };
        const history = (risk.history || []).map((h: any) => ({
            date: h.calculatedAt,
            score: h.score,
        }));

        // Add current state as latest point
        history.push({
            date: new Date(),
            score: risk.score,
        });

        if (history.length < 3) {
            // Not enough data for regression, return flat projection
            return {
                currentScore: risk.score,
                projectedScore: risk.score,
                trend: 'stable',
                confidence: 0.1,
                dataPoints: history.map(h => ({ date: h.date.toISOString(), score: h.score })),
            };
        }

        // Prepare data for regression (X = days from start, Y = score)
        const startDate = history[0].date.getTime();
        const points = history.map(h => ({
            x: (h.date.getTime() - startDate) / (1000 * 60 * 60 * 24), // Days since start
            y: h.score,
        }));

        const { slope, intercept, r2 } = this.calculateRegression(points);

        // Project future
        const lastDay = points[points.length - 1].x;
        const futureDay = lastDay + daysToProject;
        const projectedScore = Math.max(0, Math.min(25, Math.round(slope * futureDay + intercept))); // Clamp 0-25

        return {
            currentScore: risk.score,
            projectedScore,
            trend: slope > 0.05 ? 'up' : slope < -0.05 ? 'down' : 'stable',
            confidence: r2, // R-squared as confidence proxy
            dataPoints: [
                ...history.map(h => ({ date: h.date.toISOString(), score: h.score, projected: false })),
                {
                    date: new Date(Date.now() + daysToProject * 24 * 60 * 60 * 1000).toISOString(),
                    score: projectedScore,
                    projected: true,
                },
            ],
        };
    }

    /**
     * Simple Linear Regression (Least Squares)
     */
    private calculateRegression(points: { x: number; y: number }[]) {
        const n = points.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;

        for (const p of points) {
            sumX += p.x;
            sumY += p.y;
            sumXY += p.x * p.y;
            sumXX += p.x * p.x;
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Calculate R-squared
        const yMean = sumY / n;
        let ssTot = 0;
        let ssRes = 0;

        for (const p of points) {
            const predictedY = slope * p.x + intercept;
            ssTot += (p.y - yMean) ** 2;
            ssRes += (p.y - predictedY) ** 2;
        }

        const r2 = 1 - (ssRes / (ssTot || 1)); // Avoid div/0

        return { slope, intercept, r2 };
    }
}
