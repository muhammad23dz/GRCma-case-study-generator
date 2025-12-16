import { CaseInput, GeneratedReport, LLMConfig } from '@/types';
import { generateReportAction } from '@/app/actions';

export async function generateReport(input: CaseInput, userEmail: string, llmConfig?: LLMConfig): Promise<GeneratedReport> {
    // Call the server action which handles the DeepSeek API or custom LLM
    return await generateReportAction(input, userEmail, llmConfig);
}
