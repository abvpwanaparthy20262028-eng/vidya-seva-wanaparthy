
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

const services = [
  { icon: "🏫", title: "విద్యా సర్వే", text: "పాఠశాలలు, కళాశాలలు, హాస్టళ్లలో విద్యా సౌకర్యాల వివరాలను నమోదు చేయండి.", action: "survey" },
  { icon: "📝", title: "సమస్య తెలియజేయండి", text: "మీ విద్యాసంస్థలోని సమస్యను బాధ్యతాయుతంగా నమోదు చేయండి.", action: "complaint" },
  { icon: "💧", title: "మౌలిక సదుపాయాలు", text: "తాగునీరు, మరుగుదొడ్లు, భవనాలు, ఇతర సౌకర్యాల వివరాలు.", action: "survey" },
  { icon: "🎓", title: "విద్యార్థుల హక్కులు", text: "విద్యార్థుల అవసరాలను గుర్తించి మెరుగైన విద్య కోసం సమాచారాన్ని సేకరించడం.", action: "about" },
];

export default function Home() {
  const [section, setSection] = useState("home");
  const [survey, setSurvey] = useState<SurveyForm>(emptySurvey);
  const [complaint, setComplaint] = useState<ComplaintForm>(emptyComplaint);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function navigate(next: string) {
    setSection(next);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      const { error: dbError } = await supabase.from("survey").insert([survey]);
      if (dbError) throw dbError;

      setMessage("సర్వే వివరాలు విజయవంతంగా సేవ్ అయ్యాయి.");
      setSurvey(emptySurvey);
    } catch (err) {
      console.error("Survey submission error:", err);
      setError("సర్వే సేవ్ కాలేదు. డేటాబేస్ కనెక్షన్ లేదా అనుమతులను తనిఖీ చేయాలి.");
    } finally {
      setLoading(false);
    }
  }

  async function submitComplaint(e: React.FormEvent<HTMLFormElement>) {
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
      setError("ఫిర్యాదు సేవ్ కాలేదు. డేటాబేస్ కనెక్షన్ లేదా అనుమతులను తనిఖీ చేయాలి.");
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f4f8f5",
      color: "#17352c",
      fontFamily: "Arial, sans-serif",
      paddingBottom: 0,
    } as React.CSSProperties,
    container: {
      width: "min(1120px, 92%)",
      margin: "0 auto",
    } as React.CSSProperties,
    button: {
      background: "#126b50",
      color: "#fff",
      border: "none",
      borderRadius: 12,
      padding: "13px 20px",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
    } as React.CSSProperties,
    secondaryButton: {
      background: "#fff",
      color: "#126b50",
      border: "1px solid #c9e1d4",
      borderRadius: 12,
      padding: "13px 20px",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
    } as React.CSSProperties,
    card: {
      background: "#fff",
      border: "1px solid #e1ece5",
      borderRadius: 20,
      padding: 24,
      boxShadow: "0 8px 28px rgba(20,70,48,0.06)",
    } as React.CSSProperties,
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
    } as React.CSSProperties,
  };

  function label(text: string, id: string) {
    return <label htmlFor={id} style={{ fontWeight: 700, fontSize: 14 }}>{text}</label>;
  }

  function goButton(text: string, target: string) {
    return <button type="button" style={styles.button} onClick={() => navigate(target)}>{text}</button>;
  }

  function statusMessages() {
    return (
      <>
        {message && <div role="status" style={{ ...styles.card, margin: "20px auto", color: "#17613e", background: "#e8f7ed" }}>{message}</div>}
        {error && <div role="alert" style={{ ...styles.card, margin: "20px auto", color: "#a11", background: "#fff0f0" }}>{error}</div>}
      </>
    );
  }

  return (
    <main style={styles.page}>
      <header style={{ background: "#0d503e", color: "#fff" }}>
        <div style={{ ...styles.container, padding: "20px 0 26px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 15, display: "grid", placeItems: "center", background: "#d7f2df", fontSize: 27 }}>📚</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 23 }}>విద్యా సేవ – వనపర్తి</div>
                <div style={{ color: "#c7e5d6", fontSize: 12, marginTop: 4 }}>WANAPARTHY EDUCATION SUPPORT PORTAL</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#d6eee1" }}>విద్య • సమానత్వం • అభివృద్ధి</div>
          </div>
        </div>
      </header>

      <nav style={{ background: "#fff", borderBottom: "1px solid #dce9e0", position: "sticky", top: 0, zIndex: 5 }}>
        <div style={{ ...styles.container, display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 0" }}>
          {[
            ["హోమ్", "home"],
            ["విద్యా సర్వే", "survey"],
            ["ఫిర్యాదు నమోదు", "complaint"],
            ["మా లక్ష్యం", "about"],
          ].map(([text, target]) => (
            <button
              type="button"
              key={target}
              onClick={() => navigate(target)}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "10px 15px",
                background: section === target ? "#dff2e5" : "transparent",
                color: section === target ? "#0d503e" : "#435d51",
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
          <section style={{ background: "linear-gradient(135deg,#e1f3e7 0%,#f5fbf6 58%,#d1ebdc 100%)", padding: "48px 0 42px" }}>
            <div style={{ ...styles.container, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 30, alignItems: "center" }}>
              <div>
                <div style={{ display: "inline-block", padding: "7px 12px", background: "#fff", color: "#126b50", borderRadius: 99, fontSize: 13, fontWeight: 700, marginBottom: 17 }}>
                  వనపర్తి జిల్లా విద్యా సహాయ వేదిక
                </div>
                <h1 style={{ fontSize: "clamp(32px,5vw,54px)", lineHeight: 1.18, margin: "0 0 18px", letterSpacing: "-1px" }}>
                  ప్రతి విద్యార్థికి<br /><span style={{ color: "#13815b" }}>మెరుగైన విద్య</span>
                </h1>
                <p style={{ fontSize: 17, lineHeight: 1.9, color: "#496459", maxWidth: 590 }}>
                  మన పాఠశాలలు, కళాశాలల్లోని అవసరాలను గుర్తిద్దాం. విద్యార్థుల సమస్యలను నమోదు చేసి, మెరుగైన విద్యా వాతావరణం కోసం కలిసి పనిచేద్దాం.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
                  {goButton("సర్వే ప్రారంభించండి →", "survey")}
                  <button type="button" style={styles.secondaryButton} onClick={() => navigate("complaint")}>సమస్య తెలియజేయండి</button>
                </div>
              </div>
              <div style={{ ...styles.card, background: "#fff", padding: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#13815b" }}>మన లక్ష్యం</div>
                <h2 style={{ fontSize: 25, margin: "12px 0", lineHeight: 1.4 }}>విద్యా సమస్యలను గుర్తించి, పరిష్కారానికి సమాచారాన్ని సేకరించడం</h2>
                <p style={{ color: "#63786e", lineHeight: 1.8, marginBottom: 20 }}>
                  పాఠశాలలు, కళాశాలలు, హాస్టళ్ల మౌలిక సదుపాయాల వివరాలను నమోదు చేయడానికి ఈ వేదిక ఉపయోగపడుతుంది.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "#eef8f0", borderRadius: 13, padding: 15 }}>
                    <div style={{ fontSize: 24 }}>🏫</div>
                    <div style={{ fontWeight: 700, marginTop: 7 }}>విద్యాసంస్థలు</div>
                    <div style={{ fontSize: 12, color: "#5c7667", marginTop: 4 }}>సౌకర్యాల నమోదు</div>
                  </div>
                  <div style={{ background: "#eef8f0", borderRadius: 13, padding: 15 }}>
                    <div style={{ fontSize: 24 }}>🤝</div>
                    <div style={{ fontWeight: 700, marginTop: 7 }}>విద్యార్థుల సహాయం</div>
                    <div style={{ fontSize: 12, color: "#5c7667", marginTop: 4 }}>సమస్యల నమోదు</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section style={{ ...styles.container, padding: "40px 0 50px" }}>
            <div style={{ textAlign: "center", marginBottom: 25 }}>
              <div style={{ color: "#13815b", fontSize: 13, fontWeight: 800 }}>మా సేవలు</div>
              <h2 style={{ fontSize: 30, margin: "8px 0" }}>విద్య కోసం ఒకే వేదిక</h2>
              <p style={{ color: "#64776c", lineHeight: 1.7 }}>మీకు అవసరమైన సేవను ఎంచుకోండి.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,235px),1fr))", gap: 17 }}>
              {services.map((service) => (
                <button
                  key={service.title}
                  type="button"
                  onClick={() => navigate(service.action)}
                  style={{ ...styles.card, textAlign: "left", cursor: "pointer", color: "#17352c", transition: "transform 0.2s", minHeight: 205 }}
                >
                  <div style={{ width: 53, height: 53, display: "grid", placeItems: "center", background: "#e6f5e9", borderRadius: 15, fontSize: 27 }}>{service.icon}</div>
                  <h3 style={{ margin: "17px 0 8px", fontSize: 19 }}>{service.title}</h3>
                  <p style={{ margin: 0, lineHeight: 1.8, color: "#63786e", fontSize: 14 }}>{service.text}</p>
                  <div style={{ marginTop: 16, color: "#13815b", fontWeight: 800, fontSize: 13 }}>వివరాలు చూడండి →</div>
                </button>
              ))}
            </div>
          </section>

          <section style={{ background: "#e7f3e9", padding: "30px 0" }}>
            <div style={{ ...styles.container, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
              <div>
                <h2 style={{ margin: "0 0 8px", fontSize: 24 }}>మీ విద్యాసంస్థలో సమస్య ఉందా?</h2>
                <p style={{ margin: 0, color: "#536c5e", lineHeight: 1.7 }}>వివరాలను నమోదు చేసి విద్యా సౌకర్యాలపై సమాచారం అందించండి.</p>
              </div>
              {goButton("ఫిర్యాదు నమోదు చేయండి →", "complaint")}
            </div>
          </section>
        </>
      )}

      {section === "survey" && (
        <section style={{ ...styles.container, ...styles.card, marginTop: 28, marginBottom: 35 }}>
          <h1 style={{ fontSize: 30, marginTop: 0 }}>విద్యా సర్వే ఫారమ్</h1>
          <p style={{ color: "#61766a", lineHeight: 1.7 }}>సంస్థ వివరాలు మరియు అక్కడి విద్యా సౌకర్యాల పరిస్థితిని నమోదు చేయండి.</p>
          <form onSubmit={submitSurvey}>
            {label("పాఠశాల / కళాశాల పేరు *", "survey-name")}
            <input id="survey-name" style={styles.field} required value={survey.institution_name} onChange={(e) => setSurvey({ ...survey, institution_name: e.target.value })} placeholder="సంస్థ పేరు" />

            {label("సంస్థ రకం *", "survey-type")}
            <select id="survey-type" style={styles.field} required value={survey.institution_type} onChange={(e) => setSurvey({ ...survey, institution_type: e.target.value })}>
              <option>ప్రభుత్వ పాఠశాల</option><option>ప్రైవేట్ పాఠశాల</option><option>ప్రభుత్వ జూనియర్ కళాశాల</option><option>ప్రైవేట్ జూనియర్ కళాశాల</option><option>ప్రభుత్వ డిగ్రీ కళాశాల</option><option>ప్రైవేట్ డిగ్రీ కళాశాల</option><option>హాస్టల్</option><option>ఇతర విద్యాసంస్థ</option>
            </select>

            {label("మండలం *", "survey-mandal")}
            <select id="survey-mandal" style={styles.field} required value={survey.mandal} onChange={(e) => setSurvey({ ...survey, mandal: e.target.value })}>
              <option value="">మండలం ఎంచుకోండి</option>{mandals.map((m) => <option key={m} value={m}>{m}</option>)}<option value="ఇతర">ఇతర</option>
            </select>

            {label("గ్రామం / పట్టణం", "survey-village")}
            <input id="survey-village" style={styles.field} value={survey.village} onChange={(e) => setSurvey({ ...survey, village: e.target.value })} placeholder="గ్రామం లేదా పట్టణం" />

            {label("భవన పరిస్థితి", "survey-building")}
            <select id="survey-building" style={styles.field} value={survey.building_condition} onChange={(e) => setSurvey({ ...survey, building_condition: e.target.value })}>
              <option value="">ఎంచుకోండి</option><option>బాగుంది</option><option>చిన్న మరమ్మతులు అవసరం</option><option>పెద్ద మరమ్మతులు అవసరం</option><option>కొత్త భవనం అవసరం</option>
            </select>

            {label("తాగునీటి సౌకర్యం", "survey-water")}
            <select id="survey-water" style={styles.field} value={survey.drinking_water} onChange={(e) => setSurvey({ ...survey, drinking_water: e.target.value })}>
              <option value="">ఎంచుకోండి</option><option>అందుబాటులో ఉంది</option><option>పరిమితంగా ఉంది</option><option>అందుబాటులో లేదు</option>
            </select>

            {label("మరుగుదొడ్ల పరిస్థితి", "survey-toilets")}
            <select id="survey-toilets" style={styles.field} value={survey.toilets_condition} onChange={(e) => setSurvey({ ...survey, toilets_condition: e.target.value })}>
              <option value="">ఎంచుకోండి</option><option>బాగుంది</option><option>శుభ్రత సరిగా లేదు</option><option>మరమ్మతులు అవసరం</option><option>మరుగుదొడ్లు లేవు</option>
            </select>

            {label("ఉపాధ్యాయుల కొరత", "survey-teachers")}
            <select id="survey-teachers" style={styles.field} value={survey.teacher_shortage} onChange={(e) => setSurvey({ ...survey, teacher_shortage: e.target.value })}>
              <option value="">ఎంచుకోండి</option><option>కొరత ఉంది</option><option>కొరత లేదు</option><option>తెలియదు</option>
            </select>

            {label("ఇతర సమస్యల వివరాలు", "survey-issues")}
            <textarea id="survey-issues" style={{ ...styles.field, minHeight: 120, resize: "vertical" }} value={survey.issue_summary} onChange={(e) => setSurvey({ ...survey, issue_summary: e.target.value })} placeholder="సమస్యలను వివరించండి" />

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button style={styles.button} type="submit" disabled={loading}>{loading ? "సేవ్ అవుతోంది..." : "సర్వే వివరాలు సేవ్ చేయండి"}</button>
              <button style={styles.secondaryButton} type="button" onClick={() => navigate("home")}>హోమ్‌కు తిరిగి వెళ్లండి</button>
            </div>
          </form>
        </section>
      )}

      {section === "complaint" && (
        <section style={{ ...styles.container, ...styles.card, marginTop: 28, marginBottom: 35 }}>
          <h1 style={{ fontSize: 30, marginTop: 0 }}>విద్యార్థుల సమస్యలు / ఫిర్యాదులు</h1>
          <p style={{ color: "#61766a", lineHeight: 1.7 }}>ఫిర్యాదులో వ్యక్తిగత లేదా సున్నితమైన వివరాలు చేర్చవద్దు.</p>
          <form onSubmit={submitComplaint}>
            {label("సమస్య రకం *", "complaint-category")}
            <select id="complaint-category" style={styles.field} required value={complaint.category} onChange={(e) => setComplaint({ ...complaint, category: e.target.value })}>
              <option>భవన సమస్య</option><option>తాగునీటి సమస్య</option><option>మరుగుదొడ్ల సమస్య</option><option>ఉపాధ్యాయుల కొరత</option><option>ఫీజుల సమస్య</option><option>స్కాలర్‌షిప్ సమస్య</option><option>బస్సు / రవాణా సమస్య</option><option>హాస్టల్ సమస్య</option><option>ఇతర సమస్య</option>
            </select>

            {label("మండలం *", "complaint-mandal")}
            <select id="complaint-mandal" style={styles.field} required value={complaint.mandal} onChange={(e) => setComplaint({ ...complaint, mandal: e.target.value })}>
              <option value="">మండలం ఎంచుకోండి</option>{mandals.map((m) => <option key={m} value={m}>{m}</option>)}<option value="ఇతర">ఇతర</option>
            </select>

            {label("పాఠశాల / కళాశాల పేరు *", "complaint-institution")}
            <input id="complaint-institution" style={styles.field} required value={complaint.institution_name} onChange={(e) => setComplaint({ ...complaint, institution_name: e.target.value })} placeholder="సంస్థ పేరు" />

            {label("సమస్య పూర్తి వివరాలు *", "complaint-description")}
            <textarea id="complaint-description" style={{ ...styles.field, minHeight: 145, resize: "vertical" }} required value={complaint.description} onChange={(e) => setComplaint({ ...complaint, description: e.target.value })} placeholder="సమస్య ఏమిటి? ఎక్కడ ఎదురవుతోంది?" />

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <button style={styles.button} type="submit" disabled={loading}>{loading ? "సేవ్ అవుతోంది..." : "ఫిర్యాదు నమోదు చేయండి"}</button>
              <button style={styles.secondaryButton} type="button" onClick={() => navigate("home")}>హోమ్‌కు తిరిగి వెళ్లండి</button>
            </div>
          </form>
        </section>
      )}

      {section === "about" && (
        <section style={{ ...styles.container, ...styles.card, marginTop: 28, marginBottom: 35 }}>
          <div style={{ fontSize: 13, color: "#13815b", fontWeight: 800 }}>మా గురించి</div>
          <h1 style={{ fontSize: 32 }}>మా లక్ష్యం</h1>
          <p style={{ color: "#52695d", fontSize: 17, lineHeight: 2 }}>
            వనపర్తి జిల్లాలో విద్యా సౌకర్యాల పరిస్థితిని తెలుసుకోవడం, విద్యార్థుల సమస్యలను బాధ్యతాయుతంగా నమోదు చేయడం, పరిష్కாரానికి தேவையான సమాచారத்தைச் சேகரிப்பது எங்கள் நோக்கம்.
          </p>
          <h2>எங்கள் முக்கிய நோக்கங்கள்</h2>
          <ul style={{ lineHeight: 2, color: "#52695d" }}>
            <li>పాఠశాలలు, కళాశాలలు, హాస్టళ్లలో సౌకర్యాల వివరాల సేకరణ</li>
            <li>విద్యార్థుల సమస్యలను నమోదు చేయడానికి వేదిక కల్పించడం</li>
            <li>విద్యా వాతావరణాన్ని మెరుగుపరచడానికి ఉపయోగపడే సమాచారాన్ని సేకరించడం</li>
            <li>సమస్యలను బాధ్యతాయుతంగా, గౌరవప్రదంగా తెలియజేయడం</li>
          </ul>
          {goButton("హోమ్‌కు తిరిగి వెళ్లండి", "home")}
        </section>
      )}

      <footer style={{ marginTop: 20, background: "#0d503e", color: "#d8ece1", padding: "28px 0" }}>
        <div style={{ ...styles.container, textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 19, color: "#fff" }}>విద్యా సేవ – వనపర్తి</div>
          <p style={{ fontSize: 13, lineHeight: 1.8 }}>విద్యార్థుల అభివృద్ధి కోసం • మెరుగైన విద్యా వాతావరణం కోసం</p>
          <div style={{ fontSize: 12, color: "#b9d9c8" }}>© {new Date().getFullYear()} విద్యా సేవ – వనపర్తి</div>
        </div>
      </footer>
    </main>
  );
}
