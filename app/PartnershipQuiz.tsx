"use client";
import { useState } from "react";

const NAVY = "#1B2A4A";
const GOLD = "#C4953A";
const LIGHT_GOLD = "#F5E6C8";
const BG = "#F8F7F4";

const CONTEXT_QUESTIONS = [
  {
    id: "duration",
    question: "How long have you been in this business partnership?",
    options: ["Less than 1 year", "1–3 years", "3–7 years", "7+ years"],
  },
  {
    id: "agreement",
    question: "Do you have a formal shareholders' or partnership agreement?",
    options: [
      "Yes, and we refer to it regularly",
      "Yes, but we rarely look at it",
      "We have something informal or verbal",
      "No formal agreement",
    ],
  },
  {
    id: "trigger",
    question: "What's prompting you to take this assessment today?",
    options: [
      "We're going through a difficult period",
      "Things are fine but I want to check in",
      "We're considering a major change or decision",
      "A specific incident has raised concerns",
      "My partner suggested it",
    ],
  },
];

const DIMENSIONS = [
  {
    id: "communication",
    name: "Communication & Transparency",
    icon: "💬",
    questions: [
      "We have regular, structured conversations about how the partnership is working — not just about the business.",
      "When something bothers me about our partnership, I say it directly rather than letting it build up.",
      "I feel confident my partner tells me the full picture, including things that might be uncomfortable.",
    ],
    insight: "Open, honest communication is the first thing that breaks down under pressure — and the hardest to rebuild.",
  },
  {
    id: "trust",
    name: "Trust & Mutual Respect",
    icon: "🤝",
    questions: [
      "I trust my partner to act in the best interests of the business, even when I'm not watching.",
      "We each respect the other's expertise and don't undermine each other's decisions in their area.",
      "When we disagree, we manage it without it damaging our relationship.",
    ],
    insight: "Trust is the invisible infrastructure of every partnership. When it erodes, everything becomes harder.",
  },
  {
    id: "decisions",
    name: "Decision-Making & Accountability",
    icon: "⚖️",
    questions: [
      "We have a clear, agreed process for how we make major decisions together.",
      "We both follow through on what we commit to, and call each other out respectfully when we don't.",
      "When something goes wrong, we take shared accountability rather than blame each other.",
    ],
    insight: "Unclear decision rights are the root cause of most partnership conflict — especially as the business grows.",
  },
  {
    id: "vision",
    name: "Shared Vision & Direction",
    icon: "🧭",
    questions: [
      "We are genuinely aligned on where we want to take this business in the next 3–5 years.",
      "We agree on the pace of growth — how ambitious to be, how much risk to take on.",
      "We have the same fundamental values about how the business should operate and treat people.",
    ],
    insight: "Partners can work well day-to-day while quietly diverging on where they're headed. This creates slow-burn conflict.",
  },
  {
    id: "clarity",
    name: "Roles, Responsibility & Fairness",
    icon: "🗂️",
    questions: [
      "There is clarity between us about who is responsible for what — and we respect those boundaries.",
      "The distribution of equity, salary, and recognition feels fair to both of us.",
      "We both feel equally committed to and invested in the success of this partnership.",
    ],
    insight: "Perceived unfairness is one of the most common — and most corrosive — sources of partnership breakdown.",
  },
];

const SCALE = [
  { value: 1, label: "Strongly\nDisagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly\nAgree" },
];

type ScoreBand = {
  label: string;
  description: string;
  color: string;
  nextStep: string;
};

