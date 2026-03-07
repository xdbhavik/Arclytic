import React, { useState, useEffect, useRef } from 'react';
import InputForm from './components/InputForm.jsx';
import EpisodesPanel from './components/EpisodesPanel.jsx';
import EmotionalArcPanel from './components/EmotionalArcPanel.jsx';
import CliffhangerPanel from './components/CliffhangerPanel.jsx';
import RetentionPanel from './components/RetentionPanel.jsx';
import SuggestionsPanel from './components/SuggestionsPanel.jsx';

const API_BASE = '';

const TABS = [
  { id: 'episodes',    label: 'Episodes',      icon: '▤',  desc: 'Arc overview' },
  { id: 'emotional',  label: 'Emotional Arc',  icon: '∿',  desc: 'Intensity map' },
  { id: 'cliffhanger',label: 'Cliffhangers',   icon: '◈',  desc: 'Tension scores' },
  { id: 'retention',  label: 'Retention',      icon: '↗',  desc: 'Drop-off risk' },
  { id: 'suggestions',label: 'Suggestions',    icon: '◎',  desc: 'Improvements' },
];

/* ─── CSS ──────────────────────────────────────────────────────── */
const injectCSS = () => {
  if (document.getElementById('arc-css')) return;
  const s = document.createElement('style');
  s.id = 'arc-css';
  s.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Geist:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #0a0a0b;
  --bg1:       #0f0f11;
  --bg2:       #141416;
  --bg3:       #1a1a1e;
  --bg4:       #222228;
  --border:    rgba(255,255,255,0.06);
  --border2:   rgba(255,255,255,0.1);
  --border3:   rgba(255,255,255,0.16);
  --cyan:      #00d4ff;
  --cyan-dim:  rgba(0,212,255,0.12);
  --cyan-glow: rgba(0,212,255,0.06);
  --emerald:   #10d9a0;
  --amber:     #f59e0b;
  --rose:      #f43f5e;
  --violet:    #8b5cf6;
  --text0:     #f8f8fa;
  --text1:     rgba(248,248,250,0.75);
  --text2:     rgba(248,248,250,0.45);
  --text3:     rgba(248,248,250,0.25);
  --mono:      'DM Mono', monospace;
  --sans:      'Geist', system-ui, sans-serif;
  --serif:     'Instrument Serif', Georgia, serif;
  --radius:    12px;
  --radius-lg: 18px;
}

html, body { height: 100%; }

body {
  background: var(--bg);
  color: var(--text0);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 4px; }

/* ── Animations ── */
@keyframes fadeIn    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
@keyframes slideIn   { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }
@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.7)} }
@keyframes scan      { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
@keyframes grid-move { 0%{background-position:0 0} 100%{background-position:40px 40px} }
@keyframes spin      { to{transform:rotate(360deg)} }
@keyframes shimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
@keyframes bar-grow  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
@keyframes count-up  { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:none} }
@keyframes orbit     { from{transform:rotate(0deg) translateX(140px) rotate(0deg)} to{transform:rotate(360deg) translateX(140px) rotate(-360deg)} }

.anim-fade  { animation: fadeIn .45s ease both; }
.anim-fade2 { animation: fadeIn .45s .08s ease both; }
.anim-fade3 { animation: fadeIn .45s .16s ease both; }
.anim-fade4 { animation: fadeIn .45s .24s ease both; }
.anim-slide { animation: slideIn .35s ease both; }

/* ── Layout ── */
.arc-shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 52px 1fr;
  min-height: 100vh;
  position: relative;
}

/* ── Topbar ── */
.arc-topbar {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 0 24px;
  border-bottom: 1px solid var(--border);
  background: rgba(10,10,11,.9);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.arc-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.arc-logo-mark {
  width: 28px; height: 28px;
  background: linear-gradient(135deg, var(--cyan) 0%, var(--emerald) 100%);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
  color: #000;
  font-weight: 800;
  font-family: var(--mono);
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(0,212,255,0.25);
}

.arc-logo-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text0);
  letter-spacing: -0.01em;
}

.arc-logo-ver {
  font-size: 10px;
  font-family: var(--mono);
  color: var(--text3);
  margin-left: 2px;
}

.topbar-center {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 5px 14px;
  font-size: 12px;
  color: var(--text2);
  font-family: var(--mono);
  min-width: 220px;
  justify-content: center;
}

