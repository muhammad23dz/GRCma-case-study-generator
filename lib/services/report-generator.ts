import { CaseInput, GeneratedReport, LLMConfig } from '@/types';
import { grcLLM } from '@/lib/llm/grc-service';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { IsolationContext } from '@/lib/isolation';

/**
 * Service to handle report generation logic.
 * Decoupled from Server Actions to allow calling from API routes with explicit context.
 */
export async function generateReportService(
  input: CaseInput,
  context: IsolationContext,
  llmConfig?: LLMConfig
): Promise<GeneratedReport> {

  // 1. CONFIGURATION RESOLUTION
  let config = llmConfig;

  // Fallback to Env if not provided
  if (!config?.apiKey) {
    if (process.env.DEEPSEEK_API_KEY) config = { provider: 'deepseek', apiKey: process.env.DEEPSEEK_API_KEY };
    else if (process.env.OPENAI_API_KEY) config = { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
    else if (process.env.GITHUB_TOKEN) config = { provider: 'github', apiKey: process.env.GITHUB_TOKEN };
  }

  if (!config?.apiKey) {
    throw new Error("Critical Configuration Error: System LLM Config missing. Real AI assessment generation cannot proceed without valid API keys.");
  }

  // 2. CACHING STRATEGY
  const promptContent = JSON.stringify({ ...input, targetFramework: input.targetFramework });
  const promptHash = createHash('sha256').update(promptContent).digest('hex');

  try {
    const cached = await prisma.lLMCache.findUnique({
      where: { promptHash }
    });

    if (cached && cached.expiresAt > new Date()) {
      console.log("CACHE HIT: Serving optimized response");
      await prisma.lLMUsage.create({
        data: {
          userId: context.userId,
          model: 'cache-hit',
          tokensIn: 0,
          tokensOut: 0,
          cost: 0,
          feature: 'report_generation'
        }
      });

      const data = JSON.parse(cached.response);
      return {
        id: crypto.randomUUID(),
        sections: data,
        timestamp: new Date().toISOString()
      };
    }
  } catch (cacheError) {
    console.warn('[ReportGenerator] Cache lookup failed, proceeding with generation:', cacheError);
  }

  // 3. GENERATION PROFILE
  const promptText = `You are a Senior GRC (Governance, Risk, and Compliance) Auditor with 20+ years of experience.
    
    CRITICAL CONTEXT:
    - Company: "${input.companyName}"
    - Industry: "${input.industry || 'Technology'}"
    - Company Size: "${input.companySize}"
    - Target Framework: "${input.targetFramework}"
    - Key Challenge: "${input.keyChallenge}"

    STRICT REQUIREMENTS FOR LOGICAL COHERENCE:
    
    1. EVERYTHING must be directly relevant to "${input.industry || 'Technology'}" industry and "${input.keyChallenge}":
       - Use industry-specific terminology and regulations.
    
    2. CONTROLS must directly address "${input.keyChallenge}".
    
    3. RISKS must be realistic scenarios for "${input.companyName}".
    
    4. VENDORS must be industry-specific and realistic.
    
    5. INCIDENTS must be causally linked to VENDORS or the KEY CHALLENGE.
    
    6. GAPS must show clear remediation paths tied to CONTROLS.

    COHERENCE CHECK:
    - Every Risk has mitigatingControlTitles that EXACTLY match control titles you generated.
    - Every Incident is traceable to a Vendor or the Key Challenge.
    - Every Gap has a remediation plan referencing specific controls.

    Respond ONLY with a VALID JSON object containing:
    executiveSummary, complianceMetrics, controls[], risks[], gaps[], policies[], vendors[], incidents[].
    
    FINAL REQUIREMENTS:
    - 6-8 controls
    - 4-5 risks
    - 3 industry-specific vendors
    - 2 incidents
    - 2-3 gaps
    - 3-4 policies

    Respond ONLY with the JSON object.`;

  try {
    console.log('[generateReportService] Calling LLM...');
    const result = await grcLLM.generateReport(promptText, config);
    const parsedContent = result.data;

    // 4. METERING & 5. CACHE WRITE
    try {
      const usage = result.usage;
      const inputTokens = usage?.prompt_tokens || 0;
      const outputTokens = usage?.completion_tokens || 0;
      const estimatedCost = (inputTokens * 0.00000014) + (outputTokens * 0.00000028);

      await prisma.lLMUsage.create({
        data: {
          userId: context.userId,
          model: result.provenance.model,
          tokensIn: inputTokens,
          tokensOut: outputTokens,
          cost: estimatedCost,
          feature: 'report_generation'
        }
      });

      // CACHE WRITE
      await prisma.lLMCache.upsert({
        where: { promptHash },
        update: { response: JSON.stringify(parsedContent), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        create: {
          promptHash,
          response: JSON.stringify(parsedContent),
          model: result.provenance.model,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
    } catch (dbError) {
      console.warn('[ReportGenerator] Metering/caching failed:', dbError);
    }

    // 6. PERSISTENCE LAYER
    try {
      const { persistReportData } = await import('@/lib/services/ai-mapper');
      await persistReportData(context, parsedContent);
    } catch (persistErr) {
      console.error("Persistence Warning:", persistErr);
    }

    return {
      id: crypto.randomUUID(),
      sections: parsedContent,
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error("LLM Generation Error:", error);
    throw error;
  }
}
