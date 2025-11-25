'use server';

import OpenAI from 'openai';
import { CaseInput, GeneratedReport } from '@/types';

// Initialize OpenAI client with DeepSeek configuration
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
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
    1. **Actionable Steps**: Content MUST provide real, followable steps. Be specific and prescriptive.
    2. **Structured Text**: The 'content' field MUST use HTML tags for structure. Use <ul> and <li> for lists, <p> for paragraphs, and <strong> for emphasis. Do NOT use markdown.
    3. **Action Tables**: Each section MUST include an 'actionTable' field containing an HTML table with step-by-step actions. 
       - Use proper HTML: <table class="action-table"><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody>...</tbody></table>
       - Include 3-5 concrete, actionable steps per section
       - Be specific about owners (roles like CISO, Risk Manager, etc.) and realistic timelines
    4. **Detail & Tone**: Content must be sophisticated, educational, and "Big 4" consulting style.

    Structure & Content Requirements (return this exact JSON structure):
    {
      "executiveSummary": { 
        "title": "Executive Summary", 
        "content": "<p>High-level overview...</p>",
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Review current state</td><td>CISO</td><td>Week 1</td></tr></tbody></table>"
      },
      "driversAndRisks": { 
        "title": "Drivers and Risks", 
        "content": "<p>Analysis...</p>",
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Identify key risks</td><td>Risk Team</td><td>Week 2</td></tr></tbody></table>"
      },
      "engagementType": { 
        "title": "Engagement Type", 
        "content": "<p>Description...</p>",
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Define scope</td><td>PM</td><td>Week 1</td></tr></tbody></table>"
      },
      "methodology": { 
        "title": "Methodology", 
        "content": "<p>Methodology details...</p>",
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Discovery</td><td>Consultant</td><td>Week 1-2</td></tr></tbody></table>"
      },
      "gapAnalysis": { 
        "title": "Gap Analysis", 
        "content": "<p>Gap findings...</p>",
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Identify gaps</td><td>Analyst</td><td>Week 3</td></tr></tbody></table>"
      },
      "maturityFindings": { 
        "title": "Maturity Findings", 
        "content": "<p>Maturity assessment...</p>",
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Assess maturity</td><td>Auditor</td><td>Week 4</td></tr></tbody></table>"
      },
      "roadmap": { 
        "title": "Strategic Roadmap", 
        "content": "<p>Implementation roadmap...</p>",
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Phase 1: Foundation</td><td>Program Lead</td><td>Q1 2025</td></tr><tr><td>2</td><td>Phase 2: Optimization</td><td>Program Lead</td><td>Q2 2025</td></tr></tbody></table>"
      },
      "businessImpact": { 
        "title": "Business Impact & ROI", 
        "content": "<p>Expected benefits...</p>",
        "actionTable": "<table class='action-table'><thead><tr><th>Step</th><th>Action</th><th>Owner</th><th>Timeline</th></tr></thead><tbody><tr><td>1</td><td>Calculate ROI</td><td>Finance</td><td>Week 5</td></tr></tbody></table>"
      }
    }

    Tone & Style Guidelines:
    1. **Sophisticated & Professional**: Use vocabulary like 'Strategic alignment', 'Operational resilience', 'Risk appetite'.
    2. **Educational**: Explain implications, not just facts.
    3. **Specific**: Tailor to ${industry} and ${challenge}.
    4. **JSON Only**: Return ONLY valid JSON. No code blocks, no markdown.
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
      if (sections[key].actionTable && typeof sections[key].actionTable !== 'string') {
        if (typeof sections[key].actionTable === 'object') {
          sections[key].actionTable = String(sections[key].actionTable);
        }
      }
    }

    return {
      id: `HMAMOUCH-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      sections: sections
    };

  } catch (error: any) {
    console.error("DeepSeek API Error:", error);
    console.error("Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status
    });

    const errorMessage = error?.message || error?.response?.data?.error || 'Unknown error';
    throw new Error(`Failed to generate report via DeepSeek API: ${errorMessage}`);
  }
}