.topbar-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--emerald);
  box-shadow: 0 0 8px var(--emerald);
  animation: pulse-dot 2s ease infinite;
  flex-shrink: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-btn {
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: 8px;
  padding: 5px 14px;
  font-size: 12px;
  font-family: var(--sans);
  font-weight: 500;
  color: var(--text1);
  cursor: pointer;
  transition: all .2s;
}
.topbar-btn:hover { background: var(--bg3); border-color: var(--border3); color: var(--text0); }

.topbar-btn-primary {
  background: var(--cyan);
  border-color: var(--cyan);
  color: #000;
  font-weight: 700;
}
.topbar-btn-primary:hover { background: #22daff; box-shadow: 0 0 16px rgba(0,212,255,0.3); }

/* ── Sidebar ── */
.arc-sidebar {
  border-right: 1px solid var(--border);
  background: var(--bg1);
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  position: sticky;
  top: 52px;
  height: calc(100vh - 52px);
}

.sidebar-section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--text3);
  padding: 4px 10px 8px;
  margin-top: 10px;
}

.sidebar-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all .18s;
  font-family: var(--sans);
  position: relative;
}

.sidebar-tab:hover { background: var(--bg3); }

.sidebar-tab.active {
  background: var(--cyan-dim);
  border: 1px solid rgba(0,212,255,0.15);
}

.sidebar-tab.active::before {
  content: '';
  position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 2px;
  background: var(--cyan);
  border-radius: 2px;
  box-shadow: 0 0 8px var(--cyan);
}

.sidebar-icon {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  border-radius: 7px;
  background: var(--bg3);
  color: var(--text2);
  flex-shrink: 0;
  transition: all .18s;
  font-family: var(--mono);
}

.sidebar-tab.active .sidebar-icon {
  background: rgba(0,212,255,0.15);
  color: var(--cyan);
}

.sidebar-tab-content { flex: 1; min-width: 0; }

.sidebar-tab-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  display: block;
  transition: color .18s;
}

.sidebar-tab.active .sidebar-tab-label { color: var(--text0); }
.sidebar-tab:hover .sidebar-tab-label  { color: var(--text1); }

.sidebar-tab-desc {
  font-size: 10.5px;
  color: var(--text3);
  display: block;
  margin-top: 1px;
}

.sidebar-badge {
  font-size: 9px;
  font-family: var(--mono);
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--cyan-dim);
  color: var(--cyan);
  border: 1px solid rgba(0,212,255,0.2);
}

.sidebar-divider {
  height: 1px;
  background: var(--border);
  margin: 12px 8px;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.sidebar-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  font-size: 11px;
  color: var(--text3);
}

.sidebar-stat-val {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text2);
}

/* ── Main content ── */
.arc-main {
  background: var(--bg);
  overflow-y: auto;
  position: relative;
}

/* BG grid */
.arc-main::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: grid-move 30s linear infinite;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 20%, black, transparent);
}

.arc-content {
  position: relative;
  z-index: 1;
  padding: 32px 36px;
  max-width: 960px;
}

/* ── Hero area ── */
.arc-hero {
  margin-bottom: 36px;
}

.arc-hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.eyebrow-tag {
  font-size: 10px;
  font-family: var(--mono);
  font-weight: 500;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--cyan);
  background: var(--cyan-dim);
  border: 1px solid rgba(0,212,255,0.2);
  border-radius: 4px;
  padding: 3px 8px;
}

.eyebrow-slash {
  color: var(--text3);
  font-size: 12px;
}

.eyebrow-path {
  font-size: 12px;
  font-family: var(--mono);
  color: var(--text3);
}

.arc-hero-title {
  font-family: var(--serif);
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 400;
  font-style: italic;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text0);
  margin-bottom: 10px;
}

.arc-hero-title em {
  font-style: normal;
  background: linear-gradient(90deg, var(--cyan), var(--emerald));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.arc-hero-sub {
  font-size: 14px;
  font-weight: 300;
  color: var(--text2);
  line-height: 1.7;
  max-width: 520px;
}

/* ── Input panel ── */
.arc-input-panel {
  background: var(--bg1);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  padding: 28px 30px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}

.arc-input-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyan), var(--emerald), transparent);
  opacity: .6;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
}

.panel-header-icon {
  width: 30px; height: 30px;
  background: var(--cyan-dim);
  border: 1px solid rgba(0,212,255,0.2);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
  color: var(--cyan);
  font-family: var(--mono);
  flex-shrink: 0;
}

