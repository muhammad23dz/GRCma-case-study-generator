
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Deploying Immutable Audit Log Triggers...');

    try {
        // 1. Create Function
        await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION prevent_audit_log_changes()
      RETURNS TRIGGER AS $$
      BEGIN
        IF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
          RAISE EXCEPTION 'Audit logs are immutable. Operation % not not allowed.', TG_OP;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

        // 2. Drop Trigger if exists (to be idempotent)
        await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS trg_audit_log_immutable ON "AuditLog";
    `);

        // 3. Create Trigger
        await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trg_audit_log_immutable
      BEFORE UPDATE OR DELETE ON "AuditLog"
      FOR EACH ROW
      EXECUTE FUNCTION prevent_audit_log_changes();
    `);

        console.log('✅ Successfully deployed Immutable Audit Log triggers.');
    } catch (error) {
        console.error('❌ Failed to deploy triggers:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
