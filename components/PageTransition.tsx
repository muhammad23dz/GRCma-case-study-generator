export default function PageTransition({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-backwards ${className}`}>
            {children}
        </div>
    );
}
