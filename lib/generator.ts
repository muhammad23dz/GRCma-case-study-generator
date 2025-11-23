import { CaseInput, GeneratedReport } from '@/types';
import { generateReportAction } from '@/app/actions';

export async function generateReport(input: CaseInput): Promise<GeneratedReport> {
    // Call the server action which handles the DeepSeek API
    return await generateReportAction(input);
}
