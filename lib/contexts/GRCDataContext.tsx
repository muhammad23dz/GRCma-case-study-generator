'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface GRCState {
    controls: any[];
    risks: any[];
    vendors: any[];
    policies: any[];
    incidents: any[];
    actions: any[];
    analytics: any;
    coverage: any | null;
    activity: any[];
    loading: boolean;
    error: string | null;
    // Gigachad GRC Modules
    bcdrPlans: any[];
    assets: any[];
    employees: any[];
    trainingCourses: any[];
    questionnaires: any[];
    runbooks: any[];
    businessProcesses: any[];
}

interface GRCContextType extends GRCState {
    refreshAll: () => Promise<void>;
    refreshAnalytics: () => Promise<void>;
    refreshCoverage: () => Promise<void>;
    refreshActivity: () => Promise<void>;
    refreshData: (type: 'controls' | 'risks' | 'vendors' | 'policies' | 'incidents' | 'actions' | 'bcdr' | 'assets' | 'employees' | 'training' | 'questionnaires' | 'runbooks' | 'processes') => Promise<void>;
}

const GRCContext = createContext<GRCContextType | undefined>(undefined);

export function GRCProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<GRCState>({
        controls: [],
        risks: [],
        vendors: [],
        policies: [],
        incidents: [],
        actions: [],
        analytics: null,
        coverage: null,
        activity: [],
        loading: true,
        error: null,
        // Gigachad GRC Modules
        bcdrPlans: [],
        assets: [],
        employees: [],
        trainingCourses: [],
        questionnaires: [],
        runbooks: [],
        businessProcesses: [],
    });

    const refreshAnalytics = useCallback(async () => {
        try {
            const res = await fetch('/api/analytics/overview');
            if (res.ok) {
                const data = await res.json();
                setState(prev => ({ ...prev, analytics: data }));
            }
        } catch (err) {
            console.error('Failed to refresh analytics:', err);
        }
    }, []);

    const refreshCoverage = useCallback(async () => {
        try {
            const res = await fetch('/api/analytics/control-coverage');
            if (res.ok) {
                const data = await res.json();
                setState(prev => ({ ...prev, coverage: data }));
            }
        } catch (err) {
            console.error('Failed to refresh coverage:', err);
        }
    }, []);

    const refreshActivity = useCallback(async () => {
        try {
            const res = await fetch('/api/analytics/activity');
            if (res.ok) {
                const data = await res.json();
                setState(prev => ({ ...prev, activity: data.activity || [] }));
            }
        } catch (err) {
            console.error('Failed to refresh activity:', err);
        }
    }, []);

    const refreshData = useCallback(async (type: 'controls' | 'risks' | 'vendors' | 'policies' | 'incidents' | 'actions' | 'bcdr' | 'assets' | 'employees' | 'training' | 'questionnaires' | 'runbooks' | 'processes') => {
        try {
            const apiMap: Record<string, { endpoint: string; stateKey: string; dataKey: string }> = {
                controls: { endpoint: '/api/controls', stateKey: 'controls', dataKey: 'controls' },
                risks: { endpoint: '/api/risks', stateKey: 'risks', dataKey: 'risks' },
                vendors: { endpoint: '/api/vendors', stateKey: 'vendors', dataKey: 'vendors' },
                policies: { endpoint: '/api/policies', stateKey: 'policies', dataKey: 'policies' },
                incidents: { endpoint: '/api/incidents', stateKey: 'incidents', dataKey: 'incidents' },
                actions: { endpoint: '/api/actions', stateKey: 'actions', dataKey: 'actions' },
                bcdr: { endpoint: '/api/bcdr/plans', stateKey: 'bcdrPlans', dataKey: 'plans' },
                assets: { endpoint: '/api/assets', stateKey: 'assets', dataKey: 'assets' },
                employees: { endpoint: '/api/employees', stateKey: 'employees', dataKey: 'employees' },
                training: { endpoint: '/api/training', stateKey: 'trainingCourses', dataKey: 'courses' },
                questionnaires: { endpoint: '/api/questionnaires', stateKey: 'questionnaires', dataKey: 'questionnaires' },
                runbooks: { endpoint: '/api/runbooks', stateKey: 'runbooks', dataKey: 'runbooks' },
                processes: { endpoint: '/api/processes', stateKey: 'businessProcesses', dataKey: 'processes' },
            };

            const config = apiMap[type];
            if (!config) return;

            const res = await fetch(config.endpoint);
            if (res.ok) {
                const data = await res.json();
                setState(prev => ({ ...prev, [config.stateKey]: data[config.dataKey] || [] }));
            }
        } catch (err) {
            console.error(`Failed to refresh ${type}:`, err);
        }
    }, []);

    const refreshAll = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            await Promise.all([
                refreshAnalytics(),
                refreshCoverage(),
                refreshActivity(),
                refreshData('controls'),
                refreshData('risks'),
                refreshData('vendors'),
                refreshData('policies'),
                refreshData('incidents'),
                refreshData('actions'),
                // Gigachad GRC modules
                refreshData('bcdr'),
                refreshData('assets'),
                refreshData('employees'),
                refreshData('training'),
                refreshData('questionnaires'),
                refreshData('runbooks'),
                refreshData('processes'),
            ]);
        } catch (err: any) {
            setState(prev => ({ ...prev, error: err.message }));
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, [refreshAnalytics, refreshActivity, refreshCoverage, refreshData]);

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    return (
        <GRCContext.Provider value={{ ...state, refreshAll, refreshAnalytics, refreshCoverage, refreshActivity, refreshData }}>
            {children}
        </GRCContext.Provider>
    );
}

export function useGRCData() {
    const context = useContext(GRCContext);
    if (context === undefined) {
        throw new Error('useGRCData must be used within a GRCProvider');
    }
    return context;
}
