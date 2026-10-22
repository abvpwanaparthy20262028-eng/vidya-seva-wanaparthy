"use client";

import { useState } from "react";
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

export default function Home() {
  const [section, setSection] = useState("home");
  const [survey, setSurvey] = useState<SurveyForm>(emptySurvey);
  const [complaint, setComplaint] =
    useState<ComplaintForm>(emptyComplaint);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function navigate(next: string) {
    setSection(next);
    setMessage("");
    setError("");
  }

  async function submitSurvey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!supabaseConfigured) {
      setError("డేటాబేస్ సెట్టింగ్స్ సరిగ్గా లేవు. నిర్వాహకులను సంప్రదించండి.");
      setLoading(false);
      return;
    }

    try {
      const { error: dbError } = await supabase
        .from("survey")
        .insert([survey]);

      if (dbError) throw dbError;

      setMessage("సర్వే వివరాలు విజయవంతంగా సేవ్ అయ్యాయి.");
      setSurvey(emptySurvey);
    } catch (err) {
      console.error("Survey submission error:", err);
      setError(
        "సర్వే సేవ్ కాలేదు. టేబుల్ పేరు, కాలమ్‌లు, RLS పాలసీలను తనిఖీ చేయండి."
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitComplaint(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!supabaseConfigured) {
      setError("డేటాబేస్ సెట్టింగ్స్ సరిగ్గా లేవు. నిర్వాహకులను సంప్రదించండి.");
      setLoading(false);
      return;
    }

    try {
      const { error: dbError } = await supabase
        .from("complaints")
        .insert([{ ...complaint, status: "కొత్త ఫిర్యాదు" }]);

      if (dbError) throw dbError;

      setMessage("మీ ఫిర్యాదు సేవ్ అయింది. ధన్యవాదాలు.");
      setComplaint(emptyComplaint);
    } catch (err) {
      console.error("Complaint submission error:", err);
      setError(
        "ఫిర్యాదు సేవ్ కాలేదు. టేబుల్ కాలమ్‌లు, RLS పాలసీలను తనిఖీ చేయండి."
      );
    } finally {
      setLoading(false);
    }
  }

  const card: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 4px 18px rgba(0,0,0,0.07)",
    margin: "20px auto",
    maxWidth: 850,
  };

  const field: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: 12,
    marginTop: 7,
    marginBottom: 16,
    border: "1px solid #cbd5d1",
    borderRadius: 8,
    boxSizing: "border-box",
    fontSize: 16,
    background: "#fff",
    color: "#172b36",
  };

  const button: React.CSSProperties = {
    border: 0,
    borderRadius: 9,
    padding: "12px 17px",
    background: "#116b57",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
    margin: 4,
  };

  function inputLabel(label: string, name: string) {
    return <label htmlFor={name} style={{ fontWeight: 600 }}>{label}</label>;
  }

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f2f7f5",
        minHeight: "100vh",
        color: "#172b36",
        paddingBottom: 30,
      }}
    >
      <header
        style={{
          background: "#116b57",
          color: "white",
          textAlign: "center",
          padding: "32px 16px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "clamp(26px, 5vw, 42px)" }}>
          విద్యా సేవ – వనపర్తి
        </h1>
        <p style={{ fontSize: 18 }}>
          విద్యార్థుల సమస్యలు • విద్యా సర్వే • విద్యా హక్కులు
        </p>
      </header>

      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 8,
          padding: 16,
        }}
      >
        <button style={button} onClick={() => navigate("home")}>హోమ్</button>
        <button style={button} onClick={() => navigate("survey")}>విద్యా సర్వే</button>
        <button style={button} onClick={() => navigate("complaint")}>
          సమస్య తెలియజేయండి
        </button>
        <button style={button} onClick={() => navigate("about")}>మా లక్ష్యం</button>
      </nav>

      {message && (
        <div role="status" style={{ ...card, background: "#e3f7e9", color: "#14532d" }}>
          {message}
        </div>
      )}
      {error && (
        <div role="alert" style={{ ...card, background: "#fff0f0", color: "#a11" }}>
          {error}
        </div>
      )}

      {section === "home" && (
        <section style={card}>
          <h2>విద్యార్థుల గొంతుక – మన బాధ్యత</h2>
          <p>
            వనపర్తి జిల్లాలోని పాఠశాలలు, కళాశాలల సమస్యలను నమోదు చేసి,
            విద్యార్థుల అవసరాలను గుర్తించడానికి ఈ వేదిక ఉపయోగపడుతుంది.
          </p>
          <h3>ముఖ్యమైన సేవలు</h3>
          <ul>
            <li>పాఠశాలలు మరియు కళాశాలల విద్యా సర్వే</li>
            <li>విద్యార్థుల సమస్యలు, ఫిర్యాదుల నమోదు</li>
            <li>భవనాలు, తాగునీరు, మరుగుదొడ్ల వివరాలు</li>
            <li>విద్యా సమస్యలపై సమాచారం సేకరణ</li>
          </ul>
          <button style={button} onClick={() => navigate("survey")}>
            సర్వే ప్రారంభించండి
          </button>
          <button style={button} onClick={() => navigate("complaint")}>
            ఫిర్యాదు నమోదు చేయండి
          </button>
        </section>
      )}

      {section === "survey" && (
        <section style={card}>
          <h2>విద్యా సర్వే ఫారమ్</h2>
          <p>సంస్థ వివరాలు మరియు అక్కడి సమస్యలను నమోదు చేయండి.</p>

          <form onSubmit={submitSurvey}>
            {inputLabel("పాఠశాల / కళాశాల పేరు *", "survey-name")}
            <input
              id="survey-name"
              style={field}
              required
              value={survey.institution_name}
              onChange={(e) =>
                setSurvey({ ...survey, institution_name: e.target.value })
              }
              placeholder="సంస్థ పేరు"
            />

            {inputLabel("సంస్థ రకం *", "survey-type")}
            <select
              id="survey-type"
              style={field}
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

            {inputLabel("మండలం *", "survey-mandal")}
            <select
              id="survey-mandal"
              style={field}
              required
              value={survey.mandal}
              onChange={(e) => setSurvey({ ...survey, mandal: e.target.value })}
            >
              <option value="">మండలం ఎంచుకోండి</option>
              {mandals.map((m) => <option key={m} value={m}>{m}</option>)}
              <option value="ఇతర">ఇతర</option>
            </select>

            {inputLabel("గ్రామం / పట్టణం", "survey-village")}
            <input
              id="survey-village"
              style={field}
              value={survey.village}
              onChange={(e) => setSurvey({ ...survey, village: e.target.value })}
              placeholder="గ్రామం లేదా పట్టణం"
            />

            {inputLabel("భవన పరిస్థితి", "survey-building")}
            <select
              id="survey-building"
              style={field}
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

            {inputLabel("తాగునీటి సౌకర్యం", "survey-water")}
            <select
              id="survey-water"
              style={field}
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

            {inputLabel("మరుగుదొడ్ల పరిస్థితి", "survey-toilets")}
            <select
              id="survey-toilets"
              style={field}
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

            {inputLabel("ఉపాధ్యాయుల కొరత", "survey-teachers")}
            <select
              id="survey-teachers"
              style={field}
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

            {inputLabel("ఇతర సమస్యల వివరాలు", "survey-issues")}
            <textarea
              id="survey-issues"
              style={{ ...field, minHeight: 110 }}
              value={survey.issue_summary}
              onChange={(e) =>
                setSurvey({ ...survey, issue_summary: e.target.value })
              }
              placeholder="సమస్యలను వివరించండి"
            />

            <button style={button} type="submit" disabled={loading}>
              {loading ? "సేవ్ అవుతోంది..." : "సర్వే వివరాలు సేవ్ చేయండి"}
            </button>
          </form>
        </section>
      )}

      {section === "complaint" && (
        <section style={card}>
          <h2>విద్యార్థుల సమస్యలు / ఫిర్యాదులు</h2>
          <p>మీ ఫిర్యాదులో వ్యక్తిగత లేదా సున్నితమైన వివరాలు చేర్చవద్దు.</p>

          <form onSubmit={submitComplaint}>
            {inputLabel("సమస్య రకం *", "complaint-category")}
            <select
              id="complaint-category"
              style={field}
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

            {inputLabel("మండలం *", "complaint-mandal")}
            <select
              id="complaint-mandal"
              style={field}
              required
              value={complaint.mandal}
              onChange={(e) => setComplaint({ ...complaint, mandal: e.target.value })}
            >
              <option value="">మండలం ఎంచుకోండి</option>
              {mandals.map((m) => <option key={m} value={m}>{m}</option>)}
              <option value="ఇతర">ఇతర</option>
            </select>

            {inputLabel("పాఠశాల / కళాశాల పేరు *", "complaint-institution")}
            <input
              id="complaint-institution"
              style={field}
              required
              value={complaint.institution_name}
              onChange={(e) =>
                setComplaint({ ...complaint, institution_name: e.target.value })
              }
              placeholder="సంస్థ పేరు"
            />

            {inputLabel("సమస్య పూర్తి వివరాలు *", "complaint-description")}
            <textarea
              id="complaint-description"
              style={{ ...field, minHeight: 140 }}
              required
              value={complaint.description}
              onChange={(e) =>
                setComplaint({ ...complaint, description: e.target.value })
              }
              placeholder="సమస్య ఏమిటి? ఎక్కడ ఎదురవుతోంది?"
            />

            <button style={button} type="submit" disabled={loading}>
              {loading ? "సేవ్ అవుతోంది..." : "ఫిర్యాదు నమోదు చేయండి"}
            </button>
          </form>
        </section>
      )}

      {section === "about" && (
        <section style={card}>
          <h2>మా లక్ష్యం</h2>
          <p>
            వనపర్తి జిల్లాలో విద్యా సౌకర్యాల పరిస్థితిని తెలుసుకోవడం,
            విద్యార్థుల సమస్యలను బాధ్యతాయుతంగా నమోదు చేయడం,
            పరిష్కారానికి అవసరమైన సమాచారాన్ని సేకరించడం మా లక్ష్యం.
          </p>
        </section>
      )}

      <footer style={{ textAlign: "center", padding: 20, color: "#61717b" }}>
        విద్యా సేవ – వనపర్తి | విద్యార్థుల అభివృద్ధి కోసం
      </footer>
    </main>
  );
}
