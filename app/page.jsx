"use client";

import { useState, useEffect, useRef } from "react";

const STEPS = [
  { id: 1, label: "Pick Market", short: "Market" },
  { id: 2, label: "Research", short: "Research" },
  { id: 3, label: "JTBD", short: "JTBD" },
  { id: 4, label: "Score", short: "Score" },
  { id: 5, label: "Competition", short: "Compete" },
  { id: 6, label: "Generate Ideas", short: "Ideas" },
  { id: 7, label: "Prioritize", short: "Priority" },
  { id: 8, label: "Acquisition", short: "Acquire" },
  { id: 9, label: "Bonus Toolkit", short: "Toolkit" },
];
const TOTAL_STEPS = 9;

const MODEL = "claude-sonnet-4-20250514";

async function callClaude(systemPrompt, userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  return data.content?.map((b) => b.text || "").join("\n") || "";
}

function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: "#a0f0b0",
        fontFamily: "monospace",
        fontSize: 13,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          border: "2px solid #a0f0b030",
          borderTop: "2px solid #a0f0b0",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      Generating...
    </div>
  );
}

function MarkdownTable({ text, colWidths }) {
  const allLines = text.trim().split("\n");
  const tableLines = allLines.filter((l) => l.trim().startsWith("|"));
  if (tableLines.length < 2)
    return (
      <pre
        style={{
          whiteSpace: "pre-wrap",
          color: "#c8f0d0",
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
        }}
      >
        {text}
      </pre>
    );

  const parseRow = (line) =>
    line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());

  const isSeparator = (line) => /^\|[\s\-|:]+\|$/.test(line.trim());

  const headers = parseRow(tableLines[0]);
  const rows = tableLines
    .slice(1)
    .filter((l) => !isSeparator(l))
    .map(parseRow);

  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: 10,
        border: "1px solid #0f2a18",
        overflow: "hidden",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          tableLayout: "fixed",
        }}
      >
        {colWidths && (
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
        )}
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  background: "#0b2016",
                  color: "#50c070",
                  padding: "12px 16px",
                  borderBottom: "1px solid #1a4a24",
                  borderRight:
                    i < headers.length - 1 ? "1px solid #0f2a18" : "none",
                  textAlign: "left",
                  fontWeight: 500,
                  fontSize: 11,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              style={{
                background: ri % 2 === 0 ? "#060e09" : "#070f0a",
                transition: "background 0.15s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#0a1e10")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background =
                  ri % 2 === 0 ? "#060e09" : "#070f0a")
              }
            >
              {headers.map((_, ci) => (
                <td
                  key={ci}
                  style={{
                    color: ci === 0 ? "#a0e8b8" : "#7ab898",
                    padding: "11px 16px",
                    borderBottom:
                      ri < rows.length - 1 ? "1px solid #0c1e12" : "none",
                    borderRight:
                      ci < headers.length - 1 ? "1px solid #0c1e12" : "none",
                    verticalAlign: "top",
                    lineHeight: 1.55,
                    fontWeight: ci === 0 ? 500 : 400,
                  }}
                >
                  {row[ci] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProseBlock({ text }) {
  if (!text.trim()) return null;
  return (
    <div
      style={{
        color: "#c8f0d0",
        fontSize: 13,
        lineHeight: 1.7,
        fontFamily: "'DM Mono', monospace",
        whiteSpace: "pre-wrap",
        marginBottom: 16,
      }}
    >
      {text.split("\n").map((line, i) => {
        if (line.startsWith("###"))
          return (
            <h4
              key={i}
              style={{
                color: "#a0f0b0",
                fontFamily: "'Syne', sans-serif",
                fontSize: 15,
                margin: "14px 0 6px",
              }}
            >
              {line.replace(/^#+\s*/, "")}
            </h4>
          );
        if (line.startsWith("##"))
          return (
            <h3
              key={i}
              style={{
                color: "#60e090",
                fontFamily: "'Syne', sans-serif",
                fontSize: 16,
                margin: "16px 0 6px",
              }}
            >
              {line.replace(/^#+\s*/, "")}
            </h3>
          );
        if (line.startsWith("**") && line.endsWith("**"))
          return (
            <strong key={i} style={{ color: "#80f0a0", display: "block" }}>
              {line.replace(/\*\*/g, "")}
            </strong>
          );
        if (line.startsWith("- ") || line.startsWith("• "))
          return (
            <div key={i} style={{ paddingLeft: 16, color: "#a0d0b0" }}>
              ↳ {line.slice(2)}
            </div>
          );
        return (
          <span key={i}>
            {line}
            <br />
          </span>
        );
      })}
    </div>
  );
}

function ResultBlock({ text, stepNum }) {
  if (!text) return null;

  // Split text into prose and table segments
  const lines = text.split("\n");
  const segments = [];
  let prose = [];
  let tableLines = [];
  let inTable = false;

  for (const line of lines) {
    const isTableLine = line.trim().startsWith("|");
    if (isTableLine) {
      if (!inTable && prose.length) {
        segments.push({ type: "prose", content: prose.join("\n") });
        prose = [];
      }
      inTable = true;
      tableLines.push(line);
    } else {
      if (inTable) {
        segments.push({ type: "table", content: tableLines.join("\n") });
        tableLines = [];
        inTable = false;
      }
      prose.push(line);
    }
  }
  if (inTable) segments.push({ type: "table", content: tableLines.join("\n") });
  else if (prose.length)
    segments.push({ type: "prose", content: prose.join("\n") });

  // Column widths per step
  const colWidthMap = {
    3: ["28%", "42%", "30%"],
    4: ["34%", "12%", "14%", "14%", "26%"],
    5: ["20%", "20%", "22%", "14%", "24%"],
    6: ["4%", "18%", "26%", "30%", "12%"],
    7: ["6%", "18%", "28%", "14%", "34%"],
  };

  return (
    <div>
      {segments.map((seg, i) =>
        seg.type === "prose" ? (
          <ProseBlock key={i} text={seg.content} />
        ) : (
          <MarkdownTable
            key={i}
            text={seg.content}
            colWidths={colWidthMap[stepNum]}
          />
        ),
      )}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [market, setMarket] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bonusResults, setBonusResults] = useState({});
  const [bonusLoading, setBonusLoading] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (resultRef.current)
      resultRef.current.scrollIntoView({ behavior: "smooth" });
  }, [results]);

  const run = async (stepNum) => {
    setLoading(true);
    setError("");
    try {
      let output = "";
      const m = market;

      if (stepNum === 1) {
        output = await callClaude(
          "You are a SaaS market strategist. Be concise and direct.",
          `Step 1: Analyze why "${m}" is a good or risky niche for SaaS. Discuss: specificity, information advantage, product-led growth potential, and accessibility. Keep it to 5–7 bullet points.`,
        );
      } else if (stepNum === 2) {
        output = await callClaude(
          "You are a market research analyst and opportunity scorer. Be specific, data-driven, and direct. Use bullet points and clear sections.",
          `Analyze the "${m}" market as a SaaS opportunity. Structure your response in these sections:

## Market Overview
- Estimated US market size, number of potential customers, avg revenue per user potential, growth trend

## Demand
- Are users frequently searching for solutions in this area? What signals exist (forums, job posts, communities)?

## Competition
- How many tools already solve this problem? Name 3 competitors to watch and their positioning.

## Gaps & Pain Points
- What are current tools missing? What complaints do users have? What pricing insights exist?

## Opportunity Score
Rate this market opportunity 1–10 (1 = low demand/high competition, 10 = high demand/low competition). Give the score and a 2-sentence justification.`,
        );
      } else if (stepNum === 3) {
        output = await callClaude(
          "You are a Jobs-to-be-Done (JTBD) research expert. Return ONLY a markdown table, no preamble, no explanation, no extra text before or after. Just the raw table.",
          `List the top 8 Jobs To Be Done for "${m}". Use exactly these three columns: Job | Pain Point | Current Tools. Output only the markdown table.`,
        );
      } else if (stepNum === 4) {
        output = await callClaude(
          "You are a product prioritization expert. Be analytical.",
          `Step 4: Score the top 8 Jobs To Be Done for "${m}" on Pain (1–5) and Frequency (1–5). Calculate Impact Score (Pain × Frequency). Sort by highest impact. Use a markdown table: Job | Pain (1-5) | Frequency (1-5) | Impact Score | Priority`,
        );
      } else if (stepNum === 5) {
        output = await callClaude(
          "You are a competitive intelligence analyst and sales strategist. Identify white space opportunities and buyer objections.",
          `For the "${m}" market, do two things:

## Competitive Landscape
For the top 5 highest-impact JTBDs, analyze existing solutions. Use a markdown table with columns: JTBD | Existing Tools | Weaknesses | Avg Pricing | AI Opportunity

## Top Objections & How to Destroy Them
List the top 5 objections a buyer in this market would have before purchasing a new SaaS tool. For each, write a persuasive, trust-building response that turns "I'm not sure" into "Where do I pay?" Format as: Objection | Persuasive Response`,
        );
      } else if (stepNum === 6) {
        output = await callClaude(
          "You are a SaaS product ideation expert focused on AI-powered micro-SaaS. Be creative and specific.",
          `Step 6: Generate 25 Micro SaaS ideas for "${m}" based on the top JTBDs. For each idea include: Name, Core Problem Solved, AI Feature, and Pricing Model. Use a markdown table: # | Idea Name | Problem Solved | AI Feature | Price/mo`,
        );
      } else if (stepNum === 7) {
        output = await callClaude(
          "You are a startup advisor. Be decisive and practical.",
          `For the top SaaS ideas targeting "${m}", prioritize the TOP 5 based on: JTBD importance, MVP simplicity, competitive gap, and data access. Use a markdown table: Rank | Idea | Why It Wins | MVP Complexity (1-5) | Validation Method`,
        );
      } else if (stepNum === 8) {
        output = await callClaude(
          "You are a growth strategist and GTM expert. Be tactical and specific. No fluff.",
          `For a SaaS product targeting "${m}", provide two sections:

## Customer Acquisition Formula (No Paid Ads)
Step-by-step plan to get the first 10 paying customers using only personal network and organic channels. Be specific: exact actions, platforms, and outreach scripts.

## Strategic Partnerships
Suggest 5 high-leverage partnerships that can drive traffic, boost credibility, and reach more customers fast. Use a markdown table: Partner Type | Why It Works | How to Approach`,
        );
      } else if (stepNum === 9) {
        output = "__TOOLKIT__";
      }

      setResults((prev) => ({ ...prev, [stepNum]: output }));
      setStep(stepNum);
    } catch (e) {
      setError("API error: " + e.message);
    }
    setLoading(false);
  };

  const isStepDone = (n) => !!results[n];
  const currentStepData = results[step];

  const runBonus = async (id) => {
    setBonusLoading(id);
    const m = market;
    const prompts = {
      brand: {
        system:
          "You are a brand strategist and naming expert. Be creative and specific.",
        user: `Create a complete brand identity for a SaaS business targeting "${m}". Include:
- 3 brand name options with rationale
- A punchy tagline
- Color palette (hex codes + mood)
- Brand tone & voice in 3 adjectives
- A short brand story (3–4 sentences)`,
      },
      offer: {
        system:
          "You are a pricing psychologist and offer architect. Be persuasive and specific.",
        user: `Design an irresistible SaaS offer for "${m}" that makes them say YES instantly. Include:
- Core product value proposition (1 sentence)
- 3 high-perceived-value bonuses to include
- Recommended pricing tiers (Starter / Pro / Agency)
- 3 pricing psychology tactics to apply
- The single most powerful value-boost tactic for this audience`,
      },
      website: {
        system:
          "You are a conversion copywriter and website strategist. Focus on trust and objection-killing.",
        user: `Design a high-converting website blueprint for a SaaS targeting "${m}". For each page, provide the goal, key sections, and headline copy ideas:
- Homepage (hero, social proof, features, CTA)
- About page (trust signals, founder story angle)
- Sales/pricing page (offer framing, objection killers, urgency)
- FAQ page (top 6 questions this audience would ask)`,
      },
    };
    try {
      const { system, user } = prompts[id];
      const output = await callClaude(system, user);
      setBonusResults((prev) => ({ ...prev, [id]: output }));
    } catch (e) {
      setBonusResults((prev) => ({ ...prev, [id]: "Error: " + e.message }));
    }
    setBonusLoading(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #040e08; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .step-btn:hover { background: #1a4a24 !important; border-color: #40b060 !important; }
        .run-btn:hover { background: #30c060 !important; transform: scale(1.02); }
        textarea:focus { outline: none; border-color: #40b060 !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #071810; }
        ::-webkit-scrollbar-thumb { background: #1e5a28; border-radius: 2px; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#040e08",
          fontFamily: "'Syne', sans-serif",
          backgroundImage:
            "radial-gradient(ellipse at 20% 10%, #0a2a1220 0%, transparent 60%), radial-gradient(ellipse at 80% 90%, #082015 0%, transparent 50%)",
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: "1px solid #0f2a18",
            padding: "20px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#040e0899",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "linear-gradient(135deg, #20a050, #0a5020)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              ⚡
            </div>
            <div>
              <div
                style={{
                  color: "#e0ffe0",
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: -0.5,
                }}
              >
                SaaS Idea Engine
              </div>
              <div
                style={{
                  color: "#406050",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: 1,
                }}
              >
                7-STEP AI FRAMEWORK + TOOLKIT
              </div>
            </div>
          </div>
          {market && (
            <div
              style={{
                background: "#0a2a14",
                border: "1px solid #1a4a24",
                borderRadius: 6,
                padding: "4px 12px",
                color: "#60c080",
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              market: {market}
            </div>
          )}
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
          {/* Intro / Market Input */}
          {step === 0 && (
            <div style={{ animation: "fadeUp 0.5s ease" }}>
              <div style={{ marginBottom: 48, textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-block",
                    background: "#0a2a14",
                    border: "1px solid #1a4a24",
                    borderRadius: 20,
                    padding: "4px 16px",
                    color: "#50a070",
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: 2,
                    marginBottom: 20,
                  }}
                >
                  AI-POWERED IDEATION
                </div>
                <h1
                  style={{
                    color: "#d0ffe0",
                    fontSize: 42,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: -1.5,
                    marginBottom: 16,
                  }}
                >
                  Find Your Next
                  <br />
                  <span style={{ color: "#30d060" }}>SaaS Opportunity</span>
                </h1>
                <p
                  style={{
                    color: "#507060",
                    fontSize: 15,
                    maxWidth: 500,
                    margin: "0 auto",
                    lineHeight: 1.6,
                  }}
                >
                  A structured 7-step AI framework to go from market selection
                  to validated SaaS ideas — fast.
                </p>
              </div>

              <div
                style={{
                  background: "#070f0a",
                  border: "1px solid #0f2a18",
                  borderRadius: 16,
                  padding: 32,
                  marginBottom: 32,
                }}
              >
                <label
                  style={{
                    color: "#70a080",
                    fontSize: 12,
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: 2,
                    display: "block",
                    marginBottom: 12,
                  }}
                >
                  STEP 1 — ENTER YOUR TARGET MARKET
                </label>
                <textarea
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  placeholder="e.g. solo accountants, independent dentists, freelance videographers..."
                  rows={3}
                  style={{
                    width: "100%",
                    background: "#040e08",
                    border: "1px solid #0f2a18",
                    borderRadius: 10,
                    padding: "14px 16px",
                    color: "#c0e8d0",
                    fontSize: 15,
                    fontFamily: "'DM Mono', monospace",
                    resize: "vertical",
                    transition: "border-color 0.2s",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 12,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    "solo accountants",
                    "independent dentists",
                    "freelance designers",
                    "food truck owners",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setMarket(s)}
                      style={{
                        background: "#0a1e10",
                        border: "1px solid #1a3a20",
                        borderRadius: 6,
                        padding: "5px 12px",
                        color: "#507060",
                        fontSize: 11,
                        fontFamily: "'DM Mono', monospace",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.color = "#80c090";
                        e.target.style.borderColor = "#30a050";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.color = "#507060";
                        e.target.style.borderColor = "#1a3a20";
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="run-btn"
                onClick={() => market.trim() && run(1)}
                disabled={!market.trim() || loading}
                style={{
                  width: "100%",
                  background: "#20a050",
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 32px",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: market.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  opacity: market.trim() ? 1 : 0.4,
                  letterSpacing: 0.5,
                }}
              >
                {loading ? "Analyzing..." : "→ Begin Analysis"}
              </button>
              {error && (
                <div style={{ color: "#f08080", fontSize: 12, marginTop: 10 }}>
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Steps Progress + Results */}
          {step > 0 && (
            <div style={{ animation: "fadeUp 0.4s ease" }}>
              {/* Step Nav */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 32,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {STEPS.map((s) => (
                  <button
                    key={s.id}
                    className="step-btn"
                    onClick={() => (isStepDone(s.id) ? setStep(s.id) : null)}
                    style={{
                      background: step === s.id ? "#102a18" : "#070f0a",
                      border:
                        step === s.id
                          ? "1px solid #30a050"
                          : isStepDone(s.id)
                            ? "1px solid #1a4a24"
                            : "1px solid #0f1a12",
                      borderRadius: 8,
                      padding: "8px 14px",
                      color:
                        step === s.id
                          ? "#70e090"
                          : isStepDone(s.id)
                            ? "#40a060"
                            : "#304030",
                      fontSize: 11,
                      fontFamily: "'DM Mono', monospace",
                      cursor: isStepDone(s.id) ? "pointer" : "default",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s",
                      letterSpacing: 0.5,
                    }}
                  >
                    {isStepDone(s.id) && step !== s.id ? "✓ " : ""}
                    {s.id}. {s.short}
                  </button>
                ))}
              </div>

              {/* Current Step Header */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    color: "#304a38",
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: 2,
                    marginBottom: 6,
                  }}
                >
                  STEP {step} OF {TOTAL_STEPS}
                </div>
                <h2
                  style={{
                    color: "#c0ffe0",
                    fontSize: 24,
                    fontWeight: 800,
                    letterSpacing: -0.5,
                  }}
                >
                  {STEPS[step - 1]?.label}
                </h2>
              </div>

              {/* Result Card */}
              <div
                ref={resultRef}
                style={{
                  background: "#060e08",
                  border: "1px solid #0f2a18",
                  borderRadius: 14,
                  padding: 24,
                  marginBottom: 24,
                  minHeight: 120,
                }}
              >
                {loading && step === Object.keys(results).length + 1 ? (
                  <Spinner />
                ) : step === 9 && isStepDone(9) ? (
                  <div>
                    <p
                      style={{
                        color: "#507060",
                        fontSize: 13,
                        fontFamily: "'DM Mono', monospace",
                        marginBottom: 20,
                        lineHeight: 1.6,
                      }}
                    >
                      Generate each asset on-demand to complete your launch kit.
                    </p>
                    {[
                      {
                        id: "brand",
                        icon: "🎨",
                        title: "Brand Identity Creator",
                        tagline: "Names, colors, tone & story",
                        desc: "Generate a complete brand identity — name options, tagline, color palette, voice, and brand story tailored to your market.",
                      },
                      {
                        id: "offer",
                        icon: "💰",
                        title: "Irresistible Offer Architect",
                        tagline: "Make them say YES instantly",
                        desc: "Turn your SaaS into a high-value offer with bonuses, pricing tiers, and psychology tactics your audience can't ignore.",
                      },
                      {
                        id: "website",
                        icon: "🌐",
                        title: "Conversion Website Blueprint",
                        tagline: "Your site should SELL, not just sit there",
                        desc: "Get page-by-page copy direction for homepage, about, sales page & FAQ — built to kill objections and drive signups.",
                      },
                    ].map((card) => (
                      <div
                        key={card.id}
                        style={{
                          background: "#040a06",
                          border: "1px solid #0c1e10",
                          borderRadius: 12,
                          padding: 20,
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 16,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "flex-start",
                            }}
                          >
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                background: "#0a1e10",
                                border: "1px solid #1a3a20",
                                borderRadius: 9,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 17,
                                flexShrink: 0,
                              }}
                            >
                              {card.icon}
                            </div>
                            <div>
                              <div
                                style={{
                                  color: "#a0e8b8",
                                  fontSize: 14,
                                  fontWeight: 700,
                                  marginBottom: 2,
                                }}
                              >
                                {card.title}
                              </div>
                              <div
                                style={{
                                  color: "#30a050",
                                  fontSize: 11,
                                  fontFamily: "'DM Mono', monospace",
                                  letterSpacing: 1,
                                  marginBottom: 5,
                                }}
                              >
                                {card.tagline}
                              </div>
                              <div
                                style={{
                                  color: "#507060",
                                  fontSize: 12,
                                  fontFamily: "'DM Mono', monospace",
                                  lineHeight: 1.5,
                                  maxWidth: 440,
                                }}
                              >
                                {card.desc}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              !bonusResults[card.id] && runBonus(card.id)
                            }
                            disabled={bonusLoading === card.id}
                            style={{
                              background: bonusResults[card.id]
                                ? "#0a2014"
                                : "#20a050",
                              border: bonusResults[card.id]
                                ? "1px solid #1a4a24"
                                : "none",
                              borderRadius: 8,
                              padding: "8px 16px",
                              color: bonusResults[card.id] ? "#40a060" : "#fff",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: bonusResults[card.id]
                                ? "default"
                                : "pointer",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              fontFamily: "'DM Mono', monospace",
                              opacity: bonusLoading === card.id ? 0.6 : 1,
                              transition: "all 0.2s",
                            }}
                          >
                            {bonusLoading === card.id
                              ? "Generating..."
                              : bonusResults[card.id]
                                ? "✓ Done"
                                : "→ Generate"}
                          </button>
                        </div>
                        {bonusResults[card.id] && (
                          <div
                            style={{
                              marginTop: 16,
                              paddingTop: 16,
                              borderTop: "1px solid #0f2a18",
                            }}
                          >
                            <ResultBlock
                              text={bonusResults[card.id]}
                              stepNum={0}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <ResultBlock text={currentStepData} stepNum={step} />
                )}
              </div>

              {error && (
                <div
                  style={{ color: "#f08080", fontSize: 12, marginBottom: 16 }}
                >
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  style={{
                    background: "transparent",
                    border: "1px solid #0f2a18",
                    borderRadius: 10,
                    padding: "12px 24px",
                    color: "#507060",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "'DM Mono', monospace",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = "#30a050";
                    e.target.style.color = "#90d0a0";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = "#0f2a18";
                    e.target.style.color = "#507060";
                  }}
                >
                  ← Back
                </button>

                {step < TOTAL_STEPS && (
                  <button
                    className="run-btn"
                    onClick={() => run(step + 1)}
                    disabled={loading || !isStepDone(step)}
                    style={{
                      background: "#20a050",
                      border: "none",
                      borderRadius: 10,
                      padding: "12px 28px",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor:
                        loading || !isStepDone(step)
                          ? "not-allowed"
                          : "pointer",
                      opacity: loading || !isStepDone(step) ? 0.5 : 1,
                      transition: "all 0.2s",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    {loading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            border: "2px solid #fff4",
                            borderTop: "2px solid #fff",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                          }}
                        />
                        Running...
                      </span>
                    ) : step === 8 ? (
                      `Next: Bonus Toolkit →`
                    ) : (
                      `Next: Step ${step + 1} →`
                    )}
                  </button>
                )}

                {step === TOTAL_STEPS && isStepDone(TOTAL_STEPS) && (
                  <button
                    onClick={() => {
                      setStep(0);
                      setResults({});
                      setMarket("");
                    }}
                    style={{
                      background: "#0a2a14",
                      border: "1px solid #1a4a24",
                      borderRadius: 10,
                      padding: "12px 24px",
                      color: "#50c070",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "'DM Mono', monospace",
                      transition: "all 0.2s",
                    }}
                  >
                    ↺ Start Over
                  </button>
                )}
              </div>

              {/* Skip to any step if all previous done */}
              {step < TOTAL_STEPS && isStepDone(step) && !loading && (
                <div style={{ marginTop: 16, textAlign: "center" }}>
                  <span
                    style={{
                      color: "#304a38",
                      fontSize: 11,
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    or jump to any completed step above
                  </span>
                </div>
              )}
            </div>
          )}

          <div
            style={{
              marginTop: 60,
              borderTop: "1px solid #0a1e10",
              paddingTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#1e3a28",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              POWERED BY CLAUDE SONNET
            </span>
            <span
              style={{
                color: "#1e3a28",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              7-STEP SAAS FRAMEWORK
            </span>
          </div>
        </div>
      </div>
    </>
  );
}