function getScoreBand(score: number): ScoreBand {
  if (score >= 63)
    return {
      label: "Thriving Partnership",
      description:
        "Your partnership has strong, healthy foundations across all dimensions. You've built something genuinely rare — a business relationship that functions well even under pressure. The work now is to maintain and deepen what you have, and make sure you're building on these foundations as the business grows.",
      color: "#2E7D32",
      nextStep:
        "Book a Partnership Health Check to identify your one area of highest leverage — the small change that could take you from great to exceptional.",
    };
  if (score >= 48)
    return {
      label: "Solid Foundation, Room to Grow",
      description:
        "You have genuine strengths in this partnership — areas where you're working well together. But there are also patterns that, left unaddressed, tend to compound over time. The good news: you're catching this at the right moment. Partnerships in this range often make the biggest gains with focused attention on their specific weak points.",
      color: "#1565C0",
      nextStep:
        "Book a Partnership Health Check to turn your lowest-scoring dimension into a strength before it becomes a source of conflict.",
    };
  if (score >= 33)
    return {
      label: "Under Strain",
      description:
        "Your scores suggest there are real tensions in this partnership — tensions that are likely costing you both in terms of energy, performance, and possibly enjoyment of the business. These patterns are very common and they are workable. But they tend not to resolve on their own.",
      color: "#E65100",
      nextStep:
        "Book a Partnership Health Check. With the right support, partnerships in this zone can turn around significantly within a few months.",
    };
  return {
    label: "Needs Urgent Attention",
    description:
      "Your scores point to deep structural issues in this partnership. This doesn't necessarily mean the partnership is over — but the current way of operating is not sustainable, and things are unlikely to improve without deliberate intervention. What you do in the next 3–6 months will likely determine the outcome.",
    color: "#B71C1C",
    nextStep:
      "Book a Partnership Health Check as soon as possible. A clear-eyed assessment with professional support is the first step, whatever you decide to do.",
  };
}

function getDimensionLabel(score: number): string {
  if (score >= 13) return "Strong";
  if (score >= 10) return "Good";
  if (score >= 7) return "Developing";
  return "Needs Work";
}

function getDimensionColor(score: number): string {
  if (score >= 13) return "#2E7D32";
  if (score >= 10) return "#1565C0";
  if (score >= 7) return "#E65100";
  return "#B71C1C";
}

