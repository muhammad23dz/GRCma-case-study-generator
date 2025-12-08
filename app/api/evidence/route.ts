const riskId = searchParams.get('riskId');

const evidence = await prisma.evidence.findMany({
    where: {
        ...(controlId && { controlId }),
        ...(riskId && { riskId }),
    },
    include: {
        control: true,
        risk: true,
    },
    orderBy: { timestamp: 'desc' }
});

return NextResponse.json({ evidence });
    } catch (error: any) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
}
}

// POST /api/evidence - Create evidence with file upload
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const controlId = formData.get('controlId') as string | null;
        const riskId = formData.get('riskId') as string | null;
        const evidenceType = formData.get('evidenceType') as string;
        const source = formData.get('source') as string;

        let fileUrl = null;
        let fileName = null;

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const timestamp = Date.now();
            fileName = `${timestamp}-${file.name}`;
            const path = join(process.cwd(), 'public', 'uploads', 'evidence', fileName);

            await writeFile(path, buffer);
            fileUrl = `/uploads/evidence/${fileName}`;
        }

        const evidence = await prisma.evidence.create({
            data: {
                controlId,
                riskId,
                evidenceType,
                source,
                fileName,
                fileUrl,
                uploadedBy: session.user.email,
            }
        });

        return NextResponse.json({ evidence });
    } catch (error: any) {
        console.error('Error creating evidence:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
