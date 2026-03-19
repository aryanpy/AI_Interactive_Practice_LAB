"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage(){
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(()=>{
        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY"){
                setReady(true);
            }
        });

        supabase.auth.getSession().then(({data}) => {
            if(data.session){
                setReady(true);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function handleUpdatePassword(e: React.FormEvent){
        e.preventDefault();
        setMsg(null);

        if(password !== confirmPassword){
            setMsg("Passwords do not match");
            return;
        }

        if(password.length < 6){
            setMsg("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try{
            const{error} = await supabase.auth.updateUser({password});

            if(error) throw error;
            setMsg("Password updated successfully. Redirecting to login...");

            setTimeout(()=>{
                router.push("/login");
            }, 1500);
        } catch(err:any){
            setMsg(err?.message ?? "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-cneter justify-center p-6">
            <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-black">Set New Password</h1>
                <p className="text-sm text-gray-600 mt-1">Enter your new password blow.</p>

                {!ready ? (
                    <div className="mt-6 text-sm text-red-600">
                        Recovery session not found. Please use the password reset link from email.
                    </div>
                ) : (
                    <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
                        <div> 
                            <label className="text-sm font-medium text-black">New Password</label>
                            <input
                                className="mt-1 w-full rounded-lg border px-3 py-2 text-black"
                                type="password"
                                value={password}
                                onChange={(e)=>setPassword(e.target.value)}
                                placeholder="New Password"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-black">Confirm Password</label>
                            <input
                                className="mt-1 w-full rounded-lg border px-3 py-2 text-black"
                                type="password"
                                value={confirmPassword}
                                onChange={(e)=>setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                required
                            />
                        </div>

                        {msg && <div className="text-sm text-red-600">{msg}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-black text-white py-2 font-medium disabled:opacity-50"
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                )}
            </div>
        </main>
    )
}