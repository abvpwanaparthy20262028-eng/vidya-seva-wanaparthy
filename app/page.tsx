
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/lib/supabase";

type SurveyForm = {
  institution_name: string;
  institution_type: string;
  mandal: string;
  village: string;
  issue_summary: string;
  building_condition: string;
  drinking_water: string;
  toilets_condition: string;
  teacher_shortage: string;
};

type ComplaintForm = {
  category: string;
  mandal: string;
  institution_name: string;
  description: string;
};

type PublicStats = {
  total_issues: number;
  resolved_issues: number;
  pending_issues: number;
  total_surveys: number;
  total_complaints: number;
};

type TrackedIssue = {
  case_code: string;
  category: string;
  mandal: string;
  status: string;
  created_at: string;
  updated_at: string;
};

const emptySurvey: SurveyForm = {
  institution_name: "",
  institution_type: "ప్రభుత్వ పాఠశాల",
  mandal: "",
  village: "",
  issue_summary: "",
  building_condition: "",
  drinking_water: "",
  toilets_condition: "",
  teacher_shortage: "",
};

const emptyComplaint: ComplaintForm = {
  category: "భవన సమస్య",
  mandal: "",
  institution_name: "",
  description: "",
};

const emptyStats: PublicStats = {
  total_issues: 0,
  resolved_issues: 0,
  pending_issues: 0,
  total_surveys: 0,
  total_complaints: 0,
};

const mandals = [
  "వనపర్తి",
  "పెబ్బేరు",
  "కొత్తకోట",
  "ఆత్మకూరు",
  "అమరచింత",
  "ఘణపురం",
  "గోపాల్‌పేట",
  "మదనాపురం",
  "పెద్దమందడి",
  "పానగల్",
  "రేవల్లి",
  "శ్రీరంగాపురం",
  "వీపనగండ్ల",
  "యెడుల",
];

const services = [
  {
    icon: "🏫",
    title: "విద్యా సర్వే",
    text: "పాఠశాలలు, కళాశాలలు, హాస్టళ్లలో విద్యా సౌకర్యాల వివరాలను నమోదు చేయండి.",
    action: "survey",
  },
  {
    icon: "📝",
    title: "సమస్య తెలియజేయండి",
    text: "మీ విద్యాసంస్థలోని సమస్యను బాధ్యతాయుతంగా నమోదు చేయండి.",
    action: "complaint",
  },
  {
    icon: "🔎",
    title: "ఫిర్యాదు స్థితి",
    text: "మీ ఫిర్యాదు ID ఉపయోగించి ప్రస్తుత స్థితిని తెలుసుకోండి.",
    action: "track",
  },
  {
    icon: "🎓",
    title: "విద్యార్థుల హక్కులు",
    text: "విద్యార్థుల అవసరాలను గుర్తించి మెరుగైన విద్య కోసం సమాచారాన్ని సేకరించడం.",
    action: "about",
  },
];

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f4f8f5",
    color: "#17352c",
    fontFamily: "Arial, sans-serif",
    paddingBottom: 0,
  },
  container: {
    width: "min(1120px, 92%)",
    margin: "0 auto",
  },
  button: {
    background: "#126b50",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "13px 20px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#fff",
    color: "#126b50",
    border: "1px solid #c9e1d4",
    borderRadius: 12,
    padding: "13px 20px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  card: {
    background: "#fff",
    border: "1px solid #e1ece5",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 28px rgba(20,70,48,0.06)",
  },
  field: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: 13,
    marginTop: 7,
    marginBottom: 18,
    border: "1px solid #cbdcd2",
    borderRadius: 10,
    background: "#fff",
    color: "#17352c",
    fontSize: 16,
  },
};

