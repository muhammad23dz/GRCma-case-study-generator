/**
 * Gigachad GRC - Validation Utilities
 * Ported from Gigachad GRC for GRCma integration
 */

// Email validation
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password strength validation
export function validatePasswordStrength(password: string): {
    valid: boolean;
    score: number;
    feedback: string[];
} {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Password must be at least 8 characters');

    if (password.length >= 12) score += 1;

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    return {
        valid: score >= 4,
        score,
        feedback
    };
}

// Risk score validation
export function validateRiskScore(likelihood: number, impact: number): {
    valid: boolean;
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
} {
    const valid = likelihood >= 1 && likelihood <= 5 && impact >= 1 && impact <= 5;
    const score = likelihood * impact;

    let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (score >= 15) level = 'critical';
    else if (score >= 10) level = 'high';
    else if (score >= 5) level = 'medium';

    return { valid, score, level };
}

// URL validation
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Phone number validation (international format)
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Date validation
export function isValidDate(date: string | Date): boolean {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
}

// RTO/RPO validation (hours)
export function validateRecoveryObjective(hours: number): {
    valid: boolean;
    tier: 'tier1' | 'tier2' | 'tier3' | 'tier4';
    description: string;
} {
    const valid = hours >= 0;

    let tier: 'tier1' | 'tier2' | 'tier3' | 'tier4';
    let description: string;

    if (hours <= 1) {
        tier = 'tier1';
        description = 'Mission Critical - Immediate recovery required';
    } else if (hours <= 4) {
        tier = 'tier2';
        description = 'Business Critical - Same-day recovery';
    } else if (hours <= 24) {
        tier = 'tier3';
        description = 'Important - Next-day recovery acceptable';
    } else {
        tier = 'tier4';
        description = 'Standard - Extended recovery acceptable';
    }

    return { valid, tier, description };
}

// Control ID format validation (e.g., "AC-1", "A.5.1.1")
export function isValidControlId(id: string): boolean {
    const patterns = [
        /^[A-Z]{2,3}-\d{1,2}(\.\d{1,2})?$/, // NIST style: AC-1, AC-1.1
        /^[A-Z]\.\d+(\.\d+)*$/, // ISO style: A.5.1
        /^CC\d+\.\d+$/, // SOC2 style: CC6.1
        /^(Art\.?\s*)?\d+(\.\d+)*$/ // GDPR style: Art. 5.1
    ];
    return patterns.some(pattern => pattern.test(id));
}

// Framework name validation
export function isValidFrameworkName(name: string): boolean {
    const validFrameworks = [
        'ISO27001', 'ISO27002', 'ISO27017', 'ISO27018', 'ISO27701',
        'NIST_CSF', 'NIST_800_53', 'NIST_800_171',
        'SOC2', 'SOC1',
        'PCI_DSS',
        'GDPR', 'CCPA', 'HIPAA',
        'DGSSI', 'BAM' // Moroccan frameworks
    ];
    return validFrameworks.includes(name.toUpperCase().replace(/[\s-]/g, '_'));
}

// Criticality validation
export function isValidCriticality(criticality: string): boolean {
    return ['low', 'medium', 'high', 'critical'].includes(criticality.toLowerCase());
}

// Status validation (generic)
export function isValidStatus(status: string, allowedStatuses: string[]): boolean {
    return allowedStatuses.includes(status.toLowerCase());
}

// File extension validation
export function isAllowedFileType(filename: string, allowedExtensions: string[] = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'png', 'jpg', 'jpeg', 'gif',
    'zip', 'json', 'csv', 'txt'
]): boolean {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return allowedExtensions.includes(ext);
}

// Sanitize HTML (basic)
export function sanitizeHtml(html: string): string {
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format duration
export function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${Math.floor(minutes / 1440)}d ${Math.floor((minutes % 1440) / 60)}h`;
}
