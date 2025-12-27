/**
 * Expert GRC Templates
 * High-quality, industry-specific content for GRC assessments.
 */

export const INDUSTRY_VENDORS: Record<string, string[]> = {
    'Healthcare': ['Epic Systems', 'Cerner', 'Meditech', 'Allscripts', 'Change Healthcare'],
    'Finance': ['Bloomberg', 'Refinitiv', 'FIS (Fidelity National Information Services)', 'Jack Henry', 'Broadridge'],
    'Retail': ['Shopify Plus', 'Magento/Adobe Commerce', 'Lightspeed', 'Square for Retail', 'Oracle Retail'],
    'Manufacturing': ['Siemens Digital Industries', 'Rockwell Automation', 'Honeywell Forge', 'AVEVA', 'PTC'],
    'Technology': ['GitHub Enterprise', 'Atlassian Cloud', 'Slack/Salesforce', 'PagerDuty', 'Okta'],
    'Government': ['Microsoft Azure Government', 'AWS GovCloud', 'Tyler Technologies', 'ServiceNow Public Sector', 'Palantir'],
    'Energy': ['GE Vernova', 'Schneider Electric', 'ABB Digital', 'Emerson', 'Itron']
};

export const FRAMEWORK_TERMINOLOGY: Record<string, any> = {
    'ISO 27001': {
        controls: 'Annex A Controls',
        sections: ['Context of the Organization', 'Leadership', 'Planning', 'Support', 'Operation', 'Performance Evaluation', 'Improvement'],
        tone: 'Audit-ready, formal'
    },
    'SOC 2': {
        controls: 'Trust Services Criteria (TSC)',
        sections: ['Security', 'Availability', 'Processing Integrity', 'Confidentiality', 'Privacy'],
        tone: 'Evidence-based, technical'
    },
    'NIST CSF': {
        controls: 'Core Functions',
        sections: ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
        tone: 'Risk-based, descriptive'
    }
};

/**
 * Enhanced Fallback Generator for when AI fails or is in demo mode.
 * Provides logical, industry-specific content instead of generic bluff.
 */
export function getExpertFallback(companyName: string, industry: string, challenge: string, framework: string): any {
    const vendors = INDUSTRY_VENDORS[industry] || INDUSTRY_VENDORS['Technology'];
    const terms = FRAMEWORK_TERMINOLOGY[framework] || FRAMEWORK_TERMINOLOGY['ISO 27001'];

    return {
        executiveSummary: {
            problemStatement: `${companyName} is facing significant challenges regarding ${challenge} while operating within the ${industry} sector. This requires a robust implementation of ${framework} controls to mitigate operational and compliance risks.`,
            context: `As a ${industry} organization, ${companyName} handles sensitive data that must be protected according to ${framework} standards. The current maturity level requires strategic alignment with industry benchmarks.`,
            scope: `The assessment covers all core systems, third-party integrations with vendors like ${vendors[0]}, and internal processes related to ${challenge}.`,
            recommendations: `1. Formalize ${challenge} management procedures. 2. Implement automated monitoring for ${vendors[0]} integrations. 3. Conduct a full ${framework} control gap analysis.`
        },
        controls: [
            {
                title: `${framework} A.9.1: Access Control Policy for ${challenge}`,
                description: `Formalize and document an access control policy specifically addressing ${challenge} scenarios and user privileges.`,
                controlType: 'preventive',
                status: 'partially_compliant'
            },
            {
                title: `${framework} A.12.4: Logging and Monitoring`,
                description: `Implement centralized logging for all systems involved in ${challenge} to ensure detective capabilities.`,
                controlType: 'detective',
                status: 'non_compliant'
            }
        ],
        risks: [
            {
                category: 'Operational',
                narrative: `Unauthorized access to ${challenge} systems could lead to data integrity loss or service disruption for ${companyName}.`,
                likelihood: 3,
                impact: 4,
                mitigatingControlTitles: [`${framework} A.9.1: Access Control Policy for ${challenge}`]
            }
        ],
        vendors: vendors.slice(0, 3).map(v => ({
            name: v,
            category: 'Critical Infrastructure',
            services: 'Core Platform Services',
            riskScore: 25
        }))
    };
}