export default function Home() {
  const [section, setSection] = useState("home");
  const [survey, setSurvey] = useState<SurveyForm>(emptySurvey);
  const [complaint, setComplaint] =
    useState<ComplaintForm>(emptyComplaint);

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [statsError, setStatsError] = useState("");
  const [stats, setStats] = useState<PublicStats>(emptyStats);

  const [trackingCode, setTrackingCode] = useState("");
  const [trackedIssue, setTrackedIssue] =
    useState<TrackedIssue | null>(null);
  const [trackingError, setTrackingError] = useState("");

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPublicStats() {
      if (!supabaseConfigured) {
        if (active) {
          setStatsError("డేటాబేస్ సెట్టింగ్స్ తనిఖీ చేయాలి.");
          setStatsLoading(false);
        }
        return;
      }

      try {
        const { data, error: rpcError } = await supabase.rpc(
          "get_public_issue_stats"
        );

        if (rpcError) throw rpcError;

        const result = Array.isArray(data) ? data[0] : data;

        if (active && result) {
          setStats({
            total_issues: Number(result.total_issues ?? 0),
            resolved_issues: Number(result.resolved_issues ?? 0),
            pending_issues: Number(result.pending_issues ?? 0),
            total_surveys: Number(result.total_surveys ?? 0),
            total_complaints: Number(result.total_complaints ?? 0),
          });
        }
      } catch (err) {
        console.error("Public stats error:", err);
        if (active) {
          setStatsError(
            "గణాంకాలు ప్రస్తుతం అందుబాటులో లేవు. తర్వాత మళ్లీ ప్రయత్నించండి."
          );
        }
      } finally {
        if (active) setStatsLoading(false);
      }
    }

    void loadPublicStats();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (active) setAuthUser(data.session?.user ?? null);
      } catch (err) {
        console.error("Auth session error:", err);
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    void loadSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setAuthUser(session?.user ?? null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function submitLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginLoading(true);
    setMessage("");
    setError("");

    if (!supabaseConfigured) {
      setError("Supabase సెట్టింగ్స్ సరిగా లేవు. NEXT_PUBLIC_SUPABASE_URL మరియు NEXT_PUBLIC_SUPABASE_ANON_KEY తనిఖీ చేయండి.");
      setLoginLoading(false);
      return;
    }

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (loginError) throw loginError;
      setAuthUser(data.user);
      setLoginPassword("");
      setMessage("లాగిన్ విజయవంతమైంది. ఇప్పుడు సర్వే లేదా ఫిర్యాదును నమోదు చేయవచ్చు.");
      setSection("home");
    } catch (err) {
      console.error("Login error:", err);
      setError("లాగిన్ కాలేదు. ఇమెయిల్, పాస్‌వర్డ్ సరిచూసి మళ్లీ ప్రయత్నించండి.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function logout() {
    setError("");
    setMessage("");
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) {
      setError("లాగౌట్ కాలేదు. మళ్లీ ప్రయత్నించండి.");
      return;
    }
    setAuthUser(null);
    setSection("home");
    setMessage("మీరు విజయవంతంగా లాగౌట్ అయ్యారు.");
  }

  function navigate(next: string) {
    setSection(next);
    setMessage("");
    setError("");
    setTrackingError("");
    setTrackedIssue(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function label(text: string, id: string) {
    return (
      <label
        htmlFor={id}
        style={{ fontWeight: 700, fontSize: 14 }}
      >
        {text}
      </label>
    );
  }

  function goButton(text: string, target: string) {
    return (
      <button
        type="button"
        style={styles.button}
        onClick={() => navigate(target)}
      >
        {text}
      </button>
    );
  }

  function statusMessages() {
    return (
      <>
        {message && (
          <div
            role="status"
            style={{
              ...styles.card,
              margin: "20px auto",
              color: "#17613e",
              background: "#e8f7ed",
              lineHeight: 1.8,
              overflowWrap: "anywhere",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              ...styles.card,
              margin: "20px auto",
              color: "#a11",
              background: "#fff0f0",
              lineHeight: 1.8,
            }}
          >
            {error}
          </div>
        )}
      </>
    );
  }

  async function requireLogin() {
    const { data, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    if (!data.session) {
      setError(
        "ఫారమ్‌ను సేవ్ చేయడానికి ముందుగా లాగిన్ కావాలి. లాగిన్ సదుపాయం పనిచేసిన తర్వాత మళ్లీ ప్రయత్నించండి."
      );
      return false;
    }

    return true;
  }

  async function submitSurvey(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!supabaseConfigured) {
      setError("డేటాబేస్ సెట్టింగ్స్ సరిగ్గా లేవు.");
      setLoading(false);
      return;
    }

    try {
      const loggedIn = await requireLogin();
      if (!loggedIn) return;

      const { error: dbError } = await supabase
        .from("survey")
        .insert([survey]);

      if (dbError) throw dbError;

      setMessage("సర్వే వివరాలు విజయవంతంగా సేవ్ అయ్యాయి.");
      setSurvey({ ...emptySurvey });
    } catch (err) {
      console.error("Survey submission error:", err);
      setError(
        "సర్వే సేవ్ కాలేదు. లాగిన్, డేటాబేస్ అనుమతులు తనిఖీ చేయాలి."
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitComplaint(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!supabaseConfigured) {
      setError("డేటాబేస్ సెట్టింగ్స్ సరిగ్గా లేవు.");
      setLoading(false);
      return;
    }

    try {
      const loggedIn = await requireLogin();
      if (!loggedIn) return;

      const { data, error: rpcError } = await supabase.rpc(
        "create_issue_case",
        {
          p_category: complaint.category,
          p_institution_name: complaint.institution_name.trim(),
          p_institution_type: null,
          p_mandal: complaint.mandal,
          p_village: null,
          p_description: complaint.description.trim(),
        }
      );

      if (rpcError) throw rpcError;

      const result = Array.isArray(data) ? data[0] : data;
      const caseCode =
        typeof result === "string"
          ? result
          : result?.case_code;

      if (!caseCode) {
        throw new Error(
          "The create_issue_case function did not return a case code."
        );
      }

      setMessage(
        `మీ ఫిర్యాదు విజయవంతంగా నమోదు అయింది. మీ ఫిర్యాదు ID: ${caseCode}. ఈ IDని భద్రపరచుకోండి.`
      );
      setComplaint({ ...emptyComplaint });
      setTrackingCode(caseCode);
    } catch (err) {
      console.error("Complaint submission error:", err);
      setError(
        "ఫిర్యాదు నమోదు కాలేదు. లాగిన్, create_issue_case ఫంక్షన్ మరియు డేటాబేస్ అనుమతులను తనిఖీ చేయాలి."
      );
    } finally {
      setLoading(false);
    }
  }

  async function trackIssue(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTrackingLoading(true);
    setTrackingError("");
    setTrackedIssue(null);

    if (!supabaseConfigured) {
      setTrackingError("డేటాబేస్ సెట్టింగ్స్ సరిగ్గా లేవు.");
      setTrackingLoading(false);
      return;
    }

    const code = trackingCode.trim().toUpperCase();

    if (!code) {
      setTrackingError("మీ ఫిర్యాదు ID నమోదు చేయండి.");
      setTrackingLoading(false);
      return;
    }

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "track_issue_case",
        { p_case_code: code }
      );

      if (rpcError) throw rpcError;

      const result = Array.isArray(data) ? data[0] : data;

      if (!result) {
        setTrackingError(
          "ఈ IDతో ఫిర్యాదు కనిపించలేదు. IDని సరిచూసి మళ్లీ ప్రయత్నించండి."
        );
        return;
      }

      setTrackedIssue(result as TrackedIssue);
    } catch (err) {
      console.error("Issue tracking error:", err);
      setTrackingError(
        "స్థితిని తెలుసుకోలేకపోయాం. track_issue_case ఫంక్షన్ అనుమతులను తనిఖీ చేయాలి."
      );
    } finally {
      setTrackingLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <header style={{ background: "#0d503e", color: "#fff" }}>
        <div
          style={{
            ...styles.container,
            padding: "20px 0 26px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 15,
                  display: "grid",
                  placeItems: "center",
                  background: "#d7f2df",
                  fontSize: 28,
                }}
              >
                📚
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "clamp(20px, 4vw, 28px)",
                  }}
                >
                  విద్యా సేవ – వనపర్తి
                </div>
                <div
                  style={{
                    color: "#c7e5d6",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  WANAPARTHY EDUCATION SUPPORT PORTAL
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 13, color: "#d6eee1" }}>
                విద్య • సమానత్వం • అభివృద్ధి
              </div>
              {authUser ? (
                <button type="button" onClick={logout} style={{ ...styles.secondaryButton, padding: "9px 12px" }}>
                  లాగౌట్
                </button>
              ) : (
                <button type="button" onClick={() => navigate("login")} style={{ ...styles.secondaryButton, padding: "9px 12px" }}>
                  లాగిన్
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav
        style={{
          background: "#fff",
          borderBottom: "1px solid #dce9e0",
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}
      >
        <div
          style={{
            ...styles.container,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            padding: "12px 0",
          }}
        >
          {[
            ["హోమ్", "home"],
            ["విద్యా సర్వే", "survey"],
            ["ఫిర్యాదు నమోదు", "complaint"],
            ["ఫిర్యాదు స్థితి", "track"],
            ["మా లక్ష్యం", "about"],
            [authUser ? "నా ఖాతా" : "లాగిన్", "login"],
          ].map(([text, target]) => (
            <button
              type="button"
              key={target}
              onClick={() => navigate(target)}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "11px 14px",
                background:
                  section === target ? "#dff2e5" : "transparent",
                color:
                  section === target ? "#0d503e" : "#435d51",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {text}
            </button>
          ))}
        </div>
      </nav>

      <div style={styles.container}>{statusMessages()}</div>

      {section === "home" && (
        <>
          <section
            style={{
              background:
                "linear-gradient(135deg,#e1f3e7 0%,#f5fbf6 58%,#d1ebdc 100%)",
              padding: "48px 0 42px",
            }}
          >
            <div
              style={{
                ...styles.container,
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(min(100%,320px),1fr))",
                gap: 30,
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "7px 12px",
                    background: "#fff",
                    color: "#126b50",
                    borderRadius: 99,
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 17,
                  }}
                >
                  వనపర్తి జిల్లా విద్యా సహాయ వేదిక
                </div>
                <h1
                  style={{
                    fontSize: "clamp(32px,5vw,54px)",
                    lineHeight: 1.18,
                    margin: "0 0 18px",
                    letterSpacing: "-1px",
                  }}
                >
                  ప్రతి విద్యార్థికి
                  <br />
                  <span style={{ color: "#13815b" }}>
                    మెరుగైన విద్య
                  </span>
                </h1>
                <p
                  style={{
                    fontSize: 17,
                    lineHeight: 1.9,
                    color: "#496459",
                    maxWidth: 590,
                  }}
                >
                  మన పాఠశాలలు, కళాశాలల్లోని అవసరాలను గుర్తిద్దాం.
                  విద్యార్థుల సమస్యలను నమోదు చేసి, మెరుగైన విద్యా
                  వాతావరణం కోసం కలిసి పనిచేద్దాం.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginTop: 24,
                  }}
                >
                  {goButton("సర్వే ప్రారంభించండి →", "survey")}
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => navigate("complaint")}
                  >
                    సమస్య తెలియజేయండి
                  </button>
                </div>
              </div>

              <div style={styles.card}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#13815b",
                  }}
                >
                  మన లక్ష్యం
                </div>
                <h2
                  style={{
                    fontSize: 25,
                    margin: "12px 0",
                    lineHeight: 1.5,
                  }}
                >
                  విద్యా సమస్యలను గుర్తించి, పరిష్కారానికి
                  సమాచారాన్ని సేకరించడం
                </h2>
                <p
                  style={{
                    color: "#63786e",
                    lineHeight: 1.8,
                    marginBottom: 20,
                  }}
                >
                  విద్యాసంస్థల మౌలిక సదుపాయాల వివరాలను నమోదు
                  చేయడానికి ఈ వేదిక ఉపయోగపడుతుంది.
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      background: "#eef8f0",
                      borderRadius: 13,
                      padding: 15,
                    }}
                  >
                    <div style={{ fontSize: 24 }}>🏫</div>
                    <div style={{ fontWeight: 700, marginTop: 7 }}>
                      విద్యాసంస్థలు
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#5c7667",
                        marginTop: 4,
                      }}
                    >
                      సౌకర్యాల నమోదు
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#eef8f0",
                      borderRadius: 13,
                      padding: 15,
                    }}
                  >
                    <div style={{ fontSize: 24 }}>🔎</div>
                    <div style={{ fontWeight: 700, marginTop: 7 }}>
                      ఫిర్యాదు ట్రాకింగ్
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#5c7667",
                        marginTop: 4,
                      }}
                    >
                      స్థితి తెలుసుకోండి
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            style={{
              ...styles.container,
              padding: "40px 0 50px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 25 }}>
              <div
                style={{
                  color: "#13815b",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                ప్రజలకు అందుబాటులో ఉన్న గణాంకాలు
              </div>
              <h2 style={{ fontSize: 30, margin: "8px 0" }}>
                విద్యా సమస్యల ప్రస్తుత పరిస్థితి
              </h2>
              <p style={{ color: "#64776c", lineHeight: 1.7 }}>
                వ్యక్తిగత ఫిర్యాదు వివరాలు కాకుండా మొత్తం సంఖ్యలు మాత్రమే
                ఇక్కడ చూపిస్తాం.
              </p>
            </div>

            {statsError && (
              <p role="status" style={{ color: "#946200" }}>
                {statsError}
              </p>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(min(100%,170px),1fr))",
                gap: 14,
              }}
            >
              {[
                ["మొత్తం సమస్యలు", stats.total_issues, "📋"],
                ["పరిష్కరించినవి", stats.resolved_issues, "✅"],
                ["పెండింగ్‌లో ఉన్నవి", stats.pending_issues, "⏳"],
                ["మొత్తం సర్వేలు", stats.total_surveys, "🏫"],
                ["మొత్తం ఫిర్యాదులు", stats.total_complaints, "📝"],
              ].map(([title, value, icon]) => (
                <div
                  key={String(title)}
                  style={{
                    ...styles.card,
                    textAlign: "center",
                    padding: 20,
                  }}
                >
                  <div style={{ fontSize: 27 }}>{icon}</div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#126b50",
                      margin: "10px 0",
                    }}
                  >
                    {statsLoading ? "—" : Number(value).toLocaleString("te-IN")}
                  </div>
                  <div style={{ color: "#52695d", fontWeight: 700 }}>
                    {title}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            style={{
              ...styles.container,
              paddingBottom: 45,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 25 }}>
              <div
                style={{
                  color: "#13815b",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                మా సేవలు
              </div>
              <h2 style={{ fontSize: 30, margin: "8px 0" }}>
                విద్య కోసం ఒకే వేదిక
              </h2>
              <p style={{ color: "#64776c", lineHeight: 1.7 }}>
                మీకు అవసరమైన సేవను ఎంచుకోండి.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(min(100%,235px),1fr))",
                gap: 17,
              }}
            >
              {services.map((service) => (
                <button
                  key={service.title}
                  type="button"
                  onClick={() => navigate(service.action)}
                  style={{
                    ...styles.card,
                    textAlign: "left",
                    cursor: "pointer",
                    color: "#17352c",
                    minHeight: 205,
                  }}
                >
                  <div
                    style={{
                      width: 53,
                      height: 53,
                      display: "grid",
                      placeItems: "center",
                      background: "#e6f5e9",
                      borderRadius: 15,
                      fontSize: 27,
                    }}
                  >
                    {service.icon}
                  </div>
                  <h3 style={{ margin: "17px 0 8px", fontSize: 19 }}>
                    {service.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      lineHeight: 1.8,
                      color: "#63786e",
                      fontSize: 14,
                    }}
                  >
                    {service.text}
                  </p>
                  <div
                    style={{
                      marginTop: 16,
                      color: "#13815b",
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    వివరాలు చూడండి →
                  </div>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {section === "survey" && (
        <section
          style={{
            ...styles.container,
            ...styles.card,
            marginTop: 28,
            marginBottom: 35,
          }}
        >
          <h1 style={{ fontSize: 30, marginTop: 0 }}>
            విద్యా సర్వే ఫారమ్
          </h1>
          <p style={{ color: "#61766a", lineHeight: 1.7 }}>
            సంస్థ వివరాలు మరియు అక్కడి విద్యా సౌకర్యాల పరిస్థితిని
            నమోదు చేయండి. {authUser ? "మీరు లాగిన్ అయ్యారు." : "సేవ్ చేయడానికి ముందుగా లాగిన్ కావాలి."}
          </p>

          <form onSubmit={submitSurvey}>
            {label("పాఠశాల / కళాశాల పేరు *", "survey-name")}
            <input
              id="survey-name"
              style={styles.field}
              required
              value={survey.institution_name}
              onChange={(e) =>
                setSurvey({ ...survey, institution_name: e.target.value })
              }
              placeholder="సంస్థ పేరు"
            />

            {label("సంస్థ రకం *", "survey-type")}
            <select
              id="survey-type"
              style={styles.field}
              required
              value={survey.institution_type}
              onChange={(e) =>
                setSurvey({ ...survey, institution_type: e.target.value })
              }
            >
              <option>ప్రభుత్వ పాఠశాల</option>
              <option>ప్రైవేట్ పాఠశాల</option>
              <option>ప్రభుత్వ జూనియర్ కళాశాల</option>
              <option>ప్రైవేట్ జూనియర్ కళాశాల</option>
              <option>ప్రభుత్వ డిగ్రీ కళాశాల</option>
              <option>ప్రైవేట్ డిగ్రీ కళాశాల</option>
              <option>హాస్టల్</option>
              <option>ఇతర విద్యాసంస్థ</option>
            </select>

            {label("మండలం *", "survey-mandal")}
            <select
              id="survey-mandal"
              style={styles.field}
              required
              value={survey.mandal}
              onChange={(e) =>
                setSurvey({ ...survey, mandal: e.target.value })
              }
            >
              <option value="">మండలం ఎంచుకోండి</option>
              {mandals.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="ఇతర">ఇతర</option>
            </select>

            {label("గ్రామం / పట్టణం", "survey-village")}
            <input
              id="survey-village"
              style={styles.field}
              value={survey.village}
              onChange={(e) =>
                setSurvey({ ...survey, village: e.target.value })
              }
              placeholder="గ్రామం లేదా పట్టణం"
            />

            {label("భవన పరిస్థితి", "survey-building")}
            <select
              id="survey-building"
              style={styles.field}
              value={survey.building_condition}
              onChange={(e) =>
                setSurvey({ ...survey, building_condition: e.target.value })
              }
            >
              <option value="">ఎంచుకోండి</option>
              <option>బాగుంది</option>
              <option>చిన్న మరమ్మతులు అవసరం</option>
              <option>పెద్ద మరమ్మతులు అవసరం</option>
              <option>కొత్త భవనం అవసరం</option>
            </select>

            {label("తాగునీటి సౌకర్యం", "survey-water")}
            <select
              id="survey-water"
              style={styles.field}
              value={survey.drinking_water}
              onChange={(e) =>
                setSurvey({ ...survey, drinking_water: e.target.value })
              }
            >
              <option value="">ఎంచుకోండి</option>
              <option>అందుబాటులో ఉంది</option>
              <option>పరిమితంగా ఉంది</option>
              <option>అందుబాటులో లేదు</option>
            </select>

            {label("మరుగుదొడ్ల పరిస్థితి", "survey-toilets")}
            <select
              id="survey-toilets"
              style={styles.field}
              value={survey.toilets_condition}
              onChange={(e) =>
                setSurvey({ ...survey, toilets_condition: e.target.value })
              }
            >
              <option value="">ఎంచుకోండి</option>
              <option>బాగుంది</option>
              <option>శుభ్రత సరిగా లేదు</option>
              <option>మరమ్మతులు అవసరం</option>
              <option>మరుగుదొడ్లు లేవు</option>
            </select>

            {label("ఉపాధ్యాయుల కొరత", "survey-teachers")}
            <select
              id="survey-teachers"
              style={styles.field}
              value={survey.teacher_shortage}
              onChange={(e) =>
                setSurvey({ ...survey, teacher_shortage: e.target.value })
              }
            >
              <option value="">ఎంచుకోండి</option>
              <option>కొరత ఉంది</option>
              <option>కొరత లేదు</option>
              <option>తెలియదు</option>
            </select>

            {label("ఇతర సమస్యల వివరాలు", "survey-issues")}
            <textarea
              id="survey-issues"
              style={{ ...styles.field, minHeight: 120, resize: "vertical" }}
              value={survey.issue_summary}
              onChange={(e) =>
                setSurvey({ ...survey, issue_summary: e.target.value })
              }
              placeholder="సమస్యలను వివరించండి"
            />

            {!authUser && (
              <p style={{ color: "#946200", lineHeight: 1.8 }}>
                సర్వే సేవ్ చేయడానికి <button type="button" onClick={() => navigate("login")} style={{ ...styles.secondaryButton, padding: "6px 10px" }}>ముందుగా లాగిన్ చేయండి</button>
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button
                style={styles.button}
                type="submit"
                disabled={loading}
              >
                {loading ? "సేవ్ అవుతోంది..." : "సర్వే వివరాలు సేవ్ చేయండి"}
              </button>
              <button
                style={styles.secondaryButton}
                type="button"
                onClick={() => navigate("home")}
              >
                హోమ్‌కు తిరిగి వెళ్లండి
              </button>
            </div>
          </form>
        </section>
      )}

      {section === "complaint" && (
        <section
          style={{
            ...styles.container,
            ...styles.card,
            marginTop: 28,
            marginBottom: 35,
          }}
        >
          <h1 style={{ fontSize: 30, marginTop: 0 }}>
            విద్యార్థుల సమస్యలు / ఫిర్యాదులు
          </h1>
          <p style={{ color: "#61766a", lineHeight: 1.7 }}>
            ఫిర్యాదులో వ్యక్తిగత లేదా సున్నితమైన వివరాలు చేర్చవద్దు.
            {authUser ? " మీరు లాగిన్ అయ్యారు; ఇప్పుడు ఫిర్యాదు నమోదు చేయవచ్చు." : " ఫిర్యాదు నమోదు చేయడానికి ముందుగా లాగిన్ కావాలి."}
          </p>

          {!authUser && (
            <p style={{ color: "#946200", lineHeight: 1.8 }}>
              ఫిర్యాదు సేవ్ చేయడానికి <button type="button" onClick={() => navigate("login")} style={{ ...styles.secondaryButton, padding: "6px 10px" }}>ముందుగా లాగిన్ చేయండి</button>
            </p>
          )}
          <form onSubmit={submitComplaint}>
            {label("సమస్య రకం *", "complaint-category")}
            <select
              id="complaint-category"
              style={styles.field}
              required
              value={complaint.category}
              onChange={(e) =>
                setComplaint({ ...complaint, category: e.target.value })
              }
            >
              <option>భవన సమస్య</option>
              <option>తాగునీటి సమస్య</option>
              <option>మరుగుదొడ్ల సమస్య</option>
              <option>ఉపాధ్యాయుల కొరత</option>
              <option>ఫీజుల సమస్య</option>
              <option>స్కాలర్‌షిప్ సమస్య</option>
              <option>బస్సు / రవాణా సమస్య</option>
              <option>హాస్టల్ సమస్య</option>
              <option>ఇతర సమస్య</option>
            </select>

            {label("మండలం *", "complaint-mandal")}
            <select
              id="complaint-mandal"
              style={styles.field}
              required
              value={complaint.mandal}
              onChange={(e) =>
                setComplaint({ ...complaint, mandal: e.target.value })
              }
            >
              <option value="">మండలం ఎంచుకోండి</option>
              {mandals.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="ఇతర">ఇతర</option>
            </select>

            {label("పాఠశాల / కళాశాల పేరు *", "complaint-institution")}
            <input
              id="complaint-institution"
              style={styles.field}
              required
              value={complaint.institution_name}
              onChange={(e) =>
                setComplaint({
                  ...complaint,
                  institution_name: e.target.value,
                })
              }
              placeholder="సంస్థ పేరు"
            />

            {label("సమస్య పూర్తి వివరాలు *", "complaint-description")}
            <textarea
              id="complaint-description"
              style={{ ...styles.field, minHeight: 145, resize: "vertical" }}
              required
              value={complaint.description}
              onChange={(e) =>
                setComplaint({ ...complaint, description: e.target.value })
              }
              placeholder="సమస్య ఏమిటి? ఎక్కడ ఎదురవుతోంది?"
            />

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button
                style={styles.button}
                type="submit"
                disabled={loading}
              >
                {loading ? "నమోదవుతోంది..." : "ఫిర్యాదు నమోదు చేయండి"}
              </button>
              <button
                style={styles.secondaryButton}
                type="button"
                onClick={() => navigate("track")}
              >
                ఫిర్యాదు స్థితి చూడండి
              </button>
            </div>
          </form>
        </section>
      )}

      {section === "track" && (
        <section
          style={{
            ...styles.container,
            ...styles.card,
            marginTop: 28,
            marginBottom: 35,
          }}
        >
          <h1 style={{ fontSize: 30, marginTop: 0 }}>
            ఫిర్యాదు స్థితిని తెలుసుకోండి
          </h1>
          <p style={{ color: "#61766a", lineHeight: 1.8 }}>
            ఫిర్యాదు నమోదు చేసినప్పుడు వచ్చిన ప్రత్యేక IDని నమోదు చేయండి.
            ఇక్కడ ఫిర్యాదు స్థితి మాత్రమే చూపబడుతుంది.
          </p>

          <form onSubmit={trackIssue}>
            {label("ఫిర్యాదు ID *", "tracking-code")}
            <input
              id="tracking-code"
              style={styles.field}
              required
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="ఉదా: VSE-BLD-2026-000001"
            />
            <button
              style={styles.button}
              type="submit"
              disabled={trackingLoading}
            >
              {trackingLoading ? "వెతుకుతోంది..." : "స్థితి తెలుసుకోండి"}
            </button>
          </form>

          {trackingError && (
            <div
              role="alert"
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 12,
                background: "#fff0f0",
                color: "#a11",
                lineHeight: 1.8,
              }}
            >
              {trackingError}
            </div>
          )}

          {trackedIssue && (
            <div
              style={{
                ...styles.card,
                marginTop: 22,
                background: "#f1faf3",
                boxShadow: "none",
              }}
            >
              <div style={{ color: "#52695d", fontSize: 14 }}>
                మీ ఫిర్యాదు ID
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#126b50",
                  margin: "6px 0 18px",
                  overflowWrap: "anywhere",
                }}
              >
                {trackedIssue.case_code}
              </div>

              <div style={{ marginBottom: 12 }}>
                <strong>సమస్య రకం:</strong> {trackedIssue.category}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>మండలం:</strong> {trackedIssue.mandal}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>ప్రస్తుత స్థితి:</strong>{" "}
                <span
                  style={{
                    display: "inline-block",
                    padding: "5px 10px",
                    borderRadius: 8,
                    background: "#dff2e5",
                    color: "#0d503e",
                    fontWeight: 800,
                  }}
                >
                  {trackedIssue.status}
                </span>
              </div>
              <div style={{ color: "#52695d", fontSize: 14 }}>
                <strong>నమోదు చేసిన తేదీ:</strong>{" "}
                {new Date(trackedIssue.created_at).toLocaleDateString("te-IN")}
              </div>
              <div style={{ color: "#52695d", fontSize: 14, marginTop: 8 }}>
                <strong>చివరిగా నవీకరించిన తేదీ:</strong>{" "}
                {new Date(trackedIssue.updated_at).toLocaleDateString("te-IN")}
              </div>
            </div>
          )}

          <p
            style={{
              color: "#63786e",
              fontSize: 13,
              lineHeight: 1.8,
              marginTop: 20,
            }}
          >
            గమనిక: స్థితి చూపించడానికి Supabaseలో track_issue_case ఫంక్షన్
            సరిగ్గా అమలై ఉండాలి.
          </p>
        </section>
      )}

      {section === "login" && (
        <section
          style={{
            ...styles.container,
            ...styles.card,
            marginTop: 28,
            marginBottom: 35,
            maxWidth: 620,
          }}
        >
          <h1 style={{ fontSize: 30, marginTop: 0 }}>లాగిన్</h1>
          {authLoading ? (
            <p>లాగిన్ స్థితిని తనిఖీ చేస్తున్నాం...</p>
          ) : authUser ? (
            <div style={{ lineHeight: 1.9 }}>
              <p style={{ color: "#17613e" }}>మీరు ఇప్పటికే లాగిన్ అయ్యారు.</p>
              <p><strong>ఇమెయిల్:</strong> {authUser.email}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <button type="button" style={styles.button} onClick={() => navigate("survey")}>విద్యా సర్వేకు వెళ్లండి</button>
                <button type="button" style={styles.secondaryButton} onClick={() => navigate("complaint")}>ఫిర్యాదు నమోదు</button>
                <button type="button" style={styles.secondaryButton} onClick={logout}>లాగౌట్</button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ color: "#61766a", lineHeight: 1.8 }}>
                Supabaseలో ముందుగా సృష్టించిన ధృవీకరించిన ఇమెయిల్, పాస్‌వర్డ్ ఉపయోగించండి.
              </p>
              <form onSubmit={submitLogin}>
                {label("ఇమెయిల్ *", "login-email")}
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  style={styles.field}
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="మీ ఇమెయిల్"
                />
                {label("పాస్‌వర్డ్ *", "login-password")}
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  style={styles.field}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="మీ పాస్‌వర్డ్"
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <button type="submit" style={styles.button} disabled={loginLoading}>
                    {loginLoading ? "లాగిన్ అవుతోంది..." : "లాగిన్ చేయండి"}
                  </button>
                  <button type="button" style={styles.secondaryButton} onClick={() => navigate("home")}>హోమ్‌కు తిరిగి వెళ్లండి</button>
                </div>
              </form>
            </>
          )}
        </section>
      )}

      {section === "about" && (
        <section
          style={{
            ...styles.container,
            ...styles.card,
            marginTop: 28,
            marginBottom: 35,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#13815b",
              fontWeight: 800,
            }}
          >
            మా గురించి
          </div>
          <h1 style={{ fontSize: 32 }}>మా లక్ష్యం</h1>
          <p
            style={{
              color: "#52695d",
              fontSize: 17,
              lineHeight: 2,
            }}
          >
            వనపర్తి జిల్లాలో విద్యా సౌకర్యాల పరిస్థితిని తెలుసుకోవడం,
            విద్యార్థుల సమస్యలను బాధ్యతాయుతంగా నమోదు చేయడం, పరిష్కారానికి
            అవసరమైన సమాచారాన్ని సేకరించడం మా లక్ష్యం.
          </p>
          <h2>మా ముఖ్య లక్ష్యాలు</h2>
          <ul style={{ lineHeight: 2, color: "#52695d" }}>
            <li>
              పాఠశాలలు, కళాశాలలు, హాస్టళ్లలో సౌకర్యాల వివరాల సేకరణ
            </li>
            <li>విద్యార్థుల సమస్యలను నమోదు చేయడానికి వేదిక కల్పించడం</li>
            <li>
              విద్యా వాతావరణాన్ని మెరుగుపరచడానికి ఉపయోగపడే సమాచారాన్ని
              సేకరించడం
            </li>
            <li>సమస్యలను బాధ్యతాయుతంగా, గౌరవప్రదంగా తెలియజేయడం</li>
            <li>ఫిర్యాదుల స్థితిని ID ద్వారా తెలుసుకునే అవకాశం</li>
          </ul>
          {goButton("హోమ్‌కు తిరిగి వెళ్లండి", "home")}
        </section>
      )}

      <footer
        style={{
          marginTop: 20,
          background: "#0d503e",
          color: "#d8ece1",
          padding: "28px 0",
        }}
      >
        <div
          style={{
            ...styles.container,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 19,
              color: "#fff",
            }}
          >
            విద్యా సేవ – వనపర్తి
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.8 }}>
            విద్యార్థుల అభివృద్ధి కోసం • మెరుగైన విద్యా వాతావరణం కోసం
          </p>
          <div style={{ fontSize: 12, color: "#b9d9c8" }}>
            © {new Date().getFullYear()} విద్యా సేవ – వనపర్తి
          </div>
        </div>
      </footer>
    </main>
  );
}
