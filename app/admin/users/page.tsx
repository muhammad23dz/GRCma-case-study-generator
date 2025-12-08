'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useSession } from 'next-auth/react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdating(userId);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole })
            });

            if (res.ok) {
                // Optimistic update
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            }
        } catch (error) {
            console.error('Error updating role:', error);
        } finally {
            setUpdating(null);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'manager': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'analyst': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading users...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
            }} />

            <div className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
                        <p className="text-gray-400">Manage user access and roles (RBAC)</p>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-slate-900/50">
                                    <th className="p-4 text-sm font-medium text-gray-400">User</th>
                                    <th className="p-4 text-sm font-medium text-gray-400">Email</th>
                                    <th className="p-4 text-sm font-medium text-gray-400">Role</th>
                                    <th className="p-4 text-sm font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {user.image ? (
                                                    <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                                                        {user.name?.[0] || 'U'}
                                                    </div>
                                                )}
                                                <span className="text-white font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs border ${getRoleColor(user.role)} capitalize`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={updating === user.id}
                                                className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                            >
                                                <option value="viewer">Viewer</option>
                                                <option value="analyst">Analyst</option>
                                                <option value="manager">Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            {updating === user.id && <span className="ml-2 text-xs text-blue-400 animate-pulse">Saving...</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
