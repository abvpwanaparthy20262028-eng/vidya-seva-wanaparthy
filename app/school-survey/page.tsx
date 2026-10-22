
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const sections = [
  {
    title: "1. పాఠశాల ప్రాథమిక వివరాలు",
    fields: [
      { name: "school_name", label: "పాఠశాల పేరు", required: true },
      { name: "school_code", label: "UDISE కోడ్" },
      { name: "mandal", label: "మండలం", required: true },
      { name: "village", label: "గ్రామం", required: true },
      { name: "school_type", label: "పాఠశాల రకం", type: "select", options: ["ప్రాథమిక", "ప్రాథమికోన్నత", "ఉన్నత పాఠశాల", "జూనియర్ కళాశాల", "ఇతర"] },
      { name: "management", label: "యాజమాన్యం", type: "select", options: ["ప్రభుత్వం", "స్థానిక సంస్థ", "ప్రైవేట్", "ఇతర"] },
      { name: "headmaster_name", label: "ప్రధానోపాధ్యాయుల పేరు" },
      { name: "contact_number", label: "సంప్రదింపు నంబర్", type: "tel" },
    ],
  },
  {
    title: "2. విద్యార్థుల వివరాలు",
    fields: [
      { name: "students_total", label: "మొత్తం విద్యార్థులు", type: "number" },
      { name: "students_boys", label: "బాలురు", type: "number" },
      { name: "students_girls", label: "బాలికలు", type: "number" },
      { name: "students_with_disability", label: "ప్రత్యేక అవసరాలున్న విద్యార్థులు", type: "number" },
      { name: "attendance_issue", label: "హాజరు సమస్య ఉందా?", type: "select", options: ["లేదు", "ఉంది", "తెలియదు"] },
      { name: "student_notes", label: "విద్యార్థులపై గమనికలు", type: "textarea" },
    ],
  },
  {
    title: "3. ఉపాధ్యాయులు మరియు సిబ్బంది",
    fields: [
      { name: "teachers_sanctioned", label: "మంజూరైన ఉపాధ్యాయ పోస్టులు", type: "number" },
      { name: "teachers_working", label: "పని చేస్తున్న ఉపాధ్యాయులు", type: "number" },
      { name: "teacher_vacancies", label: "ఖాళీ పోస్టులు", type: "number" },
      { name: "staff_shortage", label: "ఇతర సిబ్బంది కొరత ఉందా?", type: "select", options: ["లేదు", "ఉంది", "తెలియదు"] },
      { name: "staff_notes", label: "సిబ్బందిపై గమనికలు", type: "textarea" },
    ],
  },
  {
    title: "4. భవనాలు మరియు తరగతి గదులు",
    fields: [
      { name: "classrooms_total", label: "మొత్తం తరగతి గదులు", type: "number" },
      { name: "classrooms_usable", label: "వినియోగంలో ఉన్న గదులు", type: "number" },
      { name: "building_condition", label: "భవనం పరిస్థితి", type: "select", options: ["బాగుంది", "చిన్న మరమ్మతులు అవసరం", "పెద్ద మరమ్మతులు అవసరం", "ప్రమాదకరంగా ఉంది"] },
      { name: "boundary_wall", label: "ప్రహరీ గోడ ఉందా?", type: "select", options: ["ఉంది", "లేదు", "పాక్షికంగా ఉంది"] },
      { name: "electricity", label: "విద్యుత్ సదుపాయం", type: "select", options: ["ఉంది", "లేదు", "తరచుగా అంతరాయం"] },
      { name: "building_notes", label: "భవనంపై గమనికలు", type: "textarea" },
    ],
  },
  {
    title: "5. మౌలిక సదుపాయాలు",
    fields: [
      { name: "drinking_water", label: "తాగునీటి సదుపాయం", type: "select", options: ["బాగుంది", "సరిగా లేదు", "లేదు"] },
      { name: "toilets_boys", label: "బాలుర మరుగుదొడ్లు", type: "select", options: ["బాగున్నాయి", "మరమ్మతులు అవసరం", "లేవు"] },
      { name: "toilets_girls", label: "బాలికల మరుగుదొడ్లు", type: "select", options: ["బాగున్నాయి", "మరమ్మతులు అవసరం", "లేవు"] },
      { name: "toilet_cleaning", label: "మరుగుదొడ్ల శుభ్రత", type: "select", options: ["రోజూ", "అప్పుడప్పుడు", "శుభ్రం చేయడం లేదు"] },
      { name: "handwash", label: "చేతులు కడుక్కునే సదుపాయం", type: "select", options: ["ఉంది", "లేదు"] },
      { name: "library", label: "గ్రంథాలయం", type: "select", options: ["ఉంది", "లేదు", "ఉంది కానీ పుస్తకాలు తక్కువ"] },
      { name: "computers", label: "కంప్యూటర్ సదుపాయం", type: "select", options: ["ఉంది", "లేదు", "పని చేయడం లేదు"] },
      { name: "playground", label: "ఆట స్థలం", type: "select", options: ["ఉంది", "లేదు", "సరిపోదు"] },
    ],
  },
  {
    title: "6. హాస్టల్ మరియు ఇతర సదుపాయాలు",
    fields: [
      { name: "hostel_available", label: "హాస్టల్ ఉందా?", type: "select", options: ["ఉంది", "లేదు"] },
      { name: "hostel_condition", label: "హాస్టల్ పరిస్థితి" },
      { name: "midday_meal", label: "మధ్యాహ్న భోజనం", type: "select", options: ["బాగుంది", "నాణ్యత మెరుగుపరచాలి", "సమస్యలు ఉన్నాయి", "వర్తించదు"] },
      { name: "transport", label: "రవాణా సదుపాయం", type: "select", options: ["ఉంది", "లేదు", "సరిపోదు"] },
      { name: "other_facilities", label: "ఇతర సదుపాయాల వివరాలు", type: "textarea" },
    ],
  },
  {
    title: "7. సమస్యలు మరియు సూచనలు",
    fields: [
      { name: "main_problems", label: "పాఠశాలలో ప్రధాన సమస్యలు", type: "textarea", required: true },
      { name: "urgent_issue", label: "తక్షణ పరిష్కారం అవసరమైన సమస్య", type: "textarea" },
      { name: "suggestions", label: "మీ సూచనలు", type: "textarea" },
      { name: "surveyed_by", label: "సర్వే చేసిన వ్యక్తి పేరు", required: true },
      { name: "survey_date", label: "సర్వే తేదీ", type: "date", required: true },
    ],
  },
];

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

