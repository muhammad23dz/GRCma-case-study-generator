'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function AuthButton() {
    return (
        <>
            <SignedIn>
                <UserButton />
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <button className="px-4 py-2 text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all shadow-lg hover:shadow-green-500/50 flex items-center gap-2">
                        Sign In
                    </button>
                </SignInButton>
            </SignedOut>
        </>
    );
}