export default function PartnershipQuiz() {
  const [step, setStep] = useState<"welcome" | "context" | "quiz" | "capture" | "results">("welcome");
  const [contextIndex, setContextIndex] = useState(0);
  const [contextAnswers, setContextAnswers] = useState<Record<string, string>>({});
  const [dimensionIndex, setDimensionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [scores, setScores] = useState<number[][]>(DIMENSIONS.map(() => []));
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  const totalQuestions = DIMENSIONS.reduce((acc, d) => acc + d.questions.length, 0);
  const answeredQuestions = scores.reduce((acc, d) => acc + d.length, 0);
  const progress = (answeredQuestions / totalQuestions) * 100;

  const currentDimension = DIMENSIONS[dimensionIndex];
  const currentQuestion = currentDimension?.questions[questionIndex];

  const dimScores = scores.map((s) => s.reduce((a, b) => a + b, 0));
  const totalScore = dimScores.reduce((a, b) => a + b, 0);
  const scoreBand = getScoreBand(totalScore);

  const lowestDimIndex = dimScores.length > 0 ? dimScores.indexOf(Math.min(...dimScores)) : 0;
  const lowestDimName = DIMENSIONS[lowestDimIndex]?.name ?? "";

  function handleContextAnswer(answer: string) {
    const question = CONTEXT_QUESTIONS[contextIndex];
    const newAnswers = { ...contextAnswers, [question.id]: answer };
    setContextAnswers(newAnswers);
    if (contextIndex < CONTEXT_QUESTIONS.length - 1) {
      setContextIndex(contextIndex + 1);
    } else {
      setStep("quiz");
    }
  }

  function handleQuizAnswer(value: number) {
    if (animating) return;
    setSelected(value);
    setAnimating(true);
    setTimeout(() => {
      const newScores = scores.map((s, i) =>
        i === dimensionIndex ? [...s, value] : s
      );
      setScores(newScores);
      setSelected(null);
      setAnimating(false);
      if (questionIndex < currentDimension.questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
      } else if (dimensionIndex < DIMENSIONS.length - 1) {
        setDimensionIndex(dimensionIndex + 1);
        setQuestionIndex(0);
      } else {
        setStep("capture");
      }
    }, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/send-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          email,
          totalScore,
          dimScores,
          contextAnswers,
          lowestDimension: lowestDimName,
        }),
      });
    } catch {
      // Results still show even if email fails
    }
    setStep("results");
    setSubmitting(false);
  }

  // ── WELCOME ────────────────────────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <div style={{ minHeight: "100vh", background: NAVY, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", fontFamily: "Georgia, serif" }}>
        <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
          <p style={{ color: GOLD, fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24, fontFamily: "system-ui, sans-serif" }}>
            Partnership Health Assessment
          </p>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px, 6vw, 44px)", lineHeight: 1.2, marginBottom: 20, fontWeight: 700 }}>
            How healthy is your business partnership?
          </h1>
          <p style={{ color: "#C8D4E8", fontSize: "clamp(16px, 3vw, 18px)", lineHeight: 1.7, marginBottom: 36 }}>
            This 3-minute assessment measures your partnership across 5 critical dimensions. You'll get an honest score and insight into exactly where to focus.
          </p>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
            {["15 questions", "3 minutes", "Instant results"].map((tag) => (
              <span key={tag} style={{ background: "rgba(196,149,58,0.15)", border: `1px solid ${GOLD}`, color: GOLD, padding: "6px 16px", borderRadius: 20, fontSize: 13, fontFamily: "system-ui, sans-serif" }}>
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => setStep("context")}
            style={{ background: GOLD, color: "#fff", border: "none", padding: "16px 48px", borderRadius: 8, fontSize: 17, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui, sans-serif", width: "100%", maxWidth: 320 }}
          >
            Start the Assessment →
          </button>
          <p style={{ color: "#8A9BB5", fontSize: 13, marginTop: 20, fontFamily: "system-ui, sans-serif" }}>
            Your responses are confidential and used only to generate your results.
          </p>
        </div>
      </div>
    );
  }

  // ── CONTEXT QUESTIONS ──────────────────────────────────────────────────────
  if (step === "context") {
    const q = CONTEXT_QUESTIONS[contextIndex];
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ background: NAVY, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: GOLD, fontSize: 14, fontWeight: 600 }}>Partnership Health Assessment</span>
          <span style={{ color: "#8A9BB5", fontSize: 13, marginLeft: "auto" }}>Context · {contextIndex + 1} of {CONTEXT_QUESTIONS.length}</span>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
          <div style={{ maxWidth: 560, width: "100%" }}>
            <p style={{ color: GOLD, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
              Before we begin
            </p>
            <h2 style={{ color: NAVY, fontSize: "clamp(20px, 4vw, 26px)", lineHeight: 1.4, marginBottom: 32, fontFamily: "Georgia, serif" }}>
              {q.question}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {q.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleContextAnswer(option)}
                  style={{ background: "#fff", border: `2px solid #E0E7F0`, borderRadius: 10, padding: "16px 20px", textAlign: "left", fontSize: 15, color: NAVY, cursor: "pointer", transition: "all 0.15s", fontFamily: "system-ui, sans-serif" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = GOLD;
                    (e.currentTarget as HTMLButtonElement).style.background = LIGHT_GOLD;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#E0E7F0";
                    (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ QUESTIONS ─────────────────────────────────────────────────────────
  if (step === "quiz") {
    const isNewDimension = questionIndex === 0;
    const questionNumber = answeredQuestions + 1;

    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" }}>
        {/* Header */}
        <div style={{ background: NAVY, padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, maxWidth: 640, margin: "0 auto 10px" }}>
            <span style={{ color: GOLD, fontSize: 14, fontWeight: 600 }}>Partnership Health Assessment</span>
            <span style={{ color: "#8A9BB5", fontSize: 13 }}>{questionNumber} of {totalQuestions}</span>
          </div>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ background: GOLD, height: "100%", width: `${progress}%`, transition: "width 0.4s ease", borderRadius: 4 }} />
            </div>
          </div>
        </div>

        {/* Dimension badge */}
        {isNewDimension && (
          <div style={{ background: "#EEF2F8", borderBottom: "1px solid #D0DCF0", padding: "12px 24px" }}>
            <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{currentDimension.icon}</span>
              <div>
                <span style={{ fontSize: 11, color: "#6B7C9B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Dimension {dimensionIndex + 1} of {DIMENSIONS.length}
                </span>
                <div style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{currentDimension.name}</div>
              </div>
            </div>
          </div>
        )}

        {/* Question */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
          <div style={{ maxWidth: 600, width: "100%" }}>
            <p style={{ color: "#6B7C9B", fontSize: 13, marginBottom: 16 }}>
              {currentDimension.name} · Question {questionIndex + 1} of {currentDimension.questions.length}
            </p>
            <h2 style={{ color: NAVY, fontSize: "clamp(18px, 3.5vw, 24px)", lineHeight: 1.55, marginBottom: 40, fontFamily: "Georgia, serif" }}>
              &ldquo;{currentQuestion}&rdquo;
            </h2>

            {/* Scale */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#8A9BB5" }}>Strongly Disagree</span>
                <span style={{ fontSize: 12, color: "#8A9BB5" }}>Strongly Agree</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {SCALE.map(({ value }) => (
                  <button
                    key={value}
                    onClick={() => handleQuizAnswer(value)}
                    style={{
                      flex: 1,
                      aspectRatio: "1",
                      maxWidth: 72,
                      background: selected === value ? NAVY : "#fff",
                      border: `2px solid ${selected === value ? NAVY : "#D0DCF0"}`,
                      borderRadius: 10,
                      fontSize: 18,
                      fontWeight: 700,
                      color: selected === value ? "#fff" : NAVY,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (selected !== value) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = GOLD;
                        (e.currentTarget as HTMLButtonElement).style.background = LIGHT_GOLD;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selected !== value) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#D0DCF0";
                        (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                      }
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Insight for new dimension (after first question) */}
            {answeredQuestions > 0 && (
              <div style={{ marginTop: 32, padding: 16, background: "#EEF2F8", borderRadius: 8, borderLeft: `3px solid ${GOLD}` }}>
                <p style={{ margin: 0, fontSize: 13, color: "#4A5568", lineHeight: 1.6, fontStyle: "italic" }}>
                  {currentDimension.insight}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── EMAIL CAPTURE ──────────────────────────────────────────────────────────
  if (step === "capture") {
    return (
      <div style={{ minHeight: "100vh", background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ background: GOLD, borderRadius: "50%", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>
            ✓
          </div>
          <h2 style={{ color: "#fff", fontSize: "clamp(22px, 5vw, 32px)", marginBottom: 12, fontFamily: "Georgia, serif" }}>
            You&apos;ve completed the assessment
          </h2>
          <p style={{ color: "#C8D4E8", fontSize: 16, lineHeight: 1.6, marginBottom: 36 }}>
            Enter your details to see your full results across all 5 dimensions, including where your partnership is strongest and where to focus next.
          </p>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              type="text"
              placeholder="Your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              style={{ padding: "14px 18px", borderRadius: 8, border: "2px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 16, outline: "none", fontFamily: "system-ui, sans-serif" }}
            />
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: "14px 18px", borderRadius: 8, border: "2px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 16, outline: "none", fontFamily: "system-ui, sans-serif" }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{ background: GOLD, color: "#fff", border: "none", padding: "16px", borderRadius: 8, fontSize: 17, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, fontFamily: "system-ui, sans-serif" }}
            >
              {submitting ? "Sending your results…" : "See My Results →"}
            </button>
          </form>
          <p style={{ color: "#6B7C9B", fontSize: 12, marginTop: 16 }}>
            Your results will also be sent to your email. No spam — ever.
          </p>
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────
  const maxDimScore = 15;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: "24px 20px", textAlign: "center" }}>
        <p style={{ color: GOLD, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Your Results</p>
        <h1 style={{ color: "#fff", fontSize: "clamp(22px, 5vw, 34px)", margin: 0, fontFamily: "Georgia, serif" }}>
          Partnership Health Assessment
        </h1>
        {firstName && (
          <p style={{ color: "#C8D4E8", fontSize: 16, marginTop: 8 }}>
            {firstName}&apos;s results
          </p>
        )}
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px" }}>
        {/* Overall Score */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "center", border: `3px solid ${scoreBand.color}` }}>
          <p style={{ color: "#6B7C9B", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Overall Score</p>
          <div style={{ fontSize: "clamp(52px, 12vw, 72px)", fontWeight: 800, color: scoreBand.color, lineHeight: 1, marginBottom: 4 }}>
            {totalScore}
          </div>
          <div style={{ fontSize: 14, color: "#8A9BB5", marginBottom: 16 }}>out of 75</div>
          <div style={{ background: scoreBand.color, color: "#fff", display: "inline-block", padding: "8px 20px", borderRadius: 20, fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
            {scoreBand.label}
          </div>
          <p style={{ color: "#4A5568", fontSize: 15, lineHeight: 1.75, margin: 0, textAlign: "left" }}>
            {scoreBand.description}
          </p>
        </div>

        {/* Dimension Breakdown */}
        <h2 style={{ color: NAVY, fontSize: 20, fontFamily: "Georgia, serif", marginBottom: 16 }}>Your 5 Dimensions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
          {DIMENSIONS.map((dim, i) => {
            const score = dimScores[i];
            const pct = (score / maxDimScore) * 100;
            const label = getDimensionLabel(score);
            const color = getDimensionColor(score);
            const isLowest = i === lowestDimIndex;
            return (
              <div key={dim.id} style={{ background: "#fff", borderRadius: 12, padding: "20px 22px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: isLowest ? `2px solid ${GOLD}` : "2px solid transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{dim.icon}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{dim.name}</div>
                      {isLowest && (
                        <div style={{ fontSize: 11, color: GOLD, fontWeight: 600 }}>▲ Your lowest dimension</div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color }}>{score}<span style={{ fontSize: 13, color: "#8A9BB5" }}>/15</span></div>
                    <div style={{ fontSize: 12, color, fontWeight: 600 }}>{label}</div>
                  </div>
                </div>
                <div style={{ background: "#EEF2F8", borderRadius: 4, height: 8, overflow: "hidden" }}>
                  <div style={{ background: color, height: "100%", width: `${pct}%`, borderRadius: 4, transition: "width 0.8s ease" }} />
                </div>
                <p style={{ margin: "12px 0 0", fontSize: 13, color: "#6B7C9B", lineHeight: 1.6, fontStyle: "italic" }}>
                  {dim.insight}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ background: NAVY, borderRadius: 16, padding: "32px 28px", textAlign: "center", marginBottom: 32 }}>
          <p style={{ color: GOLD, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>What happens next</p>
          <h3 style={{ color: "#fff", fontSize: "clamp(18px, 4vw, 24px)", fontFamily: "Georgia, serif", marginBottom: 16 }}>
            {scoreBand.nextStep}
          </h3>
          <p style={{ color: "#C8D4E8", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
            In a Partnership Health Check, we spend 60 minutes looking at what your scores actually mean for your specific situation — and you leave with a clear picture of what to do next.
          </p>
          <a
            href="https://calendly.com/YOUR_LINK"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: GOLD, color: "#fff", display: "inline-block", padding: "16px 36px", borderRadius: 8, fontSize: 16, fontWeight: 600, textDecoration: "none" }}
          >
            Book a Free Partnership Health Check →
          </a>
        </div>

        <p style={{ textAlign: "center", color: "#8A9BB5", fontSize: 13 }}>
          A copy of your results has been sent to {email}
        </p>
      </div>
    </div>
  );
}