export default function SchoolSurveyPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update(name: string, value: string) {
    setAnswers((old) => ({ ...old, [name]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (answers.students_total && Number(answers.students_total) < 0) {
      setError("విద్యార్థుల సంఖ్య సరైనదిగా నమోదు చేయండి.");
      return;
    }

    if (
      answers.students_boys &&
      answers.students_girls &&
      answers.students_total &&
      Number(answers.students_boys) + Number(answers.students_girls) >
        Number(answers.students_total)
    ) {
      setError("బాలురు, బాలికల సంఖ్య మొత్తం విద్యార్థుల సంఖ్యను మించకూడదు.");
      return;
    }

    setBusy(true);

    try {
      const { error: saveError } = await supabase
        .from("school_surveys")
        .insert({
          school_name: answers.school_name,
          mandal: answers.mandal,
          village: answers.village,
          survey_data: answers,
        });

      if (saveError) throw saveError;

      setMessage("సర్వే వివరాలు విజయవంతంగా సేవ్ అయ్యాయి.");
      setAnswers({});
      setStep(0);
    } catch (e) {
      console.error("School survey save error:", e);
      setError(
        "సర్వే సేవ్ కాలేదు. Supabaseలో school_surveys టేబుల్, అనుమతులు సిద్ధంగా ఉన్నాయో తనిఖీ చేయండి."
      );
    } finally {
      setBusy(false);
    }
  }

  const current = sections[step];

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 rounded-2xl bg-emerald-900 p-6 text-white shadow-lg">
          <p className="text-sm font-semibold text-emerald-200">
            ABVP • వనపర్తి జిల్లా
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            ప్రభుత్వ పాఠశాలల సర్వే
          </h1>
          <p className="mt-2 text-sm leading-6 text-emerald-50">
            విద్యార్థులు, ఉపాధ్యాయులు, భవనాలు, మౌలిక సదుపాయాలు మరియు సమస్యల
            వివరాలను నమోదు చేయండి.
          </p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-emerald-800">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${((step + 1) / sections.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-sm">
            విభాగం {step + 1} / {sections.length}
          </p>
        </header>

        {message && (
          <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-4 text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={submit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <h2 className="mb-1 text-xl font-bold text-emerald-900">
            {current.title}
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            అవసరమైన వివరాలను నింపండి. * గుర్తు ఉన్నవి తప్పనిసరి.
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            {current.fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === "textarea" ? "sm:col-span-2" : ""
                }
              >
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold text-slate-700"
                >
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-600">*</span>
                  )}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    required={!!field.required}
                    rows={4}
                    value={answers[field.name] || ""}
                    onChange={(e) => update(field.name, e.target.value)}
                    className={inputClass}
                    placeholder={`${field.label} నమోదు చేయండి`}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    required={!!field.required}
                    value={answers[field.name] || ""}
                    onChange={(e) => update(field.name, e.target.value)}
                    className={inputClass}
                  >
                    <option value="">ఎంచుకోండి</option>
                    {"options" in field &&
                      field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    type={
                      "type" in field && field.type
                        ? field.type
                        : "text"
                    }
                    required={!!field.required}
                    min={
                      "type" in field && field.type === "number"
                        ? 0
                        : undefined
                    }
                    maxLength={
                      "type" in field && field.type === "tel"
                        ? 15
                        : undefined
                    }
                    value={answers[field.name] || ""}
                    onChange={(e) => update(field.name, e.target.value)}
                    className={inputClass}
                    placeholder={`${field.label} నమోదు చేయండి`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              disabled={step === 0 || busy}
              onClick={() => {
                setError("");
                setStep((s) => Math.max(0, s - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 disabled:opacity-40"
            >
              వెనుకకు
            </button>

            {step < sections.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  const missing = current.fields.find(
                    (f) => f.required && !answers[f.name]?.trim()
                  );
                  if (missing) {
                    setError(`${missing.label} తప్పనిసరిగా నమోదు చేయాలి.`);
                    return;
                  }
                  setError("");
                  setStep((s) => Math.min(sections.length - 1, s + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-lg bg-emerald-800 px-6 py-3 font-bold text-white hover:bg-emerald-900"
              >
                తదుపరి విభాగం →
              </button>
            ) : (
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-amber-400 px-6 py-3 font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
              >
                {busy ? "సేవ్ అవుతోంది..." : "సర్వే సమర్పించండి"}
              </button>
            )}
          </div>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          విద్యా సేవ – వనపర్తి | విద్యార్థుల హక్కులు • మెరుగైన విద్య
        </p>
      </div>
    </main>
  );
}
