"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } }
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const user = data?.user;
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: form.email,
        full_name: form.full_name,
        role: "member"
      });
    }

    setMessage("Account created. You can now login.");
    setLoading(false);
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Sign up</h1>
        <p className="small">Create an account for your team.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
          </div>
          <button className="btn" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
        </form>

        {message && <p className="small">{message}</p>}
        <p className="small" style={{ marginTop: 16 }}>Already have an account? <Link href="/login">Login</Link></p>
      </div>
    </div>
  );
}
