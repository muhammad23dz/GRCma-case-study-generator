interface HeaderProps {
    onNavChange: (view: 'input' | 'history' | 'methodology' | 'about') => void;
}

export default function Header({ onNavChange }: HeaderProps) {
    return (
        <header className="bg-slate-900/80 backdrop-blur-md text-white py-4 shadow-lg border-b border-green-500/30">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <button onClick={() => onNavChange('input')} className="text-2xl font-bold tracking-tight hover:scale-105 transition-transform">
                    <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">GRC</span>
                    <span className="text-red-400">ma</span>
                </button>
                <nav>
                    <ul className="flex space-x-6 text-sm font-medium">
                        <li><button onClick={() => onNavChange('history')} className="hover:text-green-400 transition-colors px-3 py-1 rounded-md hover:bg-green-500/10">Case Studies</button></li>
                        <li><button onClick={() => onNavChange('methodology')} className="hover:text-emerald-400 transition-colors px-3 py-1 rounded-md hover:bg-emerald-500/10">Methodology</button></li>
                        <li><button onClick={() => onNavChange('about')} className="hover:text-red-400 transition-colors px-3 py-1 rounded-md hover:bg-red-500/10">About</button></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