.panel-header-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text0);
  letter-spacing: -0.01em;
}

.panel-header-sub {
  font-size: 11.5px;
  color: var(--text3);
  margin-top: 1px;
}

.panel-header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── Error ── */
.arc-error {
  background: rgba(244,63,94,0.08);
  border: 1px solid rgba(244,63,94,0.25);
  border-radius: var(--radius);
  padding: 14px 18px;
  font-size: 13px;
  color: #f87171;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ── Loader ── */
.arc-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 80px 0;
}

.loader-ring-wrap {
  position: relative;
  width: 56px; height: 56px;
}

.loader-ring {
  width: 56px; height: 56px;
  border: 1.5px solid var(--border2);
  border-top: 1.5px solid var(--cyan);
  border-radius: 50%;
  animation: spin .9s linear infinite;
  box-shadow: 0 0 16px rgba(0,212,255,0.2);
}

.loader-ring-inner {
  position: absolute;
  top: 50%; left: 50%;
  width: 32px; height: 32px;
  margin: -16px;
  border: 1.5px solid var(--border2);
  border-bottom: 1.5px solid var(--emerald);
  border-radius: 50%;
  animation: spin .6s linear infinite reverse;
}

.loader-label {
  font-size: 13px;
  font-family: var(--mono);
  color: var(--text2);
  letter-spacing: .04em;
}

.loader-steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 240px;
}

.loader-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-family: var(--mono);
  color: var(--text3);
}

.loader-step.done  { color: var(--emerald); }
.loader-step.active{ color: var(--cyan); }

.loader-step-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.loader-step.active .loader-step-dot {
  animation: pulse-dot .8s ease infinite;
}

/* ── Results header ── */
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.results-title {
  font-size: 11px;
  font-family: var(--mono);
  color: var(--text3);
  letter-spacing: .08em;
  text-transform: uppercase;
}

.results-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-family: var(--mono);
  color: var(--text3);
}

.results-meta-chip {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 10px;
}

