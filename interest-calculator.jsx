import { useState, useMemo } from "react";

const fmtCur = (n) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.abs(n));

function toWords(n) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)} K`;
  return sign + fmtCur(abs);
}

const PRESETS_P = [
  { label: "₹10K", value: 10000 },
  { label: "₹25K", value: 25000 },
  { label: "₹1L", value: 100000 },
  { label: "₹10L", value: 1000000 },
];

const PRESETS_TARGET = [
  { label: "₹10L", value: 1000000 },
  { label: "₹1Cr", value: 10000000 },
  { label: "₹10Cr", value: 100000000 },
  { label: "₹56Cr", value: 560000000 },
];

// monthlyRate is already the per-month rate (e.g. 0.078 for 7.8%)
function simulate(principal, monthlyRate, monthlyExpense, months) {
  let balance = principal;
  let totalInterest = 0;
  let totalWithdrawn = 0;
  const history = [];

  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const withdrawal = Math.min(monthlyExpense, Math.max(0, balance + interest));
    const net = interest - withdrawal;
    balance = balance + net;
    totalInterest += interest;
    totalWithdrawn += withdrawal;
    history.push({ month: i, balance, interest, withdrawal, net });
  }

  return { finalBalance: balance, totalInterest, totalWithdrawn, history };
}

function calcPrincipal(target, monthlyRate, monthlyExpense, months) {
  if (monthlyRate === 0) return target + monthlyExpense * months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (target + monthlyExpense * ((factor - 1) / monthlyRate)) / factor;
}

export default function App() {
  const [tab, setTab] = useState("forward");

  // Forward
  const [fP, setFP] = useState("25000");
  const [fRate, setFRate] = useState("7.8");
  const [fRateMode, setFRateMode] = useState("monthly"); // "monthly" | "annual"
  const [fMonths, setFMonths] = useState("120");
  const [fExp, setFExp] = useState("");

  // Backward
  const [bTarget, setBTarget] = useState("");
  const [bRate, setBRate] = useState("");
  const [bRateMode, setBRateMode] = useState("monthly");
  const [bMonths, setBMonths] = useState("");
  const [bExp, setBExp] = useState("");
  const [bInitial, setBInitial] = useState("");

  const getMonthlyRate = (rate, mode) => {
    const r = parseFloat(rate) / 100;
    return mode === "monthly" ? r : r / 12;
  };

  const fResult = useMemo(() => {
    const p = parseFloat(fP), n = parseInt(fMonths);
    if (!p || !fRate || !n) return null;
    const mr = getMonthlyRate(fRate, fRateMode);
    return simulate(p, mr, parseFloat(fExp) || 0, n);
  }, [fP, fRate, fRateMode, fMonths, fExp]);

  const bResult = useMemo(() => {
    const t = parseFloat(bTarget), n = parseInt(bMonths);
    if (!t || !bRate || !n) return null;
    const mr = getMonthlyRate(bRate, bRateMode);
    const totalNeeded = calcPrincipal(t, mr, parseFloat(bExp) || 0, n);
    const alreadyHave = parseFloat(bInitial) || 0;
    const stillNeeded = Math.max(0, totalNeeded - alreadyHave);
    return { principal: totalNeeded, alreadyHave, stillNeeded, ...simulate(totalNeeded, mr, parseFloat(bExp) || 0, n) };
  }, [bTarget, bRate, bRateMode, bMonths, bExp, bInitial]);

  const s = {
    root: {
      minHeight: "100vh",
      background: "#0d0d0d",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Georgia', serif",
    },
    card: {
      width: "100%",
      maxWidth: 540,
      background: "#141414",
      border: "1px solid #2a2a2a",
      borderRadius: 2,
      overflow: "hidden",
      boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
    },
    header: {
      background: "#0d0d0d",
      padding: "24px 28px 18px",
      borderBottom: "1px solid #222",
    },
    eyebrow: {
      fontFamily: "'Courier New', monospace",
      fontSize: 9, letterSpacing: "0.3em",
      color: "#c9a84c", textTransform: "uppercase", marginBottom: 6,
    },
    title: { fontSize: 20, fontWeight: 400, color: "#f0ead6", margin: 0 },
    subtitle: {
      fontFamily: "'Courier New', monospace",
      fontSize: 10, color: "#444", marginTop: 7, lineHeight: 1.6,
    },
    tabs: { display: "flex", borderBottom: "1px solid #222", background: "#0d0d0d" },
    tab: (a) => ({
      flex: 1, padding: "13px 0", background: "none", border: "none",
      borderBottom: a ? "2px solid #c9a84c" : "2px solid transparent",
      color: a ? "#c9a84c" : "#555",
      fontFamily: "'Courier New', monospace", fontSize: 10,
      letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
    }),
    body: { padding: "22px 28px" },
    label: {
      display: "block",
      fontFamily: "'Courier New', monospace", fontSize: 9,
      letterSpacing: "0.2em", color: "#666", textTransform: "uppercase", marginBottom: 7,
    },
    inputWrap: { display: "flex", gap: 0 },
    input: {
      flex: 1, background: "#0a0a0a", border: "1px solid #252525",
      borderRight: "none",
      borderRadius: "1px 0 0 1px", padding: "10px 13px", color: "#f0ead6",
      fontFamily: "'Courier New', monospace", fontSize: 14,
      outline: "none", boxSizing: "border-box",
    },
    inputPlain: {
      width: "100%", background: "#0a0a0a", border: "1px solid #252525",
      borderRadius: 1, padding: "10px 13px", color: "#f0ead6",
      fontFamily: "'Courier New', monospace", fontSize: 14,
      outline: "none", boxSizing: "border-box",
    },
    modeToggle: {
      display: "flex",
      border: "1px solid #252525",
      borderRadius: "0 1px 1px 0",
      overflow: "hidden",
    },
    modeBtn: (a) => ({
      padding: "0 10px",
      background: a ? "#c9a84c" : "#0a0a0a",
      color: a ? "#0d0d0d" : "#555",
      border: "none",
      fontFamily: "'Courier New', monospace", fontSize: 9,
      letterSpacing: "0.1em", textTransform: "uppercase",
      cursor: "pointer", whiteSpace: "nowrap",
    }),
    field: { marginBottom: 16 },
    row: { display: "flex", gap: 14 },
    presets: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 7 },
    preset: (a) => ({
      padding: "4px 9px",
      fontFamily: "'Courier New', monospace", fontSize: 9,
      background: a ? "#c9a84c" : "transparent",
      color: a ? "#0d0d0d" : "#c9a84c",
      border: "1px solid #c9a84c", borderRadius: 1, cursor: "pointer",
    }),
    divider: { height: 1, background: "#1a1a1a", margin: "8px 0 20px" },
    box: {
      background: "#0a0a0a", border: "1px solid #1e1e1e",
      borderRadius: 2, padding: "18px 22px",
    },
    rRow: {
      display: "flex", justifyContent: "space-between",
      alignItems: "baseline", marginBottom: 12,
    },
    rLabel: {
      fontFamily: "'Courier New', monospace", fontSize: 9,
      letterSpacing: "0.12em", color: "#555", textTransform: "uppercase",
    },
    rVal: { fontFamily: "'Georgia', serif", fontSize: 15, color: "#c8c0a8", fontStyle: "italic" },
    sectionHead: {
      fontFamily: "'Courier New', monospace", fontSize: 9,
      letterSpacing: "0.2em", color: "#333", textTransform: "uppercase",
      borderTop: "1px solid #1e1e1e", paddingTop: 14, marginTop: 6, marginBottom: 12,
    },
    barRow: { marginBottom: 10 },
    barTop: { display: "flex", justifyContent: "space-between", marginBottom: 5 },
    barTrack: { background: "#1a1a1a", borderRadius: 1, height: 5 },
    bigRow: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderTop: "1px solid #222", paddingTop: 14, marginTop: 8,
    },
    bigLabel: {
      fontFamily: "'Courier New', monospace", fontSize: 9,
      letterSpacing: "0.15em", textTransform: "uppercase",
    },
    bigVal: { fontFamily: "'Georgia', serif", fontSize: 26 },
    badge: (pos) => ({
      fontFamily: "'Courier New', monospace", fontSize: 8,
      padding: "2px 6px", borderRadius: 1,
      background: pos ? "rgba(111,207,151,0.12)" : "rgba(235,87,87,0.12)",
      color: pos ? "#6fcf97" : "#eb5757",
      marginLeft: 8, letterSpacing: "0.1em",
    }),
    empty: {
      textAlign: "center", fontFamily: "'Courier New', monospace",
      fontSize: 9, letterSpacing: "0.2em", color: "#272727",
      textTransform: "uppercase", padding: "24px 0",
    },
    hint: {
      fontFamily: "'Courier New', monospace", fontSize: 9,
      color: "#c9a84c", marginTop: 6, letterSpacing: "0.05em",
    },
  };

  const MiniBar = ({ label, value, max, color }) => {
    const pct = max > 0 ? (Math.abs(value) / max) * 100 : 0;
    return (
      <div style={s.barRow}>
        <div style={s.barTop}>
          <span style={s.rLabel}>{label}</span>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color }}>{toWords(value)}</span>
        </div>
        <div style={s.barTrack}>
          <div style={{ height: 5, width: `${Math.min(100, pct)}%`, background: color, borderRadius: 1 }} />
        </div>
      </div>
    );
  };

  const RateField = ({ label, rate, setRate, mode, setMode }) => (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <div style={s.inputWrap}>
        <input style={s.input} type="number" placeholder="e.g. 7.8"
          value={rate} onChange={e => setRate(e.target.value)} />
        <div style={s.modeToggle}>
          <button style={s.modeBtn(mode === "monthly")} onClick={() => setMode("monthly")}>%/mo</button>
          <button style={s.modeBtn(mode === "annual")} onClick={() => setMode("annual")}>%/yr</button>
        </div>
      </div>
      {rate && (
        <div style={s.hint}>
          {mode === "monthly"
            ? `= ${(parseFloat(rate) * 12).toFixed(1)}% per year`
            : `= ${(parseFloat(rate) / 12).toFixed(2)}% per month`}
        </div>
      )}
    </div>
  );

  const Results = ({ r, months, principalValue, principalLabel, alreadyHave, stillNeeded }) => {
    const h0 = r.history[0];
    const growing = r.finalBalance >= (principalValue || 0);
    const maxBar = Math.max(r.totalInterest, r.totalWithdrawn, Math.abs(principalValue || 0)) || 1;

    return (
      <div style={s.box}>
        <div style={s.rRow}>
          <span style={s.rLabel}>Month 1 — Interest</span>
          <span style={{ ...s.rVal, color: "#c9a84c" }}>+ {fmtCur(h0.interest)}</span>
        </div>
        <div style={s.rRow}>
          <span style={s.rLabel}>Month 1 — Withdrawal</span>
          <span style={{ ...s.rVal, color: "#eb5757" }}>− {fmtCur(h0.withdrawal)}</span>
        </div>
        <div style={s.rRow}>
          <span style={s.rLabel}>Month 1 — Net Compounded</span>
          <span style={{ ...s.rVal, color: h0.net >= 0 ? "#6fcf97" : "#eb5757" }}>
            {h0.net >= 0 ? "+" : "−"}{fmtCur(h0.net)}
          </span>
        </div>

        <div style={s.sectionHead}>After {months} months</div>
        <MiniBar label="Total Interest Earned" value={r.totalInterest} max={maxBar} color="#c9a84c" />
        <MiniBar label="Total Withdrawn" value={r.totalWithdrawn} max={maxBar} color="#eb5757" />

        {principalLabel && (
          <div style={{ ...s.bigRow, borderTop: "none", paddingTop: 0, marginTop: 4, marginBottom: 12 }}>
            <span style={{ ...s.bigLabel, color: "#c9a84c" }}>{principalLabel}</span>
            <span style={{ fontFamily: "'Georgia', serif", fontSize: 18, color: "#c9a84c" }}>{toWords(principalValue)}</span>
          </div>
        )}

        {alreadyHave !== undefined && alreadyHave > 0 && (
          <>
            <div style={{ ...s.rRow, marginBottom: 8 }}>
              <span style={s.rLabel}>You already have</span>
              <span style={{ ...s.rVal, color: "#6fcf97" }}>{toWords(alreadyHave)}</span>
            </div>
            <div style={{ ...s.bigRow, borderTop: "1px solid #2a2a2a", paddingTop: 14, marginTop: 4 }}>
              <div>
                <span style={{ ...s.bigLabel, color: "#c9a84c" }}>Still Need</span>
              </div>
              <span style={{ ...s.bigVal, color: "#c9a84c" }}>{toWords(stillNeeded)}</span>
            </div>
          </>
        )}

        {alreadyHave === undefined && (
          <div style={s.bigRow}>
            <div>
              <span style={{ ...s.bigLabel, color: growing ? "#6fcf97" : "#eb5757" }}>
                Final Balance
              </span>
              <span style={s.badge(growing)}>{growing ? "GROWING" : "DEPLETING"}</span>
            </div>
            <span style={{ ...s.bigVal, color: growing ? "#6fcf97" : "#eb5757" }}>
              {toWords(r.finalBalance)}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={s.root}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.eyebrow}>Compound + Withdrawal</div>
          <h1 style={s.title}>Rupee Interest Planner</h1>
          <div style={s.subtitle}>
            Each month: interest earned → expense deducted → remainder compounds
          </div>
        </div>

        <div style={s.tabs}>
          <button style={s.tab(tab === "forward")} onClick={() => setTab("forward")}>→ Forward</button>
          <button style={s.tab(tab === "backward")} onClick={() => setTab("backward")}>← Backward</button>
        </div>

        <div style={s.body}>
          {tab === "forward" ? (
            <>
              <div style={s.field}>
                <label style={s.label}>Starting Amount</label>
                <input style={s.inputPlain} type="number" placeholder="e.g. 25000"
                  value={fP} onChange={e => setFP(e.target.value)} />
                <div style={s.presets}>
                  {PRESETS_P.map(p => (
                    <button key={p.value} style={s.preset(parseFloat(fP) === p.value)}
                      onClick={() => setFP(String(p.value))}>{p.label}</button>
                  ))}
                </div>
              </div>

              <div style={s.row}>
                <div style={{ flex: 1 }}>
                  <RateField label="Return Rate" rate={fRate} setRate={setFRate}
                    mode={fRateMode} setMode={setFRateMode} />
                </div>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Months</label>
                  <input style={s.inputPlain} type="number" placeholder="e.g. 120"
                    value={fMonths} onChange={e => setFMonths(e.target.value)} />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Monthly Withdrawal / Expense (optional)</label>
                <input style={s.inputPlain} type="number" placeholder="e.g. 5000"
                  value={fExp} onChange={e => setFExp(e.target.value)} />
              </div>

              <div style={s.divider} />

              {fResult
                ? <Results r={fResult} months={fMonths} principalValue={parseFloat(fP)} />
                : <div style={s.empty}>Enter values to see results</div>}
            </>
          ) : (
            <>
              <div style={s.field}>
                <label style={s.label}>Current / Initial Balance (what you already have)</label>
                <input style={s.inputPlain} type="number" placeholder="e.g. 25000"
                  value={bInitial} onChange={e => setBInitial(e.target.value)} />
                <div style={s.presets}>
                  {PRESETS_P.map(p => (
                    <button key={p.value} style={s.preset(parseFloat(bInitial) === p.value)}
                      onClick={() => setBInitial(String(p.value))}>{p.label}</button>
                  ))}
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Target Final Balance</label>
                <input style={s.inputPlain} type="number" placeholder="e.g. 560000000"
                  value={bTarget} onChange={e => setBTarget(e.target.value)} />
                <div style={s.presets}>
                  {PRESETS_TARGET.map(p => (
                    <button key={p.value} style={s.preset(parseFloat(bTarget) === p.value)}
                      onClick={() => setBTarget(String(p.value))}>{p.label}</button>
                  ))}
                </div>
              </div>

              <div style={s.row}>
                <div style={{ flex: 1 }}>
                  <RateField label="Return Rate" rate={bRate} setRate={setBRate}
                    mode={bRateMode} setMode={setBRateMode} />
                </div>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Months</label>
                  <input style={s.inputPlain} type="number" placeholder="e.g. 120"
                    value={bMonths} onChange={e => setBMonths(e.target.value)} />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Monthly Withdrawal / Expense (optional)</label>
                <input style={s.inputPlain} type="number" placeholder="e.g. 5000"
                  value={bExp} onChange={e => setBExp(e.target.value)} />
              </div>

              <div style={s.divider} />

              {bResult
                ? <Results r={bResult} months={bMonths}
                    principalLabel="Total Starting Amount Needed"
                    principalValue={bResult.principal}
                    alreadyHave={bResult.alreadyHave}
                    stillNeeded={bResult.stillNeeded} />
                : <div style={s.empty}>Enter values to see results</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
