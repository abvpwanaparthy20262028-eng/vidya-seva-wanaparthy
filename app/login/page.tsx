
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      setMessage(
        "మీ ఇమెయిల్‌కు లాగిన్ లింక్ పంపించాం. మీ Gmail Inbox తెరిచి ఆ లింక్‌ను నొక్కండి."
      );
   
} catch (err) {
  console.error("Login error:", err);

  const details =
    typeof err === "object" && err !== null && "message" in err
      ? String((err as { message?: unknown }).message ?? "")
      : String(err);

  setError(`లాగిన్ సమస్య: ${details || String(err)}`);
} finally {
  setLoading(false);
}

  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "#f2f7f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 430,
          background: "#fff",
          padding: 28,
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ color: "#116b57", textAlign: "center" }}>
          విద్యా సేవ – వనపర్తి
        </h1>
        <h2 style={{ textAlign: "center" }}>Login / Sign Up</h2>
        <p style={{ textAlign: "center", color: "#52616b" }}>
          మీ Gmail ద్వారా ఉచితంగా లాగిన్ అవ్వండి.
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="email" style={{ fontWeight: 600 }}>
            Gmail / Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="మీ ఇమెయిల్ నమోదు చేయండి"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 13,
              marginTop: 8,
              marginBottom: 18,
              border: "1px solid #cbd5d1",
              borderRadius: 8,
              fontSize: 16,
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 13,
              border: 0,
              borderRadius: 8,
              background: "#116b57",
              color: "#fff",
              fontSize: 16,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "పంపుతోంది..." : "Email ద్వారా Login / Sign Up"}
          </button>
        </form>

        {message && (
          <p role="status" style={{ color: "#166534", marginTop: 18 }}>
            {message}
          </p>
        )}
        {error && (
          <p role="alert" style={{ color: "#b91c1c", marginTop: 18 }}>
            {error}
          </p>
        )}

        <p style={{ fontSize: 13, color: "#64748b", marginTop: 20 }}>
          ఈ సేవ ఉచితం. మీ ఇమెయిల్‌కు వచ్చే లాగిన్ లింక్‌ను ఉపయోగించండి.
        </p>
      </section>
    </main>
  );
}
