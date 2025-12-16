'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DevModeContextType {
    devMode: boolean;
    toggleDevMode: () => void;
    enableDevMode: () => void;
    disableDevMode: () => void;
}

const DevModeContext = createContext<DevModeContextType>({
    devMode: false,
    toggleDevMode: () => { },
    enableDevMode: () => { },
    disableDevMode: () => { },
});

export const useDevMode = () => useContext(DevModeContext);

export function DevModeProvider({ children }: { children: ReactNode }) {
    const [devMode, setDevMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check localStorage on mount
        const stored = localStorage.getItem('DEV_MODE');
        setDevMode(stored === 'true');

        // Also expose globally for console access
        (window as any).enableDevMode = () => {
            localStorage.setItem('DEV_MODE', 'true');
            setDevMode(true);
            window.location.reload();
        };
        (window as any).disableDevMode = () => {
            localStorage.removeItem('DEV_MODE');
            setDevMode(false);
            window.location.reload();
        };
    }, []);

    const toggleDevMode = () => {
        if (devMode) {
            localStorage.removeItem('DEV_MODE');
            setDevMode(false);
        } else {
            localStorage.setItem('DEV_MODE', 'true');
            setDevMode(true);
        }
        window.location.reload();
    };

    const enableDevMode = () => {
        localStorage.setItem('DEV_MODE', 'true');
        setDevMode(true);
        window.location.reload();
    };

    const disableDevMode = () => {
        localStorage.removeItem('DEV_MODE');
        setDevMode(false);
        window.location.reload();
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <DevModeContext.Provider value={{ devMode, toggleDevMode, enableDevMode, disableDevMode }}>
            {children}
        </DevModeContext.Provider>
    );
}
