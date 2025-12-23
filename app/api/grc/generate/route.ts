import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { generateReportAction } from '@/app/actions';

// POST /api/grc/generate - AI-powered assessment generation
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return NextResponse.json({ error: 'User email required' }, { status: 400 });
        }

        const body = await request.json();

        // Map API request to CaseInput expected by server action
        const input = {
            companyName: body.companyName,
            companySize: body.companySize,
            keyChallenge: body.keyChallenge,
            targetFramework: body.targetFramework,
            // Add defaults for required fields if missing
            industry: 'Technology',
            riskAppetite: 'Balanced'
        };

        // Call the server action logic directly
        // Note: In a real Next.js app we might mistakenly call a server action from an API route. 
        // It's better to extract the logic, but generateReportAction is exported.
        // If generateReportAction uses headers/cookies standard methods, it might fail in API route context without care.
        // However, we are passing data explicitly.

        const report = await generateReportAction(input, userEmail);

        return NextResponse.json(report);

    } catch (error: any) {
        console.error('AI Generation API Error:', error);
        return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
    }
}
