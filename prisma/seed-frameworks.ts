import { prisma } from '@/lib/prisma';

/**
 * Seed compliance frameworks with real requirements
 * Frameworks: ISO 27001:2022, SOC 2 Type II, NIST CSF 2.0, GDPR
 */

const frameworks = [
    {
        name: 'ISO 27001:2022',
        version: '2022',
        jurisdiction: 'International',
        description: 'Information security management system standard',
        requirements: [
            // Annex A Controls
            { id: 'A.5.1', title: 'Policies for information security', category: 'Organizational' },
            { id: 'A.5.2', title: 'Information security roles and responsibilities', category: 'Organizational' },
            { id: 'A.5.3', title: 'Segregation of duties', category: 'Organizational' },
            { id: 'A.5.7', title: 'Threat intelligence', category: 'Organizational' },
            { id: 'A.5.9', title: 'Inventory of information and other associated assets', category: 'Organizational' },
            { id: 'A.5.10', title: 'Acceptable use of information and other associated assets', category: 'Organizational' },
            { id: 'A.5.15', title: 'Access control', category: 'Organizational' },
            { id: 'A.5.16', title: 'Identity management', category: 'Organizational' },
            { id: 'A.5.17', title: 'Authentication information', category: 'Organizational' },
            { id: 'A.5.18', title: 'Access rights', category: 'Organizational' },
            { id: 'A.5.23', title: 'Information security for use of cloud services', category: 'Organizational' },
            { id: 'A.6.1', title: 'Screening', category: 'People' },
            { id: 'A.6.2', title: 'Terms and conditions of employment', category: 'People' },
            { id: 'A.6.3', title: 'Information security awareness, education and training', category: 'People' },
            { id: 'A.6.4', title: 'Disciplinary process', category: 'People' },
            { id: 'A.7.1', title: 'Physical security perimeters', category: 'Physical' },
            { id: 'A.7.2', title: 'Physical entry', category: 'Physical' },
            { id: 'A.7.3', title: 'Securing offices, rooms and facilities', category: 'Physical' },
            { id: 'A.7.4', title: 'Physical security monitoring', category: 'Physical' },
            { id: 'A.8.1', title: 'User endpoint devices', category: 'Technological' },
            { id: 'A.8.2', title: 'Privileged access rights', category: 'Technological' },
            { id: 'A.8.3', title: 'Information access restriction', category: 'Technological' },
            { id: 'A.8.5', title: 'Secure authentication', category: 'Technological' },
            { id: 'A.8.8', title: 'Management of technical vulnerabilities', category: 'Technological' },
            { id: 'A.8.9', title: 'Configuration management', category: 'Technological' },
            { id: 'A.8.10', title: 'Information deletion', category: 'Technological' },
            { id: 'A.8.11', title: 'Data masking', category: 'Technological' },
            { id: 'A.8.12', title: 'Data leakage prevention', category: 'Technological' },
            { id: 'A.8.16', title: 'Monitoring activities', category: 'Technological' },
            { id: 'A.8.23', title: 'Web filtering', category: 'Technological' },
            { id: 'A.8.24', title: 'Use of cryptography', category: 'Technological' },
        ],
    },
    {
        name: 'SOC 2 Type II',
        version: '2023',
        jurisdiction: 'United States',
        description: 'Trust Services Criteria for security, availability, processing integrity, confidentiality, and privacy',
        requirements: [
            // Common Criteria (Security)
            { id: 'CC1.1', title: 'COSO Principle 1: Demonstrates commitment to integrity and ethical values', category: 'Control Environment' },
            { id: 'CC1.2', title: 'COSO Principle 2: Board independence and oversight', category: 'Control Environment' },
            { id: 'CC1.3', title: 'COSO Principle 3: Management establishes structures, reporting lines, authorities', category: 'Control Environment' },
            { id: 'CC1.4', title: 'COSO Principle 4: Demonstrates commitment to competence', category: 'Control Environment' },
            { id: 'CC1.5', title: 'COSO Principle 5: Holds individuals accountable', category: 'Control Environment' },
            { id: 'CC2.1', title: 'COSO Principle 6: Specifies objectives with sufficient clarity', category: 'Communication' },
            { id: 'CC2.2', title: 'COSO Principle 7: Identifies and analyzes risk', category: 'Communication' },
            { id: 'CC2.3', title: 'COSO Principle 8: Assesses fraud risk', category: 'Communication' },
            { id: 'CC3.1', title: 'COSO Principle 10: Selects and develops control activities', category: 'Risk Assessment' },
            { id: 'CC3.2', title: 'COSO Principle 11: Selects and develops technology controls', category: 'Risk Assessment' },
            { id: 'CC3.3', title: 'COSO Principle 12: Deploys control activities through policies', category: 'Risk Assessment' },
            { id: 'CC4.1', title: 'COSO Principle 13: Uses relevant information', category: 'Monitoring' },
            { id: 'CC4.2', title: 'COSO Principle 14: Communicates internally', category: 'Monitoring' },
            { id: 'CC5.1', title: 'COSO Principle 16: Selects, develops, and performs ongoing evaluations', category: 'Control Activities' },
            { id: 'CC5.2', title: 'COSO Principle 17: Evaluates and communicates deficiencies', category: 'Control Activities' },
            { id: 'CC6.1', title: 'Implements logical access security measures', category: 'Logical Access' },
            { id: 'CC6.2', title: 'Prior to issuing credentials, registers and authorizes new users', category: 'Logical Access' },
            { id: 'CC6.3', title: 'Removes access when appropriate', category: 'Logical Access' },
            { id: 'CC6.6', title: 'Implements encryption to protect data', category: 'Logical Access' },
            { id: 'CC6.7', title: 'Restricts access to data based on classification', category: 'Logical Access' },
            { id: 'CC6.8', title: 'Restricts the transmission of data', category: 'Logical Access' },
            { id: 'CC7.1', title: 'Detects and responds to security incidents', category: 'System Operations' },
            { id: 'CC7.2', title: 'Identifies, develops, and implements activities to recover from security incidents', category: 'System Operations' },
            { id: 'CC7.3', title: 'Reviews and tests business continuity and disaster recovery plans', category: 'System Operations' },
            { id: 'CC7.4', title: 'Monitors infrastructure and software', category: 'System Operations' },
            { id: 'CC7.5', title: 'Implements change management procedures', category: 'System Operations' },
            { id: 'CC8.1', title: 'Authorizes, designs, develops or acquires, implements, and documents changes', category: 'Change Management' },
        ],
    },
    {
        name: 'NIST CSF 2.0',
        version: '2.0',
        jurisdiction: 'United States',
        description: 'Cybersecurity Framework - Identify, Protect, Detect, Respond, Recover',
        requirements: [
            // Identify
            { id: 'ID.AM-1', title: 'Physical devices and systems within the organization are inventoried', category: 'Asset Management' },
            { id: 'ID.AM-2', title: 'Software platforms and applications are inventoried', category: 'Asset Management' },
            { id: 'ID.AM-3', title: 'Organizational communication and data flows are mapped', category: 'Asset Management' },
            { id: 'ID.RA-1', title: 'Asset vulnerabilities are identified and documented', category: 'Risk Assessment' },
            { id: 'ID.RA-2', title: 'Cyber threat intelligence is received from information sharing forums', category: 'Risk Assessment' },
            { id: 'ID.RA-3', title: 'Threats, both internal and external, are identified and documented', category: 'Risk Assessment' },
            { id: 'ID.GV-1', title: 'Organizational cybersecurity policy is established and communicated', category: 'Governance' },
            // Protect
            { id: 'PR.AC-1', title: 'Identities and credentials are issued, managed, verified, revoked', category: 'Access Control' },
            { id: 'PR.AC-3', title: 'Remote access is managed', category: 'Access Control' },
            { id: 'PR.AC-4', title: 'Access permissions and authorizations are managed', category: 'Access Control' },
            { id: 'PR.AC-5', title: 'Network integrity is protected', category: 'Access Control' },
            { id: 'PR.DS-1', title: 'Data-at-rest is protected', category: 'Data Security' },
            { id: 'PR.DS-2', title: 'Data-in-transit is protected', category: 'Data Security' },
            { id: 'PR.DS-5', title: 'Protections against data leaks are implemented', category: 'Data Security' },
            { id: 'PR.PT-1', title: 'Audit/log records are determined, documented, implemented', category: 'Protective Technology' },
            { id: 'PR.PT-3', title: 'Least functionality principle is incorporated', category: 'Protective Technology' },
            // Detect
            { id: 'DE.AE-1', title: 'Network operations baseline is established and managed', category: 'Anomalies and Events' },
            { id: 'DE.AE-3', title: 'Event data are collected and correlated from multiple sources', category: 'Anomalies and Events' },
            { id: 'DE.CM-1', title: 'Network monitored to detect potential cybersecurity events', category: 'Continuous Monitoring' },
            { id: 'DE.CM-4', title: 'Malicious code is detected', category: 'Continuous Monitoring' },
            { id: 'DE.CM-7', title: 'Monitoring for unauthorized personnel, connections, devices', category: 'Continuous Monitoring' },
            // Respond
            { id: 'RS.RP-1', title: 'Response plan is executed during or after an incident', category: 'Response Planning' },
            { id: 'RS.CO-2', title: 'Incidents are reported consistent with established criteria', category: 'Communications' },
            { id: 'RS.AN-1', title: 'Notifications from detection systems are investigated', category: 'Analysis' },
            { id: 'RS.MI-2', title: 'Incidents are mitigated', category: 'Mitigation' },
            // Recover
            { id: 'RC.RP-1', title: 'Recovery plan is executed during or after a cybersecurity incident', category: 'Recovery Planning' },
            { id: 'RC.IM-1', title: 'Recovery plans incorporate lessons learned', category: 'Improvements' },
        ],
    },
    {
        name: 'GDPR',
        version: '2018',
        jurisdiction: 'European Union',
        description: 'General Data Protection Regulation - EU data protection and privacy law',
        requirements: [
            { id: 'Art.5', title: 'Principles relating to processing of personal data', category: 'Principles' },
            { id: 'Art.6', title: 'Lawfulness of processing', category: 'Lawful Basis' },
            { id: 'Art.7', title: 'Conditions for consent', category: 'Consent' },
            { id: 'Art.9', title: 'Processing of special categories of personal data', category: 'Special Data' },
            { id: 'Art.12', title: 'Transparent information and communication', category: 'Transparency' },
            { id: 'Art.13', title: 'Information to be provided where data collected from subject', category: 'Transparency' },
            { id: 'Art.15', title: 'Right of access by the data subject', category: 'Data Subject Rights' },
            { id: 'Art.16', title: 'Right to rectification', category: 'Data Subject Rights' },
            { id: 'Art.17', title: 'Right to erasure (right to be forgotten)', category: 'Data Subject Rights' },
            { id: 'Art.18', title: 'Right to restriction of processing', category: 'Data Subject Rights' },
            { id: 'Art.20', title: 'Right to data portability', category: 'Data Subject Rights' },
            { id: 'Art.21', title: 'Right to object', category: 'Data Subject Rights' },
            { id: 'Art.25', title: 'Data protection by design and by default', category: 'Technical Measures' },
            { id: 'Art.30', title: 'Records of processing activities', category: 'Accountability' },
            { id: 'Art.32', title: 'Security of processing', category: 'Security' },
            { id: 'Art.33', title: 'Notification of personal data breach to supervisory authority', category: 'Breach' },
            { id: 'Art.34', title: 'Communication of personal data breach to data subject', category: 'Breach' },
            { id: 'Art.35', title: 'Data protection impact assessment', category: 'Assessment' },
            { id: 'Art.37', title: 'Designation of data protection officer', category: 'DPO' },
            { id: 'Art.44', title: 'General principle for transfers', category: 'Transfers' },
            { id: 'Art.46', title: 'Transfers subject to appropriate safeguards', category: 'Transfers' },
        ],
    },
];

export async function seedFrameworks() {
    console.log('🌱 Seeding compliance frameworks...');

    for (const fw of frameworks) {
        // Check if framework exists
        const existing = await prisma.framework.findUnique({
            where: { name: fw.name },
        });

        if (existing) {
            console.log(`✓ Framework "${fw.name}" already exists, skipping...`);
            continue;
        }

        // Create framework
        const framework = await prisma.framework.create({
            data: {
                name: fw.name,
                version: fw.version,
                jurisdiction: fw.jurisdiction,
                description: fw.description,
            },
        });

        console.log(`✓ Created framework: ${fw.name}`);
        console.log(`  Requirements: ${fw.requirements.length}`);
    }

    console.log('✅ Framework seeding complete!');
}

// Run if executed directly
if (require.main === module) {
    seedFrameworks()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Seeding failed:', error);
            process.exit(1);
        });
}
