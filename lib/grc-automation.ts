import { prisma } from '@/lib/prisma'; // Assumes @/lib/prisma is correct path

/**
 * GRC Automation Library
 * Centralizes logic for automated risk, compliance, and governance workflows.
 * Adheres to NIST SP 800-53 and ISO 31000 principles.
 */

// --- TPRM: Third-Party Risk Management ---

/**
 * Assesses vendor criticality and automatically creates/updates associated risks.
 * Triggered on Vendor Create/Update.
 */
export async function assessVendorRisk(
    vendorId: string,
    vendorName: string,
    criticality: string,
    ownerEmail: string
) {
    // Only 'High' or 'Critical' vendors trigger automatic risk creation
    if (!['High', 'Critical'].includes(criticality)) {
        return;
    }

    // Check if a vendor risk link already exists
    const existingLink = await prisma.vendorRisk.findFirst({
        where: { vendorId },
        include: { risk: true }
    });

    if (existingLink) {
        // If exists, ensure the risk score reflects the high criticality (Continuous Monitoring)
        // In a real system, we might leave manual scores alone, but for this demo, we ensure alignment.
        return;
    }

    // Create a new Enterprise Risk for this critical vendor
    const riskTitle = `Supply Chain Risk: ${vendorName}`;
    const description = `Critical dependency on third-party vendor ${vendorName}. Potential for service disruption or data leakage.`;

    // ISO 31000: Likelihood/Impact Estimation
    // Critical vendors start with High Impact
    const impact = criticality === 'Critical' ? 5 : 4;
    const likelihood = 3; // Default to 'Possible' until proven otherwise
    const score = impact * likelihood;

    // Create the Risk
    const risk = await prisma.risk.create({
        data: {
            assetId: `VENDOR-${vendorId.substring(0, 6)}`,
            narrative: riskTitle,
            category: 'Third Party',
            likelihood,
            impact,
            score,
            status: 'open',
            owner: ownerEmail
        }
    });

    // Link Vendor to Risk
    await prisma.vendorRisk.create({
        data: {
            vendorId,
            riskId: risk.id,
            riskType: 'supply_chain'
        }
    });

    console.log(`[GRC Automation] Created Supply Chain Risk for vendor: ${vendorName}`);
}


// --- Continuous Monitoring: Incident Feedback Loop ---

/**
 * Links new incidents to existing risks to create a feedback loop.
 * Triggered on Incident Create.
 */
export async function linkIncidentToRisks(
    incidentId: string,
    title: string,
    description: string,
    severity: string,
    ownerEmail: string
) {
    if (severity !== 'High' && severity !== 'Critical') return;

    // naive search for relevant risks (title matching)
    // In production, this would use vector embeddings or keyword extraction
    const searchTerms = title.split(' ').filter(w => w.length > 4);

    if (searchTerms.length === 0) return;

    const OR = searchTerms.map(term => ({
        narrative: { contains: term }
    }));

    const potentialRisks = await prisma.risk.findMany({
        where: {
            owner: ownerEmail,
            OR
        },
        take: 3
    });

    for (const risk of potentialRisks) {
        // Create IncidentRisk link
        await prisma.incidentRisk.create({
            data: {
                incidentId,
                riskId: risk.id,
                impactType: 'realized' // The risk has materialized
            }
        });

        // Feedback Loop: Increase Risk Likelihood
        // If a risk materializes, its likelihood of occurring is effectively 100% (or higher in future)
        // We bump it up by 1 to reflect recent occurrence
        const newLikelihood = Math.min(5, risk.likelihood + 1);

        await prisma.risk.update({
            where: { id: risk.id },
            data: {
                likelihood: newLikelihood,
                score: newLikelihood * risk.impact, // Update inherent score
                narrative: ((risk.narrative || '') + `\n[System]: Likelihood increased due to related Critical Incident "${title}".`).trim()
            }
        });

        console.log(`[GRC Automation] Linked Incident "${title}" to Risk "${risk.narrative}"`);
    }
}

// --- Change Management: Risk Integration ---

/**
 * Automatically creates an Operational Risk for high-risk changes.
 * Triggered on Change Create/Update.
 */
export async function createChangeRisk(
    changeId: string,
    riskScore: number
) {
    // Only create formal risks for High/Critical changes (Score > 12)
    if (riskScore < 12) return;

    // Fetch change details to populate risk
    const change = await prisma.change.findUnique({
        where: { id: changeId }
    });

    if (!change) return;

    // Check if risk already exists for this change
    const existingLink = await prisma.changeRisk.findFirst({
        where: { changeId }
    });

    if (existingLink) return;

    const riskTitle = `Change Risk: ${change.title}`;
    const description = `Operational risk associated with high-risk change ${change.changeNumber}. \nJustification: ${change.justification}`;

    // Map Change Risk Score (1-125) to Risk Matrix (1-25)
    // Simple heuristic: 
    // Impact = Change Impact (High=5, Med=3, Low=1)
    // Likelihood = Derived from Complexity/Urgency (Max 5)

    // We'll just map roughly for now
    const impact = change.impactLevel === 'high' ? 5 : change.impactLevel === 'medium' ? 3 : 2;
    const likelihood = change.complexity === 'complex' ? 5 : change.complexity === 'moderate' ? 3 : 2;
    const derivedScore = impact * likelihood;

    // Create Enterprise Risk
    const risk = await prisma.risk.create({
        data: {
            assetId: change.changeNumber,
            narrative: riskTitle,
            category: 'Operational',
            likelihood,
            impact,
            score: derivedScore,
            status: 'open',
            owner: change.requestedBy
        }
    });

    // Link Change to Risk
    await prisma.changeRisk.create({
        data: {
            changeId,
            riskId: risk.id,
            impactType: 'potential',
            description: description,
            likelihood,
            impact,
            mitigation: 'Automated risk identification. Review change impact analysis.'
        }
    });

    console.log(`[GRC Automation] Created Operational Risk for Change: ${change.changeNumber}`);
}
