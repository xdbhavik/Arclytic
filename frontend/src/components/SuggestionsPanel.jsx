import React, { useState } from 'react';

const injectCSS = () => {
  if (document.getElementById('sug-css')) return;
  const s = document.createElement('style'); s.id = 'sug-css';
  s.textContent = `
.sug-panel-title {
  display: flex; align-items: center; gap: 10px; margin-bottom: 22px;
}
.sug-panel-title-text {
  font-size: 11px; font-weight: 600; letter-spacing: .1em;
  text-transform: uppercase; color: rgba(248,248,250,.35);
  font-family: 'DM Mono', monospace;
}
.sug-panel-title-line { flex: 1; height: 1px; background: rgba(255,255,255,.06); }

.sug-grid { display: flex; flex-direction: column; gap: 14px; }

.sug-card {
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color .2s;
}
.sug-card:hover { border-color: rgba(255,255,255,.12); }

.sug-card-top {
  display: flex; align-items: center;
  border-bottom: 1px solid rgba(255,255,255,.06);
  background: rgba(255,255,255,.02);
  padding: 14px 18px;
  gap: 10px;
}

.sug-ep-badge {
  font-size: 10px; font-family: 'DM Mono', monospace; font-weight: 500;
  background: rgba(0,212,255,.1); border: 1px solid rgba(0,212,255,.2);
  border-radius: 4px; padding: 3px 8px; color: #00d4ff;
}

.sug-count-badge {
  font-size: 10px; font-family: 'DM Mono', monospace;
  background: rgba(167,139,250,.1); border: 1px solid rgba(167,139,250,.2);
  border-radius: 4px; padding: 3px 8px; color: #a78bfa;
}

.sug-list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 0;
}

.sug-item {
  display: flex; gap: 14px; align-items: flex-start;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,.04);
  transition: background .18s;
  cursor: default;
}
.sug-item:last-child { border-bottom: none; }
.sug-item:hover { background: rgba(255,255,255,.025); }

.sug-item-num {
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(0,212,255,.1); border: 1px solid rgba(0,212,255,.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 600;
  color: #00d4ff; font-family: 'DM Mono', monospace;
  flex-shrink: 0; margin-top: 1px;
}

.sug-item-text {
  font-size: 13px; color: rgba(248,248,250,.55);
  line-height: 1.7; font-weight: 300;
}

.sug-alt-hook {
  margin: 0 18px 16px;
  background: rgba(16,217,160,.05);
  border: 1px solid rgba(16,217,160,.15);
  border-left: 2px solid #10d9a0;
  border-radius: 0 8px 8px 0;
  padding: 12px 16px;
}

.sug-alt-hook-label {
  font-size: 9px; font-weight: 600; letter-spacing: .12em;
  text-transform: uppercase; font-family: 'DM Mono', monospace;
  color: #10d9a0; margin-bottom: 5px;
  display: flex; align-items: center; gap: 5px;
}

.sug-alt-hook-text {
  font-size: 12.5px; color: rgba(248,248,250,.5);
  line-height: 1.65; font-style: italic; font-weight: 300;
}
`;
  document.head.appendChild(s);
};

function SuggestionCard({ s }) {
  injectCSS();
  return (
    <div className="sug-card">
      <div className="sug-card-top">
        <span className="sug-ep-badge">E{String(s.episode_id).padStart(2,'0')}</span>
        <span className="sug-count-badge">{s.suggestions.length} suggestions</span>
      </div>

      <ul className="sug-list">
        {s.suggestions.map((text, i) => (
          <li key={i} className="sug-item">
            <div className="sug-item-num">{i + 1}</div>
            <span className="sug-item-text">{text}</span>
          </li>
        ))}
      </ul>

      {s.alternative_hook && (
        <div className="sug-alt-hook">
          <div className="sug-alt-hook-label"><span>🪝</span> Alternative Hook</div>
          <p className="sug-alt-hook-text">{s.alternative_hook}</p>
        </div>
      )}
    </div>
  );
}

export default function SuggestionsPanel({ suggestions }) {
  if (!suggestions?.length) return null;

  return (
    <div>
      <div className="sug-panel-title">
        <span className="sug-panel-title-text">Improvement Suggestions</span>
        <div className="sug-panel-title-line" />
      </div>
      <div className="sug-grid">
        {suggestions.map((s) => (
          <SuggestionCard key={s.episode_id} s={s} />
        ))}
      </div>
    </div>
  );
}
