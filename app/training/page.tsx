'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    GraduationCap,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Clock,
    Users,
    CheckCircle,
    Play
} from 'lucide-react';

interface TrainingCourse {
    id: string;
    title: string;
    description?: string;
    type: string;
    duration?: number;
    mandatory: boolean;
    content?: string;
    passingScore?: number;
    frequency?: string;
    status: string;
    owner: string;
    createdAt: string;
}

const COURSE_TYPES = ['security_awareness', 'compliance', 'technical', 'onboarding', 'policy'];
const FREQUENCY_OPTIONS = ['once', 'quarterly', 'annually', 'biannually'];
const STATUS_OPTIONS = ['draft', 'active', 'archived'];

export default function TrainingPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<TrainingCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<TrainingCourse | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '', description: '', type: 'security_awareness', duration: '',
        mandatory: true, content: '', passingScore: '80', frequency: 'annually', status: 'active'
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/training');
            if (res.ok) {
                const data = await res.json();
                setCourses(data.courses || []);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingCourse ? `/api/training/${editingCourse.id}` : '/api/training';
            const method = editingCourse ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    duration: formData.duration ? parseInt(formData.duration) : null,
                    passingScore: formData.passingScore ? parseInt(formData.passingScore) : 80
                })
            });

            if (res.ok) {
                setShowModal(false);
                setEditingCourse(null);
                resetForm();
                fetchCourses();
            }
        } catch (error) {
            console.error('Failed to save course:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this training course?')) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/training/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCourses();
            }
        } catch (error) {
            console.error('Failed to delete course:', error);
        } finally {
            setDeleting(null);
        }
    };

    const openEdit = (course: TrainingCourse) => {
        setEditingCourse(course);
        setFormData({
            title: course.title, description: course.description || '', type: course.type,
            duration: course.duration?.toString() || '', mandatory: course.mandatory,
            content: course.content || '', passingScore: course.passingScore?.toString() || '80',
            frequency: course.frequency || 'annually', status: course.status
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '', description: '', type: 'security_awareness', duration: '',
            mandatory: true, content: '', passingScore: '80', frequency: 'annually', status: 'active'
        });
    };

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
        const matchesType = !filterType || c.type === filterType;
        return matchesSearch && matchesType;
    });

    const TYPE_LABELS: Record<string, string> = {
        security_awareness: 'Security Awareness',
        compliance: 'Compliance',
        technical: 'Technical',
        onboarding: 'Onboarding',
        policy: 'Policy'
    };

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <GraduationCap className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Training</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Training Center</h1>
                            <p className="text-lg text-slate-400">Manage security awareness and compliance training</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setEditingCourse(null); setShowModal(true); }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            Create Course
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-white">{courses.length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Courses</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-emerald-400">{courses.filter(c => c.status === 'active').length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Active</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-amber-400">{courses.filter(c => c.mandatory).length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Mandatory</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-blue-400">{courses.reduce((a, c) => a + (c.duration || 0), 0)}m</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Duration</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">All Types</option>
                            {COURSE_TYPES.map(type => (
                                <option key={type} value={type} className="bg-slate-900">{TYPE_LABELS[type]}</option>
                            ))}
                        </select>
                    </div>

                    {/* Courses Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-48 bg-slate-900/40 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                            <GraduationCap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Training Courses</h3>
                            <p className="text-slate-400 mb-6">Create your first training course to get started.</p>
                            <button
                                onClick={() => { resetForm(); setShowModal(true); }}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                            >
                                Create First Course
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map(course => (
                                <div
                                    key={course.id}
                                    className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                            <GraduationCap className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(course)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                disabled={deleting === course.id}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1">{course.title}</h3>
                                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{course.description || 'No description'}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400">
                                            {TYPE_LABELS[course.type] || course.type}
                                        </span>
                                        {course.mandatory && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400">
                                                Mandatory
                                            </span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${course.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                                            }`}>
                                            {course.status}
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {course.duration || 0} min
                                        </span>
                                        <span>Pass: {course.passingScore || 80}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{editingCourse ? 'Edit Course' : 'Create Training Course'}</h2>
                            <button onClick={() => { setShowModal(false); setEditingCourse(null); }} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Course Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {COURSE_TYPES.map(type => (
                                            <option key={type} value={type} className="bg-slate-900">{TYPE_LABELS[type]}</option>
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
                                            <option key={status} value={status} className="bg-slate-900">{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Duration (min)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Passing Score (%)</label>
                                    <input
                                        type="number"
                                        value={formData.passingScore}
                                        onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Frequency</label>
                                    <select
                                        value={formData.frequency}
                                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {FREQUENCY_OPTIONS.map(freq => (
                                            <option key={freq} value={freq} className="bg-slate-900">{freq}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="mandatory"
                                    checked={formData.mandatory}
                                    onChange={(e) => setFormData({ ...formData, mandatory: e.target.checked })}
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                                />
                                <label htmlFor="mandatory" className="text-sm font-medium text-slate-400">Mandatory for all employees</label>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingCourse(null); }}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                                >
                                    {editingCourse ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
