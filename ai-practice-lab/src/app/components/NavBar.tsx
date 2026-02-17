"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NavBar() {
    const router = useRouter();
    const [email, setEmail] = useState<string | null>(null);
    const [isDyslexicMode, setIsDyslexicMode] = useState(false);
    const [mounted, setMounted] = useState(false); // New: prevents hydration errors

    useEffect(() => {
        setMounted(true); // Signal that we are now on the client
        
        // 1. Check local storage
        const savedMode = localStorage.getItem("dyslexicMode") === "true";
        setIsDyslexicMode(savedMode);
        
        // 2. Apply class to body immediately on load
        if (savedMode) {
            document.body.classList.add("dyslexic-mode");
        }

        // 3. Supabase Auth
        supabase.auth.getSession().then(({ data }) => {
            setEmail(data.session?.user.email ?? null);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            setEmail(session?.user.email ?? null);
        });
        return () => sub.subscription.unsubscribe();
    }, []);

    const toggleDyslexicMode = () => {
        const newMode = !isDyslexicMode;
        setIsDyslexicMode(newMode);
        localStorage.setItem("dyslexicMode", String(newMode));
        
        if (newMode) {
            document.body.classList.add("dyslexic-mode");
        } else {
            document.body.classList.remove("dyslexic-mode");
        }
    };

    async function signOut() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    // If not mounted, render a placeholder or the default state to avoid hydration flicker
    if (!mounted) return (
        <header className="bg-gray-900 text-white">
            <div className="mx-auto max-w-4xl flex items-center justify-between p-4">
                <Link href="/" className="font-bold">AI Practice Lab</Link>
                <div className="w-20"></div> {/* Empty space where button will be */}
            </div>
        </header>
    );

    return (
        <header className="bg-gray-900 text-white">
            <div className="mx-auto max-w-4xl flex items-center justify-between p-4">
                <Link href="/" className="font-bold text-[#2c3e50]">
                    AI Practice Lab
                </Link>

                <nav className="flex items-center gap-4 text-sm">
                    <button 
                        onClick={toggleDyslexicMode}
                        className={`px-3 py-1 rounded-md border transition-all duration-200 cursor-pointer ${
                            isDyslexicMode 
                            ? "bg-yellow-100 text-black border-yellow-400 font-bold" 
                            : "hover:bg-gray-700 border-gray-600 text-white"
                        }`}
                    >
                        {isDyslexicMode ? "Standard" : "Dyslexic"}
                    </button>

                    <Link href="/profile" className="hover:underline text-white">
                        Profile
                    </Link>
                    
                    {email ? (
                        <button onClick={signOut} className="rounded-md border border-gray-600 px-3 py-1 hover:bg-gray-700 text-white cursor-pointer">
                            Sign out
                        </button>
                    ) : (
                        <Link href="/login" className="rounded-md border border-gray-600 px-3 py-1 hover:bg-gray-700 text-white">
                            Sign in
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}