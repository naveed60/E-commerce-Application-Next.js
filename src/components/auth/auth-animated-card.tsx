"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/components/landing/storefront-design.module.css";

type AuthMode = "signin" | "signup";
export function AuthAnimatedCard({ initialMode = "signin", redirectTo = "/" }: { initialMode?: AuthMode; redirectTo?: string }) {
  const router = useRouter();
  const { status, data: session } = useSession();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => { setMode(initialMode); }, [initialMode]);
  function changeMode(next: AuthMode) { setMode(next); setError(null); setNotice(null); setPassword(""); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(null); setNotice(null);
    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
        if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.message || "Unable to create your account. Please try again."); return; }
        setMode("signin"); setPassword(""); setNotice("Account created. Sign in to continue.");
      } else {
        const result = await signIn("credentials", { email, password, redirect: false });
        if (!result?.ok || result.error) { setError("Incorrect email or password. Please try again."); return; }
        router.push(redirectTo); router.refresh();
      }
    } catch { setError("Unable to connect. Please try again."); }
    finally { setLoading(false); }
  }
  return <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-[0_18px_60px_rgba(34,40,35,.08)] md:grid-cols-2"><div className="p-6 sm:p-10 md:p-14"><p className="text-xs font-bold uppercase tracking-[.3em] text-[#d9233f]">{mode === "signin" ? "Welcome back" : "Join us"}</p><h1 className={`${styles.serif} mt-3 text-5xl`}>{mode === "signin" ? "Sign in" : "Create account"}</h1><p className="mt-3 text-sm leading-6 text-black/60">{mode === "signin" ? "Sign in to continue shopping and manage your orders." : "Create an account to keep your orders in one place."}</p>
    {status === "authenticated" ? <div className="mt-8 rounded-2xl bg-[#f5f1e9] p-5 text-sm"><p className="font-bold">Already signed in</p><p className="mt-1 text-black/60">{session?.user?.email}</p><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => { router.push(redirectTo); router.refresh(); }} className="rounded-full bg-[#06472f] px-5 py-3 font-bold text-white">Continue</button><button type="button" disabled={loading} onClick={async () => { setLoading(true); try { await signOut({ redirect: false }); router.refresh(); } catch { setError("Unable to sign out. Please try again."); } finally { setLoading(false); } }} className="rounded-full border border-black/20 px-5 py-3 font-bold">Switch account</button></div></div> : <form onSubmit={submit} className="mt-8 space-y-5">{mode === "signup" && <label className="block text-sm font-semibold">Name<input required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-black/15 bg-[#fbfaf8] px-4 py-3 outline-none focus:border-[#06472f]" /></label>}<label className="block text-sm font-semibold">Email<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-black/15 bg-[#fbfaf8] px-4 py-3 outline-none focus:border-[#06472f]" /></label><label className="block text-sm font-semibold">Password<input type="password" required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-black/15 bg-[#fbfaf8] px-4 py-3 outline-none focus:border-[#06472f]" /></label>{error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}{notice && <p role="status" className="text-sm font-semibold text-[#06472f]">{notice}</p>}<button type="submit" disabled={loading || status === "loading"} className="w-full rounded-full bg-[#06472f] px-6 py-4 text-sm font-bold text-white disabled:opacity-60">{loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button><p className="text-sm text-black/60">{mode === "signin" ? "New here? " : "Already have an account? "}<button type="button" onClick={() => changeMode(mode === "signin" ? "signup" : "signin")} className="font-bold text-[#06472f] underline underline-offset-4">{mode === "signin" ? "Create an account" : "Sign in"}</button></p></form>}
    {error && status === "authenticated" && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </div><aside className="hidden min-h-[520px] flex-col justify-end bg-[#06472f] p-12 text-white md:flex"><p className="text-xs font-bold uppercase tracking-[.3em] text-white/65">Drape &amp; Line</p><h2 className={`${styles.serif} mt-4 max-w-sm text-5xl leading-tight`}>Everyday style, made for you.</h2><p className="mt-5 max-w-sm text-sm leading-7 text-white/75">Discover thoughtful pieces and keep your shopping in one place.</p><Link href="/#shop" className="mt-8 w-fit rounded-full border border-white/60 px-6 py-3 text-sm font-bold">Explore the collection</Link></aside></div>;
}
