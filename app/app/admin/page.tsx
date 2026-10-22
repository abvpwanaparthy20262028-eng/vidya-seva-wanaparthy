
"use client";

import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

type Issue = {
  id: number;
  case_code: string | null;
  category: string;
  institution_name: string;
  institution_type: string | null;
  mandal: string;
  village: string | null;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
};

const STATUSES = [
  "నమోదైంది",
  "పరిశీలనలో ఉంది",
  "అధికారులకు పంపబడింది",
  "చర్యలు ప్రారంభమయ్యాయి",
  "పరిష్కరించబడింది",
  "తిరస్కరించబడింది",
];

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Record<number, string>>(
    {}
  );
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    void checkAdmin();
  }, []);

  async function checkAdmin() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!supabaseConfigured) {
        throw new Error("Supabase సెట్టింగులు సరిగా లేవు.");
      }

      const { data, error: authError } = await supabase.auth.getUser();

      if (authError || !data.user) {
        throw new Error("ముందుగా అడ్మిన్ లాగిన్ చేయాలి.");
      }

      const { data: role, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (roleError) {
        throw new Error("అడ్మిన్ అనుమతిని తనిఖీ చేయలేకపోయాం.");
      }

      if (role?.role !== "admin") {
        setIsAdmin(false);
        throw new Error("ఈ పేజీని చూడటానికి అడ్మిన్ అనుమతి అవసరం.");
      }

      setIsAdmin(true);
      await loadIssues();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ఏదో సమస్య వచ్చింది."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadIssues() {
    const { data, error: queryError } = await supabase
      .from("issue_cases")
      .select(
        "id, case_code, category, institution_name, institution_type, mandal, village, description, status, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (queryError) {
      throw new Error(
        "ఫిర్యాదులను తీసుకురాలేకపోయాం. Supabase RLS విధానాలను తనిఖీ చేయండి."
      );
    }

    const rows = (data ?? []) as Issue[];
    setIssues(rows);

    const initialStatuses: Record<number, string> = {};
    rows.forEach((issue) => {
      initialStatuses[issue.id] = issue.status;
    });
    setSelectedStatus(initialStatuses);
  }

  async function updateIssue(issue: Issue) {
    setError("");
    setMessage("");
    setSavingId(issue.id);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("సెషన్ ముగిసింది. మళ్లీ లాగిన్ చేయండి.");
      }

      const newStatus = selectedStatus[issue.id];
      if (!STATUSES.includes(newStatus)) {
        throw new Error("దయచేసి సరైన స్థితిని ఎంచుకోండి.");
      }

      if (newStatus === issue.status && !notes[issue.id]?.trim()) {
        setMessage("మార్పులు ఏమీ లేవు.");
        return;
      }

      const { error: updateError } = await supabase
        .from("issue_cases")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", issue.id);

      if (updateError) {
        throw new Error(
          "స్థితిని మార్చలేకపోయాం. అడ్మిన్ అనుమతులు తనిఖీ చేయండి."
        );
      }

      const { error: historyError } = await supabase
        .from("issue_updates")
        .insert({
          case_id: issue.id,
          old_status: issue.status,
          new_status: newStatus,
          note: notes[issue.id]?.trim() || null,
          updated_by: userData.user.id,
        });

      if (historyError) {
        setMessage(
          "స్థితి మార్చబడింది. అయితే మార్పు చరిత్ర సేవ్ కాలేదు; దయచేసి తనిఖీ చేయండి."
        );
      } else {
        setMessage("ఫిర్యాదు స్థితి విజయవంతంగా మార్చబడింది.");
      }

      await loadIssues();
      setNotes((previous) => ({ ...previous, [issue.id]: "" }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "స్థితి మార్చలేకపోయాం."
      );
    } finally {
      setSavingId(null);
    }
  }

  async function logout() {
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError("లాగౌట్ చేయలేకపోయాం.");
      return;
    }

    window.location.href = "/";
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f0f7f2",
      padding: "24px 16px 48px",
      color: "#173c31",
      fontFamily: "Arial, sans-serif",
    } as React.CSSProperties,
    container: {
      maxWidth: "1000px",
      margin: "0 auto",
    } as React.CSSProperties,
    card: {
      background: "#fff",
      border: "1px solid #dce9e0",
      borderRadius: "18px",
      padding: "20px",
      marginBottom: "16px",
      overflowWrap: "anywhere",
    } as React.CSSProperties,
    button: {
      background: "#126b53",
      color: "#fff",
      border: 0,
      borderRadius: "10px",
      padding: "12px 16px",
      fontWeight: 700,
      cursor: "pointer",
    } as React.CSSProperties,
    field: {
      width: "100%",
      boxSizing: "border-box",
      padding: "12px",
      border: "1px solid #cbd9d0",
      borderRadius: "10px",
      background: "#fff",
      fontSize: "16px",
      marginTop: "6px",
    } as React.CSSProperties,
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "30px" }}>
              అడ్మిన్ డ్యాష్‌బోర్డ్
            </h1>
            <p style={{ color: "#61766a", marginBottom: 0 }}>
              విద్యా సేవ – వనపర్తి
            </p>
          </div>

          <button style={styles.button} onClick={logout}>
            లాగౌట్
          </button>
        </header>

        {loading && <p>లోడ్ అవుతోంది…</p>}

        {!loading && error && (
          <section
            role="alert"
            style={{
              ...styles.card,
              background: "#fff0f0",
              color: "#8a2626",
            }}
          >
            <p>{error}</p>
            <button style={styles.button} onClick={checkAdmin}>
              మళ్లీ ప్రయత్నించండి
            </button>
          </section>
        )}

        {!loading && message && (
          <p
            role="status"
            style={{ ...styles.card, background: "#e5f6eb" }}
          >
            {message}
          </p>
        )}

        {!loading && isAdmin && !error && (
          <>
            <section style={styles.card}>
              <h2 style={{ marginTop: 0 }}>ఫిర్యాదుల సారాంశం</h2>
              <p>మొత్తం ఫిర్యాదులు: <strong>{issues.length}</strong></p>
              <p>
                పరిష్కరించబడినవి:{" "}
                <strong>
                  {issues.filter((i) => i.status === "పరిష్కరించబడింది").length}
                </strong>
              </p>
              <p>
                పెండింగ్‌లో ఉన్నవి:{" "}
                <strong>
                  {
                    issues.filter(
                      (i) =>
                        i.status !== "పరిష్కరించబడింది" &&
                        i.status !== "తిరస్కరించబడింది"
                    ).length
                  }
                </strong>
              </p>
              <button style={styles.button} onClick={() => void checkAdmin()}>
                రిఫ్రెష్ చేయండి
              </button>
            </section>

            <h2>ఫిర్యాదుల జాబితా</h2>

            {issues.length === 0 && (
              <section style={styles.card}>
                ప్రస్తుతం ఫిర్యాదులు ఏవీ లేవు.
              </section>
            )}

            {issues.map((issue) => (
              <article key={issue.id} style={styles.card}>
                <p style={{ color: "#126b53", fontWeight: 700 }}>
                  {issue.case_code || `ఫిర్యాదు #${issue.id}`}
                </p>

                <h3>{issue.category}</h3>

                <p>
                  <strong>సంస్థ:</strong> {issue.institution_name}
                </p>
                <p>
                  <strong>మండలం:</strong> {issue.mandal}
                </p>

                {issue.village && (
                  <p><strong>గ్రామం:</strong> {issue.village}</p>
                )}

                <p><strong>వివరాలు:</strong> {issue.description}</p>
                <p>
                  <strong>నమోదైన తేదీ:</strong>{" "}
                  {new Date(issue.created_at).toLocaleDateString("te-IN")}
                </p>
                <p><strong>ప్రస్తుత స్థితి:</strong> {issue.status}</p>

                <label
                  htmlFor={`status-${issue.id}`}
                  style={{ display: "block", fontWeight: 700, marginTop: 16 }}
                >
                  కొత్త స్థితి
                </label>
                <select
                  id={`status-${issue.id}`}
                  value={selectedStatus[issue.id] ?? issue.status}
                  onChange={(e) =>
                    setSelectedStatus((previous) => ({
                      ...previous,
                      [issue.id]: e.target.value,
                    }))
                  }
                  style={styles.field}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <label
                  htmlFor={`note-${issue.id}`}
                  style={{ display: "block", fontWeight: 700, marginTop: 14 }}
                >
                  తీసుకున్న చర్య / గమనిక
                </label>
                <textarea
                  id={`note-${issue.id}`}
                  value={notes[issue.id] ?? ""}
                  onChange={(e) =>
                    setNotes((previous) => ({
                      ...previous,
                      [issue.id]: e.target.value,
                    }))
                  }
                  placeholder="ఉదా: సంబంధిత అధికారికి సమాచారం ఇచ్చాం"
                  rows={3}
                  style={styles.field}
                />

                <button
                  style={{ ...styles.button, marginTop: 14 }}
                  disabled={savingId === issue.id}
                  onClick={() => void updateIssue(issue)}
                >
                  {savingId === issue.id ? "సేవ్ అవుతోంది…" : "స్థితిని సేవ్ చేయండి"}
                </button>
              </article>
            ))}
          </>
        )}

        <footer style={{ marginTop: 30, color: "#61766a", fontSize: 14 }}>
          భద్రతా గమనిక: ఈ పేజీలో చూపించే బటన్లు మాత్రమే భద్రతకు సరిపోవు.
          Supabase RLS విధానాలే అడ్మిన్ అనుమతులను తప్పనిసరిగా అమలు చేయాలి.
        </footer>
      </div>
    </main>
  );
}
