import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

import { ROLE_HIERARCHY, ROLE_PERMISSIONS, getIsolationContext } from '@/lib/isolation';

// GET /api/permissions - Get Current User Permissions
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const permissions = ROLE_PERMISSIONS[context.role] || ROLE_PERMISSIONS.user;

        return NextResponse.json({
            user: {
                id: context.userId,
                email: context.email,
                role: context.role,
                organizationId: context.orgId
            },
            permissions,
            roleHierarchy: ROLE_HIERARCHY[context.role] || 0,
            canManageUsers: ['admin', 'manager'].includes(context.role),
            canExportData: ['admin', 'manager', 'auditor'].includes(context.role),
            canModifySettings: ['admin', 'manager'].includes(context.role)
        });
    } catch (error: any) {
        console.error('Error fetching permissions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET /api/permissions/groups - List Permission Groups
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin or manager
        if (!['admin', 'manager'].includes(context.role)) {
            return NextResponse.json({ error: 'Elevated access required' }, { status: 403 });
        }

        const body = await request.json();
        const { action, targetUserId, newRole } = body;

        if (action === 'update_role') {
            if (!targetUserId || !newRole) {
                return NextResponse.json({ error: 'Target user and new role are required' }, { status: 400 });
            }

            if (!ROLE_HIERARCHY[newRole]) {
                return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
            }

            // Security: Ensure the manager can only update users within their own organization
            const targetUser = await prisma.user.findUnique({
                where: { id: targetUserId },
                select: { orgId: true, role: true }
            });

            if (!targetUser) {
                return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
            }

            if (context.role !== 'admin' && targetUser.orgId !== (context.orgId as string)) {
                return NextResponse.json({ error: 'Forbidden: User belongs to another organization' }, { status: 403 });
            }

            // Security: Prevent lower roles from promoting someone to a higher role than themselves
            if (ROLE_HIERARCHY[newRole] > ROLE_HIERARCHY[context.role]) {
                return NextResponse.json({ error: 'Forbidden: Cannot promote user to a higher role than your own' }, { status: 403 });
            }

            const updatedUser = await prisma.user.update({
                where: { id: targetUserId },
                data: { role: newRole }
            });

            return NextResponse.json({
                message: 'User role updated successfully',
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    role: updatedUser.role
                }
            });
        }

        if (action === 'deactivate_user') {
            if (!targetUserId) {
                return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
            }

            const targetUser = await prisma.user.findUnique({
                where: { id: targetUserId },
                select: { orgId: true }
            });

            if (!targetUser) {
                return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
            }

            if (context.role !== 'admin' && targetUser.orgId !== (context.orgId as string)) {
                return NextResponse.json({ error: 'Forbidden: User belongs to another organization' }, { status: 403 });
            }

            // Implementation note: Deactivation can be done by setting role to 'none' or a 'deactivated' flag.
            // For now, let's set a 'viewer' role or just keep it simple with role 'disabled' if we want to add that.
            // Let's assume we want to prevent logins. Since Clerk handles auth, we'd need to sync with Clerk.
            // For GRCma, we'll set role to 'viewer' and maybe a flag if we add it to schema.
            // Actually, let's just use 'viewer' for now as a soft deactivation, or better, add 'active' Boolean to User schema.

            // Wait, I didn't add 'active' to schema. Let's just update role to 'viewer' for now or handle it via a new role.
            // I'll add 'disabled' to ROLE_HIERARCHY and ROLE_PERMISSIONS for real deactivation.

            const updatedUser = await prisma.user.update({
                where: { id: targetUserId },
                data: { role: 'disabled' }
            });

            return NextResponse.json({ message: 'User deactivated successfully', user: updatedUser });
        }

        if (action === 'list_users') {
            const users = await prisma.user.findMany({
                where: context.role === 'admin' ? {} : { orgId: context.orgId || undefined },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    orgId: true,
                    organization: { select: { name: true } }
                },
                orderBy: { email: 'asc' }
            });

            return NextResponse.json({
                users,
                roles: Object.keys(ROLE_HIERARCHY),
                rolePermissions: ROLE_PERMISSIONS
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Error managing permissions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
