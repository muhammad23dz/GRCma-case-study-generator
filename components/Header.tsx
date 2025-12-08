<ul className="flex space-x-2 text-sm font-medium">
    <li><button onClick={() => onNavChange('input')} className="hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30">Generator</button></li>
    <li><a href="/controls" className="hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 block">Controls</a></li>
    <li><a href="/risks" className="hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 block">Risks</a></li>
    <li><a href="/vendors" className="hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 block">Vendors</a></li>
    <li><button onClick={() => onNavChange('history')} className="hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30">Reports</button></li>
    <li><button onClick={() => onNavChange('about')} className="hover:text-gray-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/20">About</button></li>
</ul>
                    </nav >

    { session?.user && (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
            >
                {session.user.image ? (
                    <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-8 h-8 rounded-full ring-2 ring-emerald-500/50"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold">
                        {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                    </div>
                )}
                <span className="text-sm font-medium hidden md:block">{session.user.name || session.user.email}</span>
                <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">{session.user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-red-500/10 transition-colors flex items-center gap-2 text-red-400 hover:text-red-300"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    )}
                </div >
            </div >
        </header >
    );
}
