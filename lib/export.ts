/**
 * Gigachad GRC - Export Utilities
 * Ported from Gigachad GRC for GRCma integration
 */

// Export to CSV
export function exportToCSV<T extends Record<string, any>>(
    data: T[],
    filename: string,
    columns?: { key: keyof T; header: string }[]
): void {
    if (data.length === 0) return;

    const headers = columns
        ? columns.map(c => c.header)
        : Object.keys(data[0]);

    const keys = columns
        ? columns.map(c => c.key)
        : Object.keys(data[0]) as (keyof T)[];

    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            keys.map(key => {
                const value = row[key];
                const stringValue = value === null || value === undefined
                    ? ''
                    : String(value);
                // Escape quotes and wrap in quotes if contains comma
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            }).join(',')
        )
    ].join('\n');

    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

// Export to JSON
export function exportToJSON<T>(data: T, filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

// Helper to download file
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Export risk register to CSV
export function exportRiskRegister(risks: any[]): void {
    exportToCSV(risks, 'risk_register', [
        { key: 'id', header: 'Risk ID' },
        { key: 'category', header: 'Category' },
        { key: 'narrative', header: 'Description' },
        { key: 'likelihood', header: 'Likelihood (1-5)' },
        { key: 'impact', header: 'Impact (1-5)' },
        { key: 'score', header: 'Risk Score' },
        { key: 'status', header: 'Status' },
        { key: 'owner', header: 'Owner' },
        { key: 'createdAt', header: 'Created Date' }
    ]);
}

// Export control matrix to CSV
export function exportControlMatrix(controls: any[]): void {
    exportToCSV(controls, 'control_matrix', [
        { key: 'id', header: 'Control ID' },
        { key: 'title', header: 'Control Title' },
        { key: 'description', header: 'Description' },
        { key: 'controlType', header: 'Type' },
        { key: 'owner', header: 'Owner' },
        { key: 'controlRisk', header: 'Risk Level' },
        { key: 'createdAt', header: 'Created Date' }
    ]);
}

// Export audit findings to CSV
export function exportAuditFindings(findings: any[]): void {
    exportToCSV(findings, 'audit_findings', [
        { key: 'id', header: 'Finding ID' },
        { key: 'title', header: 'Title' },
        { key: 'description', header: 'Description' },
        { key: 'severity', header: 'Severity' },
        { key: 'status', header: 'Status' },
        { key: 'assignee', header: 'Assigned To' },
        { key: 'dueDate', header: 'Due Date' },
        { key: 'createdAt', header: 'Created Date' }
    ]);
}

// Export compliance report summary
export function exportComplianceReport(frameworks: any[]): void {
    const reportData = frameworks.map(fw => ({
        framework: fw.name,
        version: fw.version,
        totalRequirements: fw.totalRequirements || 0,
        compliantCount: fw.compliantCount || 0,
        complianceRate: fw.complianceRate || 0,
        lastAssessed: fw.lastAssessed || 'N/A'
    }));

    exportToCSV(reportData, 'compliance_report', [
        { key: 'framework', header: 'Framework' },
        { key: 'version', header: 'Version' },
        { key: 'totalRequirements', header: 'Total Requirements' },
        { key: 'compliantCount', header: 'Compliant' },
        { key: 'complianceRate', header: 'Compliance Rate (%)' },
        { key: 'lastAssessed', header: 'Last Assessed' }
    ]);
}

// Generate and download PDF report (placeholder - requires server-side implementation)
export async function exportToPDF(
    reportType: 'risk' | 'compliance' | 'audit',
    data: any
): Promise<void> {
    // This would call a server API to generate PDF
    console.warn('PDF export requires server-side implementation with libraries like puppeteer or pdfkit');

    // Fallback to JSON export
    exportToJSON(data, `${reportType}_report`);
}

// Format date for export
export function formatDateForExport(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

// Generate report filename with timestamp
export function generateReportFilename(prefix: string): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `${prefix}_${timestamp}`;
}