/* ── Panel container ── */
.arc-panel-wrap {
  background: var(--bg1);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.arc-panel-top {
  height: 1px;
  background: linear-gradient(90deg, var(--cyan), var(--emerald));
  opacity: .5;
}

.arc-panel-body {
  padding: 28px 30px;
}

/* ── Misc helpers ── */
.scan-line {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,212,255,.15), transparent);
  animation: scan 8s ease-in-out infinite;
  pointer-events: none;
  z-index: 200;
}
`;
  document.head.appendChild(s);
};

/* ── Loading steps animation ─────────────────────────────────── */
const STEPS = [
  'Parsing story structure…',
  'Building episode arcs…',
  'Scoring cliffhangers…',
  'Mapping emotional beats…',
  'Predicting retention…',
  'Generating suggestions…',
];

function LoaderSteps() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(p => Math.min(p + 1, STEPS.length - 1)), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="loader-steps">
      {STEPS.map((s, i) => (
        <div key={i} className={`loader-step ${i < active ? 'done' : i === active ? 'active' : ''}`}>
          <div className="loader-step-dot" />
          {i < active ? '✓ ' : ''}{s}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  injectCSS();

  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [activeTab, setActiveTab] = useState('episodes');
  const [genTime,   setGenTime]   = useState(null);
  const mainRef = useRef(null);

  const handleAnalyse = async (payload) => {
    setLoading(true); setError(null); setData(null);
    const t0 = Date.now();
    try {
      const res = await fetch(`${API_BASE}/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const t = await res.text(); throw new Error(`${res.status}: ${t}`); }
      const result = await res.json();
      setData(result);
      setGenTime(((Date.now() - t0) / 1000).toFixed(1));
      setActiveTab('episodes');
      setTimeout(() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } catch (err) {
      setError(err.message || 'Failed to connect. Is the backend running?');
    } finally { setLoading(false); }
  };

  const episodeCount = data?.episodes?.length ?? 0;

  return (
    <div className="arc-shell">
      <div className="scan-line" />

      {/* ── TOPBAR ── */}
      <header className="arc-topbar">
        <a href="#" className="arc-logo">
          <div className="arc-logo-mark">A</div>
          <span className="arc-logo-text">
            Arclight<span className="arc-logo-ver"> v2</span>
          </span>
        </a>

        <div className="topbar-center">
          <div className="topbar-dot" />
          AI Episodic Intelligence Engine
        </div>

        <div className="topbar-right">
          <button className="topbar-btn">Docs</button>
          <button className="topbar-btn">API</button>
          <button className="topbar-btn topbar-btn-primary">Upgrade</button>
        </div>
      </header>

      {/* ── SIDEBAR ── */}
      <aside className="arc-sidebar">
        <div className="sidebar-section-label">Analysis</div>

        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id && data ? 'active' : ''}`}
            onClick={() => data && setActiveTab(tab.id)}
            style={{ opacity: data ? 1 : 0.4, cursor: data ? 'pointer' : 'not-allowed' }}
          >
            <div className="sidebar-icon">{tab.icon}</div>
            <div className="sidebar-tab-content">
              <span className="sidebar-tab-label">{tab.label}</span>
              <span className="sidebar-tab-desc">{tab.desc}</span>
            </div>
            {activeTab === tab.id && data && (
              <span className="sidebar-badge">●</span>
            )}
          </button>
        ))}

        <div className="sidebar-divider" />

        {data && (
          <div className="sidebar-footer">
            <div className="sidebar-section-label" style={{ marginTop: 0 }}>Session</div>
            <div className="sidebar-stat">
              <span>Episodes</span>
              <span className="sidebar-stat-val">{episodeCount}</span>
            </div>
            {genTime && (
              <div className="sidebar-stat">
                <span>Gen time</span>
                <span className="sidebar-stat-val">{genTime}s</span>
              </div>
            )}
            <div className="sidebar-stat">
              <span>Model</span>
              <span className="sidebar-stat-val">arc-v2</span>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <main className="arc-main" ref={mainRef}>
        <div className="arc-content">

          {/* Hero */}
          <div className="arc-hero anim-fade">
            <div className="arc-hero-eyebrow">
              <span className="eyebrow-tag">Studio</span>
              <span className="eyebrow-slash">/</span>
              <span className="eyebrow-path">new-analysis</span>
            </div>
            <h1 className="arc-hero-title">
              Transform stories into<br /><em>structured episode arcs.</em>
            </h1>
            <p className="arc-hero-sub">
              Paste your story premise below. Arclight will analyse narrative structure, map emotional beats, score cliffhangers, and predict viewer retention — all in one run.
            </p>
          </div>

          {/* Input */}
          <div className="arc-input-panel anim-fade2">
            <div className="panel-header">
              <div className="panel-header-icon">✎</div>
              <div>
                <div className="panel-header-title">Story Premise</div>
                <div className="panel-header-sub">Describe your narrative in detail</div>
              </div>
              <div className="panel-header-right">
                {loading && <div className="loader-ring" style={{ width: 18, height: 18, borderWidth: 1.5, boxShadow: 'none' }} />}
              </div>
            </div>
            <InputForm onSubmit={handleAnalyse} loading={loading} />
          </div>

          {/* Error */}
          {error && (
            <div className="arc-error anim-fade">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Loader */}
          {loading && (
            <div className="arc-loader anim-fade">
              <div className="loader-ring-wrap">
                <div className="loader-ring" />
                <div className="loader-ring-inner" />
              </div>
              <div className="loader-label">analysing narrative…</div>
              <LoaderSteps />
            </div>
          )}

          {/* Results */}
          {data && !loading && (
            <div className="anim-fade3">
              <div className="results-header">
                <span className="results-title">Analysis results</span>
                <div className="results-meta">
                  <span className="results-meta-chip">{episodeCount} episodes</span>
                  {genTime && <span className="results-meta-chip">{genTime}s</span>}
                  <span className="results-meta-chip">arc-v2</span>
                </div>
              </div>

              <div className="arc-panel-wrap anim-fade4">
                <div className="arc-panel-top" />
                <div className="arc-panel-body">
                  {activeTab === 'episodes'    && <EpisodesPanel    episodes={data.episodes} />}
                  {activeTab === 'emotional'   && <EmotionalArcPanel emotionalArc={data.emotional_arc} />}
                  {activeTab === 'cliffhanger' && <CliffhangerPanel  cliffhangers={data.cliffhangers} />}
                  {activeTab === 'retention'   && <RetentionPanel    retentionRisk={data.retention_risk} />}
                  {activeTab === 'suggestions' && <SuggestionsPanel  suggestions={data.suggestions} />}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
