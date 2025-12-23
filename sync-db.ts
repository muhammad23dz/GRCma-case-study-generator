
import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { WebSocket } from 'ws';

const connectionString = "postgresql://neondb_owner:npg_8NwTXPqIzYL9@ep-ancient-union-aejrw81n-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

neonConfig.webSocketConstructor = WebSocket;

async function main() {
    console.log('Starting full schema sync...');
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('Clearing legacy/incomplete tables...');
        // Drop in safe order (reverse of dependency)
        await prisma.$executeRawUnsafe(`
            DROP TABLE IF EXISTS "AuditFinding" CASCADE;
            DROP TABLE IF EXISTS "ControlTest" CASCADE;
            DROP TABLE IF EXISTS "RemediationStep" CASCADE;
            DROP TABLE IF EXISTS "Gap" CASCADE;
            DROP TABLE IF EXISTS "Action" CASCADE;
            DROP TABLE IF EXISTS "Incident" CASCADE;
            DROP TABLE IF EXISTS "Change" CASCADE;
            DROP TABLE IF EXISTS "Evidence" CASCADE;
            DROP TABLE IF EXISTS "PolicyControl" CASCADE;
            DROP TABLE IF EXISTS "IncidentControl" CASCADE;
            DROP TABLE IF EXISTS "RiskControl" CASCADE;
            DROP TABLE IF EXISTS "Audit" CASCADE;
            DROP TABLE IF EXISTS "Control" CASCADE;
            DROP TABLE IF EXISTS "Risk" CASCADE;
            DROP TABLE IF EXISTS "Policy" CASCADE;
            DROP TABLE IF EXISTS "Vendor" CASCADE;
            DROP TABLE IF EXISTS "AuditLog" CASCADE;
            DROP TABLE IF EXISTS "SystemSetting" CASCADE;
            DROP TABLE IF EXISTS "Report" CASCADE;
            DROP TABLE IF EXISTS "LLMUsage" CASCADE;
            DROP TABLE IF EXISTS "LLMCache" CASCADE;
            DROP TABLE IF EXISTS "Integration" CASCADE;
            DROP TABLE IF EXISTS "Invitation" CASCADE;
            DROP TABLE IF EXISTS "User" CASCADE;
            DROP TABLE IF EXISTS "Organization" CASCADE;
        `);

        console.log('Creating full GRCma schema...');
        await prisma.$executeRawUnsafe(`
            CREATE TABLE "Organization" (
                "id" TEXT PRIMARY KEY,
                "name" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE "User" (
                "id" TEXT PRIMARY KEY,
                "name" TEXT,
                "email" TEXT UNIQUE,
                "emailVerified" TIMESTAMP(3),
                "image" TEXT,
                "role" TEXT,
                "mfaSecret" TEXT,
                "mfaEnabled" BOOLEAN DEFAULT false,
                "hasUsedDemo" BOOLEAN DEFAULT false,
                "password" TEXT,
                "orgId" TEXT,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL
            );

            CREATE TABLE "SystemSetting" (
                "id" TEXT PRIMARY KEY,
                "userId" TEXT NOT NULL,
                "key" TEXT NOT NULL,
                "value" TEXT NOT NULL,
                "description" TEXT,
                "isSecret" BOOLEAN DEFAULT false,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
                UNIQUE("userId", "key")
            );

            CREATE TABLE "Invitation" (
                "id" TEXT PRIMARY KEY,
                "email" TEXT UNIQUE NOT NULL,
                "role" TEXT DEFAULT 'user',
                "invitedBy" TEXT NOT NULL,
                "expires" TIMESTAMP(3) NOT NULL,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE "Control" (
                "id" TEXT PRIMARY KEY,
                "title" TEXT NOT NULL,
                "description" TEXT NOT NULL,
                "controlType" TEXT NOT NULL,
                "owner" TEXT,
                "organizationId" TEXT,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
            );

            CREATE TABLE "Risk" (
                "id" TEXT PRIMARY KEY,
                "likelihood" INTEGER NOT NULL,
                "impact" INTEGER NOT NULL,
                "score" INTEGER NOT NULL,
                "category" TEXT NOT NULL,
                "narrative" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'open',
                "owner" TEXT,
                "organizationId" TEXT,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
            );

            CREATE TABLE "Policy" (
                "id" TEXT PRIMARY KEY,
                "title" TEXT NOT NULL,
                "content" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'draft',
                "owner" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE "Vendor" (
                "id" TEXT PRIMARY KEY,
                "name" TEXT NOT NULL,
                "category" TEXT NOT NULL DEFAULT 'Service',
                "criticality" TEXT NOT NULL DEFAULT 'medium',
                "riskScore" INTEGER NOT NULL DEFAULT 0,
                "status" TEXT NOT NULL,
                "owner" TEXT,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE "Gap" (
                "id" TEXT PRIMARY KEY,
                "title" TEXT NOT NULL,
                "description" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'open',
                "owner" TEXT,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE "Audit" (
                "id" TEXT PRIMARY KEY,
                "title" TEXT NOT NULL,
                "auditType" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'planning',
                "auditorName" TEXT NOT NULL,
                "startDate" TIMESTAMP(3) NOT NULL,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE "AuditFinding" (
                "id" TEXT PRIMARY KEY,
                "auditId" TEXT NOT NULL,
                "controlId" TEXT NOT NULL,
                "severity" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "description" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'open',
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE,
                FOREIGN KEY ("controlId") REFERENCES "Control"("id")
            );

            CREATE TABLE "RemediationStep" (
                "id" TEXT PRIMARY KEY,
                "gapId" TEXT NOT NULL,
                "stepNumber" INTEGER NOT NULL,
                "description" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'pending',
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("gapId") REFERENCES "Gap"("id") ON DELETE CASCADE
            );

            CREATE TABLE "Action" (
                "id" TEXT PRIMARY KEY,
                "title" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'open',
                "owner" TEXT,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE "Incident" (
                "id" TEXT PRIMARY KEY,
                "title" TEXT NOT NULL,
                "description" TEXT NOT NULL,
                "severity" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'open',
                "reportedBy" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE "Change" (
                "id" TEXT PRIMARY KEY,
                "changeNumber" TEXT UNIQUE NOT NULL,
                "title" TEXT NOT NULL,
                "description" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'draft',
                "requestedBy" TEXT NOT NULL,
                "requestedDate" TIMESTAMP(3) NOT NULL,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE "Evidence" (
                "id" TEXT PRIMARY KEY,
                "controlId" TEXT,
                "evidenceType" TEXT NOT NULL,
                "uploadedBy" TEXT NOT NULL,
                "timestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("controlId") REFERENCES "Control"("id")
            );

            CREATE TABLE "Report" (
                "id" TEXT PRIMARY KEY,
                "userId" TEXT NOT NULL,
                "sections" JSONB NOT NULL,
                "timestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
            );

            CREATE TABLE "LLMUsage" (
                "id" TEXT PRIMARY KEY,
                "userId" TEXT NOT NULL,
                "model" TEXT NOT NULL,
                "tokensIn" INTEGER NOT NULL,
                "tokensOut" INTEGER NOT NULL,
                "cost" DOUBLE PRECISION NOT NULL,
                "feature" TEXT NOT NULL,
                "timestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
            );

            CREATE TABLE "LLMCache" (
                "id" TEXT PRIMARY KEY,
                "promptHash" TEXT UNIQUE NOT NULL,
                "response" TEXT NOT NULL,
                "model" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "expiresAt" TIMESTAMP(3) NOT NULL
            );

            CREATE TABLE "Integration" (
                "id" TEXT PRIMARY KEY,
                "organizationId" TEXT NOT NULL,
                "provider" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "status" TEXT DEFAULT 'active',
                "encryptedCredentials" TEXT NOT NULL,
                "config" JSONB,
                "lastSyncAt" TIMESTAMP(3),
                "errorMessage" TEXT,
                "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE
            );

            CREATE TABLE "AuditLog" (
                "id" TEXT PRIMARY KEY,
                "userId" TEXT NOT NULL,
                "userName" TEXT NOT NULL,
                "userEmail" TEXT NOT NULL,
                "resource" TEXT NOT NULL,
                "resourceId" TEXT,
                "action" TEXT NOT NULL,
                "changes" TEXT NOT NULL,
                "timestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Relations
            CREATE TABLE "PolicyControl" (
                "id" TEXT PRIMARY KEY,
                "policyId" TEXT NOT NULL,
                "controlId" TEXT NOT NULL,
                FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE,
                FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE CASCADE
            );
            
            CREATE TABLE "IncidentControl" (
                "id" TEXT PRIMARY KEY,
                "incidentId" TEXT NOT NULL,
                "controlId" TEXT NOT NULL,
                "bypassType" TEXT NOT NULL,
                FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE,
                FOREIGN KEY ("controlId") REFERENCES "Control"("id")
            );

            CREATE TABLE "RiskControl" (
                "id" TEXT PRIMARY KEY,
                "riskId" TEXT NOT NULL,
                "controlId" TEXT NOT NULL,
                FOREIGN KEY ("riskId") REFERENCES "Risk"("id") ON DELETE CASCADE,
                FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE CASCADE
            );
        `);

        console.log('Full schema sync completed successfully.');
    } catch (error) {
        console.error('Error during full schema sync:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
