'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Users,
    Search,
    Shield,
    UserCog,
    ChevronDown,
    Check,
    AlertTriangle,
    UserPlus,
    X,
    Mail,
    Clock
} from 'lucide-react';

interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: string;
    createdAt: string;
    organization?: { name: string };
}

interface Invitation {
    id: string;
    email: string;
    role: string;
    expires: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bgColor: string; description: string }> = {
    admin: { label: 'Admin', color: 'text-red-400', bgColor: 'bg-red-500/10', description: 'Full system access' },
    manager: { label: 'Manager', color: 'text-purple-400', bgColor: 'bg-purple-500/10', description: 'Team management' },
    contributor: { label: 'Contributor', color: 'text-orange-400', bgColor: 'bg-orange-500/10', description: 'Can edit GRC data' },
    analyst: { label: 'Analyst', color: 'text-blue-400', bgColor: 'bg-blue-500/10', description: 'Risk & control analysis' },
    auditor: { label: 'Auditor', color: 'text-amber-400', bgColor: 'bg-amber-500/10', description: 'Audit & evidence access' },
    user: { label: 'User', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', description: 'Standard access' },
    viewer: { label: 'Viewer', color: 'text-slate-400', bgColor: 'bg-slate-500/10', description: 'Read-only access' },
    disabled: { label: 'Disabled', color: 'text-pink-600', bgColor: 'bg-pink-900/10', description: 'No access' },
};

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteData, setInviteData] = useState({ email: '', role: 'user' });

    async function fetchData() {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setInvitations(data.invitations || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inviteData)
            });
            if (res.ok) {
                setShowInviteModal(false);
                setInviteData({ email: '', role: 'user' });
                fetchData();
            }
        } catch (error) {
            console.error('Invite failed', error);
        } finally {
            setUpdating(false);
        }
    };

    const updateUserRole = async (userId: string, newRole: string) => {
        setUpdating(true);
        try {
            const res = await fetch('/api/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_role',
                    targetUserId: userId,
                    newRole
                })
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
                setSelectedUser(null);
            }
        } catch (error) {
            console.error('Failed to update user role:', error);
        } finally {
            setUpdating(false);
        }
    };

    const deactivateUser = async (userId: string) => {
        if (!confirm('Are you sure you want to deactivate this user? They will lose all access to the platform.')) return;
        setUpdating(true);
        try {
            const res = await fetch('/api/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deactivate_user',
                    targetUserId: userId
                })
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: 'disabled' } : u));
            }
        } catch (error) {
            console.error('Failed to deactivate user:', error);
        } finally {
            setUpdating(false);
        }
    };

    const revokeInvitation = async (id: string) => {
        if (!confirm('Revoke this invitation?')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}?type=invitation`, { method: 'DELETE' });
            if (res.ok) {
                setInvitations(prev => prev.filter(i => i.id !== id));
            }
        } catch (error) {
            console.error('Failed to revoke invitation', error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.name || '').toLowerCase().includes(search.toLowerCase())
    );

    const roleStats = Object.keys(ROLE_CONFIG).reduce((acc, role) => {
        acc[role] = users.filter(u => u.role === role).length;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-primary" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Administration</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 mb-2">
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                                    User Management
                                </h1>
                                <p className="text-lg text-slate-400 max-w-2xl">
                                    Manage user roles and permissions across your organization.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 font-bold flex items-center gap-2 transition-all hover:scale-105"
                            >
                                <UserPlus className="w-5 h-5" />
                                Add Member
                            </button>
                        </div>
                    </div>

                    {/* Role Distribution */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                            <div key={role} className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className={`text-2xl font-bold ${config.color}`}>{roleStats[role] || 0}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider truncate">{config.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    {/* Users Table */}
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 bg-slate-900/40 animate-pulse rounded-xl" />
                            ))}
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
                            <p className="text-slate-400">Users will appear here once they sign in.</p>
                        </div>
                    ) : (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Organization</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => {
                                        const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
                                        const isSelected = selectedUser === user.id;

                                        return (
                                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                                                            {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : (user.name || user.email).charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-medium">{user.name || 'Unknown'}</div>
                                                            <div className="text-xs text-slate-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400">
                                                    {user.organization?.name || 'Default'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setSelectedUser(isSelected ? null : user.id)}
                                                            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-2 ${roleConfig.bgColor} ${roleConfig.color}`}
                                                        >
                                                            <Shield className="w-3 h-3" />
                                                            {roleConfig.label}
                                                            <ChevronDown className={`w-3 h-3 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        {isSelected && (
                                                            <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-20 py-2">
                                                                {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                                                                    <button
                                                                        key={role}
                                                                        onClick={() => updateUserRole(user.id, role)}
                                                                        disabled={updating}
                                                                        className="w-full px-4 py-2 text-left text-xs hover:bg-white/5 flex items-center justify-between"
                                                                    >
                                                                        <span className={config.color}>{config.label}</span>
                                                                        {user.role === role && <Check className="w-4 h-4 text-primary" />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-xs">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => deactivateUser(user.id)}
                                                            disabled={updating || user.role === 'disabled'}
                                                            className="p-2 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-30"
                                                            title="Deactivate User"
                                                        >
                                                            <AlertTriangle className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 text-slate-400 hover:text-white">
                                                            <UserCog className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pending Invitations Section */}
                    {invitations.length > 0 && (
                        <div className="mt-12">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-orange-500/10 rounded-lg">
                                    <Clock className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Pending Invitations</h3>
                                    <p className="text-sm text-slate-400">Users who haven't accepted their invite yet.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {invitations.map(invite => (
                                    <div key={invite.id} className="bg-slate-900 border border-white/5 rounded-2xl p-6 hover:bg-slate-900/80 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => revokeInvitation(invite.id)}
                                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-white truncate">{invite.email}</p>
                                                <p className="text-xs text-slate-500">Exp. {new Date(invite.expires).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${ROLE_CONFIG[invite.role]?.bgColor || 'bg-slate-500/20'
                                                } ${ROLE_CONFIG[invite.role]?.color || 'text-slate-400'}`}>
                                                {invite.role}
                                            </span>
                                            <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Pending
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Invite Modal */}
                    {showInviteModal && (
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Invite New Member</h2>
                                    <button onClick={() => setShowInviteModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <p className="text-slate-400 text-sm mb-6">Invitations expire in 7 days. Users will receive an email to join your organization.</p>

                                <form onSubmit={handleInvite}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={inviteData.email}
                                                    onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                                    placeholder="colleague@company.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Initial Role</label>
                                            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                {Object.entries(ROLE_CONFIG).filter(([k]) => k !== 'disabled').map(([role, config]) => (
                                                    <label key={role} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${inviteData.role === role ? 'bg-primary/10 border-primary/50' : 'bg-slate-950 border-white/5 hover:border-white/10'}`}>
                                                        <input
                                                            type="radio"
                                                            name="role"
                                                            value={role}
                                                            checked={inviteData.role === role}
                                                            onChange={e => setInviteData({ ...inviteData, role: e.target.value })}
                                                            className="mt-1 font-bold"
                                                        />
                                                        <div>
                                                            <div className={`font-bold transition-colors ${inviteData.role === role ? 'text-primary' : 'text-slate-300'}`}>{config.label}</div>
                                                            <div className="text-[10px] text-slate-500 leading-tight">{config.description}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <button
                                            disabled={updating}
                                            type="submit"
                                            className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
                                        >
                                            {updating ? 'Sending...' : 'Send Invitation'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
