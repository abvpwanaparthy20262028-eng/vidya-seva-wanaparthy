
"use client";

import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export default function Home() {
  const [section, setSection] = useState("home");

  return (
    <main style={{ fontFamily: "Arial, sans-serif", background: "#f4f8f6", minHeight: "100vh", color: "#172b36" }}>
      <header style={{ background: "#116b57", color: "white", padding: "24px 18px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "30px" }}>విద్యా సేవ – వనపర్తి</h1>
        <p>విద్యార్థుల సమస్యలు • విద్యా సర్వే • విద్యా హక్కులు</p>
      </header>

      <nav style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", padding: "16px" }}>
        <button onClick={() => setSection("home")}>హోమ్</button>
        <button onClick={() => setSection("survey")}>విద్యా సర్వే</button>
        <button onClick={() => setSection("complaint")}>సమస్య తెలియజేయండి</button>
        <button onClick={() => setSection("about")}>మా లక్ష్యం</button>
      </nav>

      <section style={{ maxWidth: "900px", margin: "20px auto", padding: "24px", background: "white", borderRadius: "14px", boxShadow: "0 3px 14px #0001" }}>
        {section === "home" && (
          <>
            <h2>విద్యార్థుల గొంతుక – మన బాధ్యత</h2>
            <p>వనపర్తి జిల్లాలో పాఠశాలలు, కళాశాలలు మరియు విద్యార్థులు ఎదుర్కొంటున్న సమస్యలను నమోదు చేసి, విద్యా సౌకర్యాల స్థితిని తెలుసుకోవడానికి ఈ వేదిక రూపొందించబడుతోంది.</p>
            <h3>ముఖ్య సేవలు</h3>
            <ul>
              <li>పాఠశాలలు మరియు కళాశాలల విద్యా సర్వే</li>
              <li>విద్యార్థుల సమస్యలు, ఫిర్యాదుల నమోదు</li>
              <li>తాగునీరు, మరుగుదొడ్లు, భవనాలు, ఉపాధ్యాయుల వివరాలు</li>
              <li>విద్యా సమస్యలపై నివేదికల తయారీ</li>
            </ul>
          </>
        )}

        {section === "survey" && (
          <>
            <h2>విద్యా సర్వే</h2>
            <p>పాఠశాలలు, కళాశాలల వివరాలను నమోదు చేసే సర్వే ఫారమ్‌ను తదుపరి దశలో ఇక్కడ కలుపుతాం.</p>
            <p>సర్వే వివరాలు ఇంకా డేటాబేస్‌కు కనెక్ట్ కాలేదు.</p>
          </>
        )}

        {section === "complaint" && (
          <>
            <h2>విద్యార్థుల సమస్యలు</h2>
            <p>విద్యార్థులు ఎదుర్కొంటున్న సమస్యల కోసం ఫిర్యాదు ఫారమ్‌ను తదుపరి దశలో ఇక్కడ కలుపుతాం.</p>
            <p>ఈ ప్రస్తుత పేజీ ఫిర్యాదులను ఇంకా సేవ్ చేయదు.</p>
          </>
        )}

        {section === "about" && (
          <>
            <h2>మా లక్ష్యం</h2>
            <p>వనపర్తి జిల్లాలో విద్యా సౌకర్యాల స్థితిని తెలుసుకోవడం, విద్యార్థుల సమస్యలను క్రమబద్ధంగా నమోదు చేయడం, పరిష్కారానికి ఉపయోగపడే సమాచారాన్ని సిద్ధం చేయడం.</p>
          </>
        )}
      </section>

      <footer style={{ textAlign: "center", padding: "20px", color: "#61717b" }}>
        విద్యా సేవ – వనపర్తి | విద్యార్థుల అభివృద్ధి కోసం
      </footer>

      <style jsx>{`
        button {
          border: 0;
          border-radius: 8px;
          padding: 12px 16px;
          background: #116b57;
          color: white;
          cursor: pointer;
          font-size: 15px;
        }
        button:hover {
          background: #0b4f42;
        }
      `}</style>
    </main>
  );
}
