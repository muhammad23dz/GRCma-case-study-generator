'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Users2,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Mail,
    Building,
    GraduationCap,
    CheckCircle,
    ArrowLeft
} from 'lucide-react';

interface Employee {
    id: string;
    email: string;
    name: string;
    department?: string;
    role?: string;
    manager?: string;
    status: string;
    hireDate?: string;
    complianceScore?: number;
    createdAt: string;
}

const STATUS_OPTIONS = ['active', 'on_leave', 'terminated'];
const DEPARTMENTS = ['IT', 'Engineering', 'Security', 'HR', 'Finance', 'Operations', 'Legal', 'Marketing'];

import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function EmployeesPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '', email: '', department: '', role: '', manager: '', status: 'active'
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/employees');
            if (res.ok) {
                const data = await res.json();
                setEmployees(data.employees || []);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees';
            const method = editingEmployee ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                setEditingEmployee(null);
                resetForm();
                fetchEmployees();
            }
        } catch (error) {
            console.error('Failed to save employee:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchEmployees();
            }
        } catch (error) {
            console.error('Failed to delete employee:', error);
        } finally {
            setDeleting(null);
        }
    };

    const openEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name, email: employee.email, department: employee.department || '',
            role: employee.role || '', manager: employee.manager || '', status: employee.status
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', department: '', role: '', manager: '', status: 'active' });
    };

    const filteredEmployees = employees.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.email.toLowerCase().includes(search.toLowerCase());
        const matchesDept = !filterDept || e.department === filterDept;
        return matchesSearch && matchesDept;
    });

    const STATUS_COLORS: Record<string, string> = {
        active: 'text-emerald-400 bg-emerald-500/10',
        on_leave: 'text-amber-400 bg-amber-500/10',
        terminated: 'text-red-400 bg-red-500/10',
    };

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Back to Dashboard */}
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Users2 className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{t('nav_workforce')}</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">{t('emp_title')}</h1>
                            <p className="text-lg text-slate-400">{t('emp_subtitle')}</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setEditingEmployee(null); setShowModal(true); }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            {t('emp_btn_add')}
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-white">{employees.length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">{t('ctrl_stat_total')}</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-emerald-400">{employees.filter(e => e.status === 'active').length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">{t('vendor_status_active')}</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-amber-400">{employees.filter(e => e.status === 'on_leave').length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">{t('vendor_status_pending')}</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-blue-400">{new Set(employees.map(e => e.department)).size}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">{t('nav_module_organization')}</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">{t('common_filter')}</option>
                            {DEPARTMENTS.map(dept => (
                                <option key={dept} value={dept} className="bg-slate-900">{dept}</option>
                            ))}
                        </select>
                    </div>

                    {/* Employees Table */}
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-20 bg-slate-900/40 animate-pulse rounded-xl" />
                            ))}
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                            <Users2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Employees Found</h3>
                            <p className="text-slate-400 mb-6">Add employees to track their compliance and training.</p>
                            <button
                                onClick={() => { resetForm(); setShowModal(true); }}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                            >
                                Add First Employee
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('nav_workforce')}</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('nav_module_organization')}</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('ctrl_table_actions')}</th>
                                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('inc_table_status')}</th>
                                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map(employee => (
                                        <tr key={employee.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                        {employee.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-medium">{employee.name}</div>
                                                        <div className="text-sm text-slate-500">{employee.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{employee.department || '-'}</td>
                                            <td className="px-6 py-4 text-slate-400">{employee.role || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${STATUS_COLORS[employee.status]}`}>
                                                    {employee.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openEdit(employee)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(employee.id)}
                                                        disabled={deleting === employee.id}
                                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
                            <button onClick={() => { setShowModal(false); setEditingEmployee(null); }} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="" className="bg-slate-900">Select...</option>
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept} className="bg-slate-900">{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {STATUS_OPTIONS.map(status => (
                                            <option key={status} value={status} className="bg-slate-900">{status.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Manager</label>
                                <input
                                    type="text"
                                    value={formData.manager}
                                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingEmployee(null); }}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                                >
                                    {editingEmployee ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
