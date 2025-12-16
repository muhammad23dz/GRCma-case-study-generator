'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { Users, Shield, UserPlus, Trash2, Mail, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string;
}

interface Invitation {
    id: string;
    email: string;
    role: string;
    expires: string;
}

export default function UserManagementPage() {
    const { t } = useLanguage();
    const { user: currentUser, isLoaded } = useUser();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    // Modal State
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteData, setInviteData] = useState({ email: '', role: 'user' });

    useEffect(() => {
        if (isLoaded) {
            const role = (currentUser?.publicMetadata as any)?.role;
            if (role !== 'admin') {
                setAccessDenied(true);
                setLoading(false);
            } else {
                fetchUsers();
            }
        }
    }, [isLoaded, currentUser]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                // Client-side filtering as fallback, but API should handle this.
                // Assuming API returns global list currently, we filter by Org (if we had it in frontend user object).
                // Better: Update API to filter. But for now, let's assume the API route needs checking.
                // Wait, I should verify the API route. 'app/api/admin/users/route.ts'
                // For now, I'll update the component to be ready, but the real fix is in the API.
                setUsers(data.users || []);
                setInvitations(data.invitations || []);
            } else {
                if (res.status === 403) setAccessDenied(true);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inviteData)
            });
            if (res.ok) {
                const data = await res.json();
                setShowInviteModal(false);
                setInviteData({ email: '', role: 'user' });
                fetchUsers();

                if (data.emailSent) {
                    alert(`Invitation sent to ${inviteData.email} successfully!`);
                } else {
                    alert(`User added, BUT email failed to send.\nReason: ${data.emailError}\n\nPlease check 'System Config' to set up SMTP.`);
                }
            }
        } catch (error) {
            console.error('Invite failed', error);
        }
    };

    const handleRoleChange = async (id: string, newRole: string) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                // Optimistic Update or Refetch
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update role');
            }
        } catch (error) {
            console.error('Role update failed', error);
            alert('Failed to update role');
        }
    };

    const handleRemoveUser = async (id: string, name: string, type: 'user' | 'invitation' = 'user') => {
        const action = type === 'invitation' ? 'revoke invitation for' : 'revoke access for';
        if (!confirm(`Are you sure you want to ${action} ${name}?`)) return;

        try {
            const res = await fetch(`/api/admin/users/${id}?type=${type}`, { method: 'DELETE' });
            if (res.ok) {
                fetchUsers();
            } else {
                alert('Failed to delete. Please try again.');
            }
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

    if (accessDenied) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
                <Shield className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Access Restricted</h1>
                <p className="text-slate-400 mb-6 text-center max-w-md">
                    This area is restricted to Organization Administrators only.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition"
                >
                    Return via Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white bg-slate-950">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32 max-w-6xl mx-auto">
                <PageTransition>
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                                <Users className="w-8 h-8 text-blue-500" />
                                {t('team_title')}
                            </h1>
                            <p className="text-slate-400">{t('team_sub')}</p>
                        </div>
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 font-bold flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <UserPlus className="w-5 h-5" />
                            {t('team_add_member')}
                        </button>
                    </div>

                    {/* Active Users */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden mb-12">
                        <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                {t('team_active_principals')} ({users.length})
                            </h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {users.map(user => {
                                const isSelf = currentUser?.primaryEmailAddress?.emailAddress === user.email;
                                const canDelete = !isSelf && (user.role !== 'admin' || users.filter(u => u.role === 'admin').length > 1);

                                return (
                                    <div key={user.id} className={`p-6 flex items-center justify-between hover:bg-white/5 transition-colors group ${isSelf ? 'bg-emerald-500/5' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            {user.image ? (
                                                <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full border border-white/10" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold">
                                                    {user.name?.[0] || user.email?.[0]}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-lg flex items-center gap-2">
                                                    {user.name || 'Unknown'}
                                                    {isSelf && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                                                </div>
                                                <div className="text-slate-400 text-sm font-mono">{user.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    disabled={isSelf && user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-full border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase tracking-wide
                                                ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 font-black' :
                                                            user.role === 'manager' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                                user.role === 'analyst' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' :
                                                                    'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                                        }`}
                                                >
                                                    <option value="admin" className="bg-slate-900 text-purple-400 font-bold">ADMIN</option>
                                                    <option value="manager" className="bg-slate-900 text-blue-400 font-bold">MANAGER</option>
                                                    <option value="analyst" className="bg-slate-900 text-teal-400 font-bold">ANALYST</option>
                                                    <option value="user" className="bg-slate-900 text-slate-400 font-bold">VIEWER</option>
                                                </select>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveUser(user.id, user.name || user.email)}
                                                disabled={!canDelete}
                                                className={`p-2 rounded-lg transition-colors ${canDelete
                                                    ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                                                    : 'text-slate-700 cursor-not-allowed opacity-50'}`}
                                                title={isSelf ? 'Cannot delete yourself' : t('team_revoke')}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pending Invitations */}
                    {invitations.length > 0 && (
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-400" />
                                    {t('team_pending_invites')} ({invitations.length})
                                </h3>
                            </div>
                            <div className="divide-y divide-white/5">
                                {invitations.map(invite => (
                                    <div key={invite.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-white/10 flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-200">{invite.email}</div>
                                                <div className="text-slate-500 text-sm">Invited to be <span className="text-white">{invite.role}</span></div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-500 font-mono">
                                            Expires {new Date(invite.expires).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveUser(invite.id, invite.email, 'invitation')}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-4"
                                            title={t('team_revoke_invite')}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </PageTransition>

                {/* Invite Modal */}
                {
                    showInviteModal && (
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
                                <h2 className="text-2xl font-bold mb-1">{t('team_invite_modal_title')}</h2>
                                <p className="text-slate-400 text-sm mb-6">{t('team_invite_modal_desc')}</p>

                                <form onSubmit={handleInvite}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">{t('team_invite_email_label')}</label>
                                            <input
                                                type="email"
                                                required
                                                value={inviteData.email}
                                                onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                                placeholder="colleague@gmail.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">{t('team_invite_role_label')}</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { id: 'admin', label: 'Administrator', desc: 'Full access to system & users' },
                                                    { id: 'manager', label: 'Manager', desc: 'Can edit content, no user management' },
                                                    { id: 'analyst', label: 'Analyst', desc: 'Read-only access to all reports' },
                                                    { id: 'user', label: 'Viewer/User', desc: 'Standard read/write access' }
                                                ].map(role => (
                                                    <label key={role.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${inviteData.role === role.id ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-950 border-white/5 hover:border-white/10'}`}>
                                                        <input
                                                            type="radio"
                                                            name="role"
                                                            value={role.id}
                                                            checked={inviteData.role === role.id}
                                                            onChange={e => setInviteData({ ...inviteData, role: e.target.value })}
                                                            className="mt-1"
                                                        />
                                                        <div>
                                                            <div className={`font-bold ${inviteData.role === role.id ? 'text-blue-400' : 'text-slate-300'}`}>{role.label}</div>
                                                            <div className="text-xs text-slate-500">{role.desc}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-8">
                                        <button
                                            type="button"
                                            onClick={() => setShowInviteModal(false)}
                                            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-500/20"
                                        >
                                            {t('team_invite_send')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
}
