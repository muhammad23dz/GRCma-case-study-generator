'use server';

import OpenAI from 'openai';
import { CaseInput, GeneratedReport } from '@/types';
import { prisma } from '@/lib/prisma';

// Initialize OpenAI client with DeepSeek configuration
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

export async function generateReportAction(input: CaseInput, userEmail: string): Promise<GeneratedReport> {
  const { companyName, targetFramework, companySize, keyChallenge } = input;

  const prompt = `
    You are a GRC consultant creating a ${targetFramework} assessment for ${companyName}.
    
    Company: ${companyName} (${companySize})
    Framework: ${targetFramework}
    Challenge: ${keyChallenge}

    CRITICAL: Return ONLY valid JSON. All content MUST BE COMPLETE SENTENCES - no cutoffs.
    
    Generate professional 2-3 paragraph narratives for each section that reference the company and framework.
    
    Return this JSON:
    {
      "executiveSummary": { 
        "title": "Executive Summary", 
        "content": "<p>Write 2-3 complete paragraphs about ${companyName}'s ${targetFramework} readiness...</p>", 
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Gap assessment</td><td>CISO</td><td>Week 1-2</td></tr></tbody></table>" 
      },
      "driversAndRisks": { 
        "title": "Drivers and Risks", 
        "content": "<p>Explain drivers for ${companyName} pursuing ${targetFramework}...</p>", 
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Risk workshop</td><td>Risk Team</td><td>Week 2</td></tr></tbody></table>" 
      },
      "engagementType": { 
        "title": "Engagement Type", 
        "content": "<p>Describe recommended engagement for ${companyName}...</p>", 
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Scope definition</td><td>PM</td><td>Week 1</td></tr></tbody></table>" 
      },
      "methodology": { 
        "title": "Methodology", 
        "content": "<p>Explain ${targetFramework} assessment methodology...</p>", 
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Discovery</td><td>Consultant</td><td>Week 1-2</td></tr></tbody></table>" 
      },
      "gapAnalysis": { 
        "title": "Gap Analysis", 
        "content": "<p>Detail gaps in ${companyName}'s ${targetFramework} posture addressing: ${keyChallenge.substring(0, 150)}...</p>", 
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Gap mapping</td><td>Analyst</td><td>Week 3</td></tr></tbody></table>" 
      },
      "maturityFindings": { 
        "title": "Maturity Findings", 
        "content": "<p>Assess ${companyName} maturity for ${targetFramework}...</p>", 
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Maturity scoring</td><td>Auditor</td><td>Week 4</td></tr></tbody></table>" 
      },
      "roadmap": { 
        "title": "Strategic Roadmap", 
        "content": "<p>Outline ${targetFramework} roadmap for ${companyName}...</p>", 
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Phase 1</td><td>Lead</td><td>Q1-Q2</td></tr></tbody></table>" 
      },
      "businessImpact": { 
        "title": "Business Impact", 
        "content": "<p>Describe business value for ${companyName} achieving ${targetFramework}...</p>", 
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>ROI analysis</td><td>Finance</td><td>Week 5</td></tr></tbody></table>" 
      },
      "controls": [
        { "title": "Multi-Factor Authentication", "description": "MFA for ${companyName} per ${targetFramework}", "controlType": "preventive" },
        { "title": "Data Encryption", "description": "Encryption for ${targetFramework} compliance", "controlType": "preventive" },
        { "title": "Access Reviews", "description": "Quarterly reviews for ${targetFramework}", "controlType": "detective" },
        { "title": "Incident Response", "description": "IR procedures for ${companyName}", "controlType": "corrective" },
        { "title": "Vendor Management", "description": "Third-party program per ${targetFramework}", "controlType": "preventive" }
      ],
      "risks": [
        { "category": "Security", "narrative": "Unauthorized access to ${companyName} data", "likelihood": 4, "impact": 5 },
        { "category": "Compliance", "narrative": "${targetFramework} non-compliance risk", "likelihood": 3, "impact": 4 },
        { "category": "Operational", "narrative": "Service disruption at ${companyName}", "likelihood": 2, "impact": 4 }
      ],
      "vendors": [
        { "name": "Cloud Provider", "category": "Infrastructure", "riskScore": 25 },
        { "name": "Payment Gateway", "category": "Financial", "riskScore": 55 },
        { "name": "SaaS Platform", "category": "Software", "riskScore": 15 }
      ]
    }
  `;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
      model: "deepseek-chat",
      response_format: { type: 'json_object' },
      max_tokens: 8000  // Increased to ensure complete responses
    });

    const content = completion.choices[0].message.content;
    console.log("DeepSeek Raw Response Length:", content?.length);

    if (!content) {
      throw new Error("No content received from API");
    }

    // Aggressive JSON cleaning to handle malformed responses
    let cleanContent = content
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    // Remove any trailing commas before closing braces/brackets
    cleanContent = cleanContent.replace(/,(\s*[}\]])/g, '$1');

    // Try to extract JSON if wrapped in text
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }

    console.log("Cleaned JSON Length:", cleanContent.length);
    console.log("First 500 chars:", cleanContent.substring(0, 500));
    console.log("Last 500 chars:", cleanContent.substring(cleanContent.length - 500));

    let data: any;
    try {
      data = JSON.parse(cleanContent);
    } catch (parseError: any) {
      console.error("JSON Parse Error:", parseError.message);
      console.error("Error position:", parseError.message.match(/position (\d+)/)?.[1]);

      // Try to find and log the problematic area
      const posMatch = parseError.message.match(/position (\d+)/);
      if (posMatch) {
        const pos = parseInt(posMatch[1]);
        const start = Math.max(0, pos - 100);
        const end = Math.min(cleanContent.length, pos + 100);
        console.error("Problematic area:", cleanContent.substring(start, end));
      }

      throw new Error(`JSON parsing failed: ${parseError.message}. Please try again with a simpler description.`);
    }

    // PERSISTENCE LAYER: Save generated data to Database
    // We clean up existing demo data to ensure a fresh "Case Study" environment
    await prisma.$transaction(async (tx) => {
      // 1. Cleanup old demo data
      await tx.control.deleteMany();
      await tx.risk.deleteMany();
      await tx.vendor.deleteMany();
      await tx.action.deleteMany();
      await tx.incident.deleteMany();
      await tx.policy.deleteMany();

      // 2. Insert Controls
      if (data.controls && Array.isArray(data.controls)) {
        await tx.control.createMany({
          data: data.controls.map((c: any) => ({
            title: c.title,
            description: c.description || c.title,
            controlType: c.controlType || 'preventive',
            controlRisk: 'medium',
            owner: userEmail
          }))
        });
      }

      // 3. Insert Risks
      if (data.risks && Array.isArray(data.risks)) {
        await tx.risk.createMany({
          data: data.risks.map((r: any) => ({
            category: r.category || 'General',
            narrative: r.narrative || 'Identified risk',
            likelihood: r.likelihood || 3,
            impact: r.impact || 3,
            score: (r.likelihood || 3) * (r.impact || 3),
            status: 'open',
            owner: userEmail
          }))
        });
      }

      // 4. Insert Vendors
      if (data.vendors && Array.isArray(data.vendors)) {
        await tx.vendor.createMany({
          data: data.vendors.map((v: any) => ({
            name: v.name,
            category: v.category || 'Service',
            riskScore: v.riskScore || 50,
            status: 'active',
            owner: userEmail
          }))
        });
      }

      // 5. Create some default Actions based on Risks
      await tx.action.createMany({
        data: [
          { title: 'Remediate Critical Vulnerabilities', type: 'corrective', status: 'open', priority: 'critical', description: 'Address high priority findings from gap analysis', owner: userEmail },
          { title: 'Finalize Policy Review', type: 'preventive', status: 'in_progress', priority: 'high', description: 'Complete annual policy review cycle', owner: userEmail },
          { title: 'Vendor Security Assessment', type: 'detective', status: 'open', priority: 'medium', description: 'Assess critical vendors', owner: userEmail }
        ]
      });

      // 6. Generate Evidence for ~60% of controls to give a realistic "Starting Score"
      // Since we just wiped and recreated controls, we can fetch all of them
      const createdControls = await tx.control.findMany();

      const evidenceData = createdControls
        .filter(() => Math.random() > 0.4) // ~60% chance
        .map(control => ({
          controlId: control.id,
          evidenceType: 'document',
          source: 'manual',
          status: 'approved',
          description: `Initial evidence for ${control.title}`,
          verificationStatus: 'verified',
          uploadedBy: userEmail
        }));

      if (evidenceData.length > 0) {
        await tx.evidence.createMany({
          data: evidenceData
        });
      }
    });

    return {
      id: `HMAMOUCH-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      sections: data
    };

  } catch (error: any) {
    console.error("DeepSeek/Prisma Error:", error);
    const errorMessage = error?.message || 'Unknown error';
    throw new Error(`Failed to generate report: ${errorMessage}`);
  }
}
