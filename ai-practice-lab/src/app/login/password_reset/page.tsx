"use client";

import {useState} from "react";
import {supabase} from "../../../lib/supabaseClient";
import {useRouter} from "next/navigation";


export default function PasswordResetPage(){
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);


    async function handleReset(e: React.FormEvent){
        e.preventDefault();
        setMsg(null);
        setLoading(true);

        try{
            const redirectTo = 
                typeof window !== "undefined"
                    ? `${window.location.origin}/login/update_password` : undefined;
            const {error} = await supabase.auth.resetPasswordForEmail(email, {redirectTo});

            if(error) throw error;
            setMsg("Password reset email sent. Please check your inbox");
        } catch(err:any) {
            setMsg(err?.message ?? "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-black">Reset Password</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Enter the email and we will sent you a password reset link.
                </p>

                <form onSubmit={handleReset} className="mt-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-black">Email</label>
                        <input
                            className="mt-1 w-full rounded-lg border px-3 py-2 text-black"
                            type="email"
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                            placeholder="Email Address"
                            required
                        />
                    </div>

                    {msg && <div className="text-sm text-red-600">{msg}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-black text-white py-2 font-medium disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send reset link"}
                    </button>
                </form>
                
                <button
                    type="button"
                    className="mt-4 text-sm text-gray-700 underline"
                    onClick={()=>router.push("/login")}
                >
                    Back to Sign In
                </button>
            </div>
        </main>
    )
}