"use client";

import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

type Survey = {
  id: string;
  institution_name: string;
  institution_type: string;
  mandal: string;
  village: string | null;
  issue_summary: string | null;
  created_at: string;
};

type Complaint = {
  id: string;
  category: string;
  mandal: string;
  institution_name: string | null;
  description: string;
  status: string;
  created_at: string;
};

const mandals = [
  "వనపర్తి", "ఘనపూర్", "ఆత్మకూర్", "అమరచింత", "కొత్తకోట",
  "పెబ్బేరు", "గోపాల్‌పేట", "మదనాపురం", "ఏదుల", "శ్రీరంగాపురం",
  "వీపనగండ్ల", "పెద్దమందడి", "పానగల్", "రేవల్లి", "పంగల్"
];

export default function Home() {
  const [tab, setTab] = useState<"dashboard" | "survey" | "complaint" | "records">("dashboard");
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    if (!supabaseConfigured) return;
    const [s, c] = await Promise.all([
      supabase.from("survey").select("id,institution_name,institution_type,mandal,village,issue_summary,created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("complaints").select("id,category,mandal,institution_name,description,status,created_at").order("created_at", { ascending: false }).limit(100)
    ]);
    if (!s.error && s.data) setSurveys(s.data as Survey[]);
    if (!c.error && c.data) setComplaints(c.data as Complaint[]);
  }

  useEffect(() => { refresh(); }, []);

  async function submitSurvey(formData: FormData) {
    setBusy(true); setNotice("");
    const payload = {
      institution_name: String(formData.get("institution_name") || "").trim(),
      institution_type: String(formData.get("institution_type") || ""),
      mandal: String(formData.get("mandal") || ""),
      village: String(formData.get("village") || "").trim() || null,
      issue_summary: String(formData.get("issue_summary") || "").trim() || null,
      building_condition: String(formData.get("building_condition") || ""),
      drinking_water: String(formData.get("drinking_water") || ""),
      toilets_condition: String(formData.get("toilets_condition") || ""),
      teacher_shortage: String(formData.get("teacher_shortage") || "")
    };
    const { error } = await supabase.from("survey").insert(payload);
    setBusy(false);
    if (error) setNotice("సేవ్ కాలేదు: " + error.message);
    else { setNotice("సర్వే వివరాలు సర్వర్‌లో సేవ్ అయ్యాయి."); (document.getElementById("survey-form") as HTMLFormElement)?.reset(); setTab("records"); await refresh(); }
  }

  async function submitComplaint(formData: FormData) {
    setBusy(true); setNotice("");
    const payload = {
      category: String(formData.get("category") || ""),
      mandal: String(formData.get("mandal") || ""),
      institution_name: String(formData.get("institution_name") || "").trim() || null,
      description: String(formData.get("description") || "").trim(),
      status: "కొత్తది"
    };
    const { data, error } = await supabase.from("complaints").insert(payload).select("id").single();
    setBusy(false);
    if (error) setNotice("సేవ్ కాలేదు: " + error.message);
    else { setNotice("ఫిర్యాదు సేవ్ అయింది. నమోదు ID: " + data.id); (document.getElementById("complaint-form") as HTMLFormElement)?.reset(); await refresh(); }
  }

  const count = surveys.length + complaints.length;

  return (
    <main className="shell">
      <header className="hero">
        <div className="brand-mark">వి</div>
        <div>
          <p className="eyebrow">విద్యార్థుల కోసం • విద్యా హక్కుల కోసం</p>
          <h1>విద్యా సేవ <span>వనపర్తి</span></h1>
          <p className="subtitle">విద్యా సర్వేలు, సంస్థల వివరాలు, విద్యార్థుల సమస్యలు — ఒకే చోట.</p>
        </div>
      </header>

      {!supabaseConfigured && <div className="warning"><b>సెటప్ అవసరం:</b> ఇది ప్రారంభ ప్రాజెక్ట్. నిజమైన సర్వర్‌లో సేవ్ చేయడానికి Supabase ప్రాజెక్ట్ సృష్టించి .env.local ఫైల్‌లో కీలు జోడించి, supabase/schema.sql అమలు చేయాలి. READMEలో సూచనలు ఉన్నాయి.</div>}
      {notice && <div className="notice" role="status">{notice}</div>}

      <nav className="nav">
        {[
          ["dashboard", "డ్యాష్‌బోర్డ్"], ["survey", "విద్యా సర్వే"],
          ["complaint", "సమస్య నమోదు"], ["records", "నమోదైన వివరాలు"]
        ].map(([key, label]) => <button key={key} className={tab === key ? "active" : ""} onClick={() => {setTab(key as typeof tab); setNotice("");}}>{label}</button>)}
      </nav>

      {tab === "dashboard" && <section>
        <div className="section-heading"><div><p className="eyebrow">జిల్లా స్థాయి వీక్షణ</p><h2>ముఖ్యాంశాలు</h2></div><button className="secondary" onClick={refresh}>రిఫ్రెష్ ↻</button></div>
        <div className="stats">
          <article className="stat"><span>నమోదైన సర్వేలు</span><strong>{surveys.length}</strong><small>పాఠశాలలు, కాలేజీలు, హాస్టళ్లు</small></article>
          <article className="stat"><span>విద్యార్థుల సమస్యలు</span><strong>{complaints.length}</strong><small>నమోదైన ఫిర్యాదులు</small></article>
          <article className="stat"><span>మొత్తం రికార్డులు</span><strong>{count}</strong><small>ఇటీవలి 100 రికార్డుల వరకు</small></article>
        </div>
        <div className="two-col">
          <article className="panel"><h3>త్వరిత నమోదు</h3><p>ఫీల్డ్‌లో సర్వే చేసిన వెంటనే వివరాలను నమోదు చేయండి.</p><button onClick={() => setTab("survey")}>సర్వే ప్రారంభించు →</button></article>
          <article className="panel"><h3>సమస్యను నమోదు చేయండి</h3><p>విద్యార్థుల సమస్యలను రికార్డు చేసి తదుపరి చర్యలకు సిద్ధం చేయండి.</p><button onClick={() => setTab("complaint")}>సమస్య నమోదు →</button></article>
        </div>
        <p className="privacy-note">గోప్యత: విద్యార్థుల అవసరం లేని వ్యక్తిగత వివరాలు నమోదు చేయవద్దు. సున్నితమైన ఫిర్యాదులకు పరిమిత యాక్సెస్ ఏర్పాటు చేయాలి.</p>
      </section>}

      {tab === "survey" && <section className="panel">
        <p className="eyebrow">FIELD SURVEY</p><h2>విద్యా సంస్థ సర్వే</h2>
        <form id="survey-form" action={async (fd) => submitSurvey(fd)}>
          <div className="form-grid">
            <label>సంస్థ పేరు *<input name="institution_name" required placeholder="ఉదా: ప్రభుత్వ ఉన్నత పాఠశాల" /></label>
            <label>సంస్థ రకం *<select name="institution_type" required defaultValue=""><option value="" disabled>ఎంచుకోండి</option><option>ప్రభుత్వ పాఠశాల</option><option>ప్రైవేట్ పాఠశాల</option><option>జూనియర్ కాలేజీ</option><option>డిగ్రీ కాలేజీ</option><option>హాస్టల్</option><option>KGBV</option><option>ఇతర</option></select></label>
            <label>మండలం *<select name="mandal" required defaultValue=""><option value="" disabled>మండలం ఎంచుకోండి</option>{mandals.map(m => <option key={m}>{m}</option>)}</select></label>
            <label>గ్రామం / పట్టణం<input name="village" placeholder="గ్రామం లేదా పట్టణం" /></label>
            <label>భవనం పరిస్థితి<select name="building_condition" defaultValue="తెలియదు"><option>బాగుంది</option><option>చిన్న మరమ్మతులు అవసరం</option><option>ప్రమాదకరంగా ఉంది</option><option>అద్దె భవనం</option><option>తెలియదు</option></select></label>
            <label>తాగునీటి సౌకర్యం<select name="drinking_water" defaultValue="తెలియదు"><option>ఉంది</option><option>లేదు</option><option>సరిపడా లేదు</option><option>తెలియదు</option></select></label>
            <label>మరుగుదొడ్ల పరిస్థితి<select name="toilets_condition" defaultValue="తెలియదు"><option>బాగుంది</option><option>మరమ్మతులు అవసరం</option><option>వినియోగానికి పనికిరావు</option><option>లేవు</option><option>తెలియదు</option></select></label>
            <label>ఉపాధ్యాయుల కొరత<select name="teacher_shortage" defaultValue="తెలియదు"><option>లేదు</option><option>ఉంది</option><option>తెలియదు</option></select></label>
          </div>
          <label>గమనించిన సమస్యలు / గమనికలు<textarea name="issue_summary" rows={4} placeholder="సమస్యలు, అవసరమైన చర్యలు, అదనపు గమనికలు..." /></label>
          <button disabled={busy} type="submit">{busy ? "సేవ్ అవుతోంది..." : "సర్వే వివరాలు సేవ్ చేయి"}</button>
        </form>
      </section>}

      {tab === "complaint" && <section className="panel">
        <p className="eyebrow">STUDENT SUPPORT</p><h2>విద్యార్థుల సమస్య నమోదు</h2>
        <form id="complaint-form" action={async (fd) => submitComplaint(fd)}>
          <div className="form-grid">
            <label>సమస్య రకం *<select name="category" required defaultValue=""><option value="" disabled>ఎంచుకోండి</option><option>స్కాలర్‌షిప్ / ఫీజు రీయింబర్స్‌మెంట్</option><option>కాలేజీ సదుపాయాలు</option><option>హాస్టల్ సమస్య</option><option>రవాణా / బస్సు</option><option>పాఠశాల సమస్య</option><option>విద్యా సంబంధిత ఇతర సమస్య</option></select></label>
            <label>మండలం *<select name="mandal" required defaultValue=""><option value="" disabled>మండలం ఎంచుకోండి</option>{mandals.map(m => <option key={m}>{m}</option>)}</select></label>
            <label className="full">సంబంధిత సంస్థ పేరు<input name="institution_name" placeholder="పాఠశాల / కాలేజీ / హాస్టల్ పేరు" /></label>
          </div>
          <label>సమస్య వివరాలు *<textarea name="description" required minLength={10} rows={5} placeholder="ఏం జరిగింది? ఎక్కడ? ఎలాంటి సహాయం అవసరం?" /></label>
          <button disabled={busy} type="submit">{busy ? "సేవ్ అవుతోంది..." : "సమస్యను నమోదు చేయి"}</button>
        </form>
      </section>}

      {tab === "records" && <section className="panel">
        <div className="section-heading"><div><p className="eyebrow">RECENT RECORDS</p><h2>నమోదైన వివరాలు</h2></div><button className="secondary" onClick={refresh}>రిఫ్రెష్ ↻</button></div>
        <h3>సర్వేలు</h3>
        {surveys.length === 0 ? <p className="empty">ఇంకా సర్వేలు లేవు.</p> : <div className="table-wrap"><table><thead><tr><th>సంస్థ</th><th>రకం</th><th>మండలం</th><th>సమస్య / గమనిక</th></tr></thead><tbody>{surveys.map(s => <tr key={s.id}><td>{s.institution_name}</td><td>{s.institution_type}</td><td>{s.mandal}</td><td>{s.issue_summary || "—"}</td></tr>)}</tbody></table></div>}
        <h3 className="spaced">విద్యార్థుల సమస్యలు</h3>
        {complaints.length === 0 ? <p className="empty">ఇంకా సమస్యలు నమోదు కాలేదు.</p> : <div className="table-wrap"><table><thead><tr><th>రిఫరెన్స్</th><th>సమస్య</th><th>మండలం</th><th>స్థితి</th></tr></thead><tbody>{complaints.map(c => <tr key={c.id}><td>{c.id}</td><td>{c.category}</td><td>{c.mandal}</td><td><span className="pill">{c.status}</span></td></tr>)}</tbody></table></div>}
      </section>}

      <footer><b>విద్యా సేవ – వనపర్తి</b><span>విద్యార్థుల సమస్యలకు క్రమబద్ధమైన నమోదు • ఇది ప్రారంభ నమూనా</span></footer>
    </main>
  );
}
