
// Policy-as-Code Implementation (CASL-inspired ABAC)

export type Role = 'admin' | 'manager' | 'analyst' | 'user' | 'pending';

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subject = 'all' | 'User' | 'System' | 'Risk' | 'Control' | 'Vendor' | 'Incident' | 'Evidence' | 'Report';

export interface Ability {
    action: Action;
    subject: Subject;
    conditions?: (resource: any) => boolean;
}

// Backward compatibility constants
export const PERMISSIONS = {
    MANAGE_USERS: 'manage_users',
    SYSTEM_CONFIG: 'system_config',
    DELETE_RECORDS: 'delete_records',
    APPROVE_ITEMS: 'approve_items',
    EDIT_CONTENT: 'edit_content',
    VIEW_ANALYTICS: 'view_analytics',
    VIEW_ADMIN_PANEL: 'view_admin_panel'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// DEV MODE CHECK - Client-side
export function isDevModeActive(): boolean {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('DEV_MODE') === 'true';
    }
    return process.env.NEXT_PUBLIC_DEV_MODE === 'true';
}

// Policy Definition Factory
export function defineAbilitiesFor(user: { role: string; id: string }) {
    const rules: Ability[] = [];

    // DEV MODE: Grant all permissions
    if (isDevModeActive()) {
        rules.push({ action: 'manage', subject: 'all' });
        return rules;
    }

    if (user.role === 'admin') {
        rules.push({ action: 'manage', subject: 'all' });
    } else if (user.role === 'manager') {
        rules.push({ action: 'manage', subject: 'Risk' });
        rules.push({ action: 'manage', subject: 'Control' });
        rules.push({ action: 'manage', subject: 'Vendor' });
        rules.push({ action: 'manage', subject: 'Incident' });
        rules.push({ action: 'read', subject: 'User' });
        rules.push({ action: 'read', subject: 'System' });
    } else if (user.role === 'analyst') {
        rules.push({ action: 'read', subject: 'all' });
        rules.push({ action: 'create', subject: 'Risk' });
        rules.push({ action: 'create', subject: 'Control' });
        rules.push({ action: 'update', subject: 'Risk', conditions: (r) => r.owner === user.id });
        rules.push({ action: 'update', subject: 'Control', conditions: (c) => c.owner === user.id });
    } else {
        rules.push({ action: 'read', subject: 'Risk' });
        rules.push({ action: 'read', subject: 'Control' });
    }

    return rules;
}

// Global "can" helper
export function can(user: { role: string; id: string } | undefined, action: Action, subject: Subject, resource?: any): boolean {
    // DEV MODE OVERRIDE
    if (isDevModeActive()) return true;

    if (!user) return false;

    const abilities = defineAbilitiesFor(user);

    if (abilities.some(r => r.action === 'manage' && r.subject === 'all')) return true;

    const relevantRules = abilities.filter(r =>
        (r.action === 'manage' || r.action === action) &&
        (r.subject === 'all' || r.subject === subject)
    );

    if (relevantRules.length === 0) return false;

    return relevantRules.some(r => {
        if (!r.conditions) return true;
        if (!resource) return false;
        return r.conditions(resource);
    });
}

// Backward Compatibility Wrappers
export function hasPermission(role: string | undefined, permission: Permission): boolean {
    // DEV MODE OVERRIDE
    if (isDevModeActive()) return true;

    if (!role) return false;
    const mockUser = { role, id: 'global-check' };

    switch (permission) {
        case PERMISSIONS.MANAGE_USERS: return can(mockUser, 'manage', 'User');
        case PERMISSIONS.SYSTEM_CONFIG: return can(mockUser, 'manage', 'System');
        case PERMISSIONS.DELETE_RECORDS: return can(mockUser, 'delete', 'Risk');
        case PERMISSIONS.APPROVE_ITEMS: return can(mockUser, 'update', 'Evidence');
        case PERMISSIONS.EDIT_CONTENT: return can(mockUser, 'create', 'Risk');
        case PERMISSIONS.VIEW_ANALYTICS: return true;
        case PERMISSIONS.VIEW_ADMIN_PANEL: return can(mockUser, 'read', 'User');
        default: return false;
    }
}

// Helper Getters for UI - Now with DEV MODE support
export const canManageUsers = (role?: string) => isDevModeActive() || hasPermission(role, PERMISSIONS.MANAGE_USERS);
export const canConfigureSystem = (role?: string) => isDevModeActive() || hasPermission(role, PERMISSIONS.SYSTEM_CONFIG);
export const canDeleteRecords = (role?: string) => isDevModeActive() || hasPermission(role, PERMISSIONS.DELETE_RECORDS);
export const canApprove = (role?: string) => isDevModeActive() || hasPermission(role, PERMISSIONS.APPROVE_ITEMS);
export const canEditContent = (role?: string) => isDevModeActive() || hasPermission(role, PERMISSIONS.EDIT_CONTENT);
export const canEdit = (role?: string) => isDevModeActive() || hasPermission(role, PERMISSIONS.EDIT_CONTENT);
