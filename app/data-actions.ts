'use server';

import { getDb, query, queryOne } from '@/lib/neon';

/**
 * Example Neon serverless data actions
 * These demonstrate direct SQL queries using Neon's serverless driver
 * Use for performance-critical or edge-compatible queries
 */

// Get dashboard overview data using direct SQL
export async function getDashboardStats() {
    const sql = getDb();

    const stats = await sql`
        SELECT 
            (SELECT COUNT(*) FROM "Control") as total_controls,
            (SELECT COUNT(*) FROM "Risk") as total_risks,
            (SELECT COUNT(*) FROM "Policy") as total_policies,
            (SELECT COUNT(*) FROM "Vendor") as total_vendors,
            (SELECT COUNT(*) FROM "Incident") as total_incidents,
            (SELECT COUNT(*) FROM "Action" WHERE status = 'open') as open_actions
    `;

    return stats[0] || {
        total_controls: 0,
        total_risks: 0,
        total_policies: 0,
        total_vendors: 0,
        total_incidents: 0,
        open_actions: 0
    };
}

// Get user by ID
export async function getUserById(userId: string) {
    const sql = getDb();

    const users = await sql`
        SELECT id, email, name, role, "orgId", "createdAt"
        FROM "User"
        WHERE id = ${userId}
        LIMIT 1
    `;

    return users[0] || null;
}

// Get risks with high scores
export async function getHighRisks(minScore: number = 12) {
    const sql = getDb();

    const risks = await sql`
        SELECT id, narrative, likelihood, impact, score, category, owner, "createdAt"
        FROM "Risk"
        WHERE score >= ${minScore}
        ORDER BY score DESC
        LIMIT 50
    `;

    return risks;
}

// Get compliance score by framework
export async function getFrameworkComplianceScores() {
    const sql = getDb();

    const scores = await sql`
        SELECT 
            f.id,
            f.name,
            COUNT(DISTINCT fm."controlId") as mapped_controls,
            (SELECT COUNT(*) FROM "FrameworkRequirement" WHERE "frameworkId" = f.id) as total_requirements
        FROM "Framework" f
        LEFT JOIN "FrameworkMapping" fm ON fm."frameworkId" = f.id
        GROUP BY f.id, f.name
        ORDER BY f.name
    `;

    return scores.map(s => ({
        ...s,
        coverage: s.total_requirements > 0
            ? Math.round((Number(s.mapped_controls) / Number(s.total_requirements)) * 100)
            : 0
    }));
}

// Get recent audit logs
export async function getRecentAuditLogs(limit: number = 10) {
    const sql = getDb();

    const logs = await sql`
        SELECT id, "userName", "userEmail", action, entity, "entityId", timestamp, changes
        FROM "AuditLog"
        ORDER BY timestamp DESC
        LIMIT ${limit}
    `;

    return logs;
}

// Get action items with due dates
export async function getUpcomingActions(days: number = 7) {
    const sql = getDb();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const actions = await sql`
        SELECT a.id, a.title, a.type, a.priority, a.status, a."dueDate", a."assignedTo",
               c.title as control_title
        FROM "Action" a
        LEFT JOIN "Control" c ON a."controlId" = c.id
        WHERE a.status = 'open'
          AND a."dueDate" IS NOT NULL
          AND a."dueDate" <= ${futureDate.toISOString()}
        ORDER BY a."dueDate" ASC
        LIMIT 20
    `;

    return actions;
}

// Bulk insert helper (example)
export async function bulkInsertControls(controls: Array<{
    title: string;
    description: string;
    controlType: string;
    owner: string;
}>) {
    const sql = getDb();

    // Use transaction for bulk operations
    const results = [];
    for (const control of controls) {
        const inserted = await sql`
            INSERT INTO "Control" (id, title, description, "controlType", owner, "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), ${control.title}, ${control.description}, ${control.controlType}, ${control.owner}, NOW(), NOW())
            RETURNING *
        `;
        results.push(inserted[0]);
    }

    return results;
}
