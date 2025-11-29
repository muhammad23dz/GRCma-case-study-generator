interface HeaderProps {
    onNavChange: (view: 'input' | 'history' | 'methodology' | 'about') => void;
}

export default function Header({ onNavChange }: HeaderProps) {
    return (
        <header className="bg-[#1a0505]/60 backdrop-blur-md border-b border-red-900/30 sticky top-0 z-50 shadow-lg shadow-red-900/5">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <button onClick={() => onNavChange('input')} className="group relative hover:scale-105 transition-transform duration-500">
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-600/20 to-red-600/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative flex items-center gap-0.5">
                        <span className="font-heading text-3xl font-black tracking-tighter bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent drop-shadow-sm">GRC</span>
                        <span className="font-heading text-3xl font-black tracking-tighter text-red-500 drop-shadow-sm">ma</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 mb-1 ml-0.5 animate-pulse"></div>
                    </div>
                </button>
                <nav>
                    <ul className="flex space-x-4 text-sm font-medium">
                        <li><button onClick={() => onNavChange('history')} className="hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30">Case Studies</button></li>
                        <li><button onClick={() => onNavChange('methodology')} className="hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30">Methodology</button></li>
                        <li><button onClick={() => onNavChange('about')} className="hover:text-gray-300 transition-colors px-4 py-2 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/20">About</button></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
