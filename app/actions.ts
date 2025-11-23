'use server';

import OpenAI from 'openai';
import { CaseInput, GeneratedReport } from '@/types';

// Initialize OpenAI client with DeepSeek configuration
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-73666742f11a4010a1169f1c9477ac04',
});

export async function generateReportAction(input: CaseInput): Promise<GeneratedReport> {
  const { industry, challenge, currentPosture, desiredOutcome } = input;

  const prompt = `
    You are a distinguished GRC (Governance, Risk, and Compliance) Principal Consultant at HMAMOUCH.
    Your task is to generate a comprehensive, high-level case study report for a client in the ${industry} sector.
    
    Client Context:
    - Industry: ${industry}
    - Primary Challenge: ${challenge}
    - Current Security Posture: ${currentPosture}
    - Desired Outcome: ${desiredOutcome}

    The report MUST be in JSON format with the following structure. 
    
    CRITICAL CONTENT RULES:
    1. **Actionable Steps**: Content MUST provide real, followable steps (e.g., "Step 1: ...", "Step 2: ..."). Do NOT use generic high-level fluff. Be specific and prescriptive.
    2. **Structured Text**: The 'content' field MUST use HTML tags for structure. Use <ul> and <li> for lists, <p> for paragraphs, and <strong> for emphasis. Do NOT use markdown.
    3. **Colored Mindmaps**: Each section MUST include a 'mindmap' field containing valid Mermaid.js 'mindmap' syntax. IMPORTANT: You MUST use Mermaid styling to color the nodes (e.g., classes like :::urgent, :::warning, :::ok). Make the mindmaps visually appealing and colorful, not just grey.
    4. **Detail & Tone**: Content must be sophisticated, educational, and "Big 4" consulting style.

    Structure & Content Requirements:
    {
      "executiveSummary": { 
        "title": "Executive Summary", 
        "content": "<p>A high-level strategic overview...</p>",
        "mindmap": "mindmap\\n  root((Executive Summary))\\n    Strategic Value:::ok\\n    Risk Reduction:::urgent\\n    Business Growth:::warning"
      },
      "driversAndRisks": { 
        "title": "Drivers and Risks", 
        "content": "<p>Detailed analysis...</p><ul><li><strong>Step 1: Identify...</strong> ...</li></ul>",
        "mindmap": "mindmap\\n  root((Drivers & Risks))\\n    Internal:::urgent\\n      Operational\\n      Cultural\\n    External:::warning\\n      Regulatory\\n      Market"
      },
      "engagementType": { 
        "title": "Engagement Type", 
        "content": "<p>Description...</p>",
        "mindmap": "mindmap\\n  root((Engagement))\\n    Scope:::ok\\n    Objectives\\n    Deliverables"
      },
      "methodology": { 
        "title": "Methodology", 
        "content": "<p>Elaborate on HMAMOUCH methodology with steps...</p>",
        "mindmap": "mindmap\\n  root((Methodology))\\n    Discovery:::ok\\n    Analysis:::warning\\n    Quantification:::urgent\\n    Remediation:::ok"
      },
      "gapAnalysis": { 
        "title": "Gap Analysis", 
        "content": "<p>Comparison...</p>",
        "mindmap": "mindmap\\n  root((Gap Analysis))\\n    People:::warning\\n    Process:::urgent\\n    Technology:::ok"
      },
      "maturityFindings": { 
        "title": "Maturity Findings", 
        "content": "<p>Assessment...</p>",
        "mindmap": "mindmap\\n  root((Maturity))\\n    Current: Level 2:::urgent\\n    Target: Level 4:::ok\\n    Gaps:::warning"
      },
      "roadmap": { 
        "title": "Strategic Roadmap", 
        "content": "<p>Phased approach with concrete steps...</p>",
        "mindmap": "mindmap\\n  root((Roadmap))\\n    Phase 1: Foundation:::urgent\\n    Phase 2: Optimization:::warning\\n    Phase 3: Innovation:::ok"
      },
      "businessImpact": { 
        "title": "Business Impact & ROI", 
        "content": "<p>Benefits...</p>",
        "mindmap": "mindmap\\n  root((Impact))\\n    ROI:::ok\\n    Trust:::ok\\n    Efficiency:::ok"
      }
    }

    Tone & Style Guidelines:
    1. **Sophisticated & Professional**: Use vocabulary like 'Strategic alignment', 'Operational resilience', 'Risk appetite', 'Holistic framework'.
    2. **Educational**: Don't just state facts; explain the *implications*. This report should teach a student or junior consultant how to think about GRC.
    3. **Specific**: Tailor every section to the ${industry} industry and the specific ${challenge}.
    4. **JSON Only**: Return ONLY the valid JSON object. No code blocks.
  `;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
      model: "deepseek-chat",
    });

    const content = completion.choices[0].message.content;
    console.log("DeepSeek Raw Response:", content);

    if (!content) {
      throw new Error("No content received from API");
    }

    // Clean up potential markdown code blocks
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

    const sections = JSON.parse(cleanContent);

    // Validate structure
    const requiredSections = [
      'executiveSummary', 'driversAndRisks', 'engagementType',
      'methodology', 'gapAnalysis', 'maturityFindings',
      'roadmap', 'businessImpact'
    ];

    for (const key of requiredSections) {
      if (!sections[key]) {
        throw new Error(`Missing section: ${key}`);
      }
      if (typeof sections[key].content !== 'string') {
        if (typeof sections[key].content === 'object') {
          sections[key].content = JSON.stringify(sections[key].content);
        } else {
          throw new Error(`Invalid content type for section ${key}: ${typeof sections[key].content}`);
        }
      }
      if (sections[key].mindmap && typeof sections[key].mindmap !== 'string') {
        if (typeof sections[key].mindmap === 'object') {
          sections[key].mindmap = String(sections[key].mindmap);
        }
      }
    }

    return {
      id: `HMAMOUCH-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      sections: sections
    };

  } catch (error) {
    console.error("DeepSeek API Error:", error);
    throw new Error("Failed to generate report via DeepSeek API");
  }
}
