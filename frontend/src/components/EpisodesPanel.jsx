import React, { useState } from 'react';

const injectCSS = () => {
  if (document.getElementById('ep-css')) return;
  const s = document.createElement('style'); s.id = 'ep-css';
  s.textContent = `
.ep-panel-title {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 22px;
}
.ep-panel-title-text {
  font-size: 11px; font-weight: 600; letter-spacing: .1em;
  text-transform: uppercase; color: rgba(248,248,250,.35);
  font-family: 'DM Mono', monospace;
}
.ep-panel-count {
  font-size: 10px; font-family: 'DM Mono', monospace;
  background: rgba(0,212,255,.1); border: 1px solid rgba(0,212,255,.2);
  border-radius: 4px; padding: 2px 7px; color: #00d4ff;
}
.ep-panel-title-line { flex: 1; height: 1px; background: rgba(255,255,255,.06); }

.ep-grid { display: flex; flex-direction: column; gap: 2px; }

.ep-card {
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color .2s;
}
.ep-card:hover { border-color: rgba(255,255,255,.1); }

.ep-card-header {
  display: flex; align-items: center; gap: 0;
  cursor: pointer; padding: 0;
  user-select: none;
}

.ep-num {
  width: 48px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 18px 0;
  font-size: 11px; font-family: 'DM Mono', monospace;
  color: rgba(248,248,250,.2);
  border-right: 1px solid rgba(255,255,255,.06);
  background: rgba(255,255,255,.02);
}

.ep-card.active-card .ep-num {
  color: #00d4ff;
  background: rgba(0,212,255,.06);
  border-right-color: rgba(0,212,255,.15);
}

.ep-header-mid {
  flex: 1;
  padding: 14px 18px;
  min-width: 0;
}

.ep-title-row {
  display: flex; align-items: baseline; gap: 10px; margin-bottom: 4px;
}

.ep-title {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 16px; font-weight: 400; font-style: italic;
  color: rgba(248,248,250,.9);
  letter-spacing: -.01em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.ep-genre-tag {
  font-size: 10px; font-family: 'DM Mono', monospace;
  background: rgba(139,92,246,.12); border: 1px solid rgba(139,92,246,.2);
  border-radius: 3px; padding: 1px 6px; color: #a78bfa; flex-shrink: 0;
}

.ep-summary-preview {
  font-size: 12.5px; color: rgba(248,248,250,.35);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  line-height: 1.5;
}

.ep-toggle {
  width: 40px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 18px 0;
  font-size: 12px; color: rgba(248,248,250,.2);
  border-left: 1px solid rgba(255,255,255,.06);
  font-family: 'DM Mono', monospace;
  transition: color .2s;
}
.ep-card-header:hover .ep-toggle { color: rgba(248,248,250,.5); }

.ep-body {
  border-top: 1px solid rgba(255,255,255,.06);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.ep-body-left {
  padding: 18px 20px;
  border-right: 1px solid rgba(255,255,255,.06);
}

.ep-body-right { padding: 18px 20px; }

.ep-section-label {
  font-size: 9.5px; font-weight: 600; letter-spacing: .1em;
  text-transform: uppercase; color: rgba(248,248,250,.25);
  font-family: 'DM Mono', monospace; margin-bottom: 10px;
}

.ep-summary-full {
  font-size: 13px; color: rgba(248,248,250,.55);
  line-height: 1.75; font-weight: 300;
}

.ep-events-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }

.ep-event-item {
  display: flex; gap: 9px; align-items: flex-start;
  font-size: 12.5px; color: rgba(248,248,250,.5); line-height: 1.55;
}

.ep-event-bullet {
  width: 4px; height: 4px; border-radius: 50%;
  background: #00d4ff; flex-shrink: 0; margin-top: 6px;
  box-shadow: 0 0 6px rgba(0,212,255,.5);
}

.ep-hook-wrap {
  margin-top: 14px;
  background: rgba(16,217,160,.06);
  border: 1px solid rgba(16,217,160,.15);
  border-left: 2px solid #10d9a0;
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
}

.ep-hook-label {
  font-size: 9px; font-weight: 600; letter-spacing: .12em;
  text-transform: uppercase; font-family: 'DM Mono', monospace;
  color: #10d9a0; margin-bottom: 4px;
}

.ep-hook-text {
  font-size: 12.5px; color: rgba(248,248,250,.55);
  line-height: 1.6; font-style: italic;
}
`;
  document.head.appendChild(s);
};

export default function EpisodesPanel({ episodes }) {
  injectCSS();
  const [open, setOpen] = useState(new Set([0]));

  if (!episodes?.length) return null;

  const toggle = (i) => {
    const n = new Set(open);
    n.has(i) ? n.delete(i) : n.add(i);
    setOpen(n);
  };

  return (
    <div>
      <div className="ep-panel-title">
        <span className="ep-panel-title-text">Episode Arc</span>
        <span className="ep-panel-count">{episodes.length} eps</span>
        <div className="ep-panel-title-line" />
      </div>

      <div className="ep-grid">
        {episodes.map((ep, i) => {
          const isOpen = open.has(i);
          return (
            <div key={ep.id} className={`ep-card ${isOpen ? 'active-card' : ''}`}>
              <div className="ep-card-header" onClick={() => toggle(i)}>
                <div className="ep-num">E{String(i + 1).padStart(2, '0')}</div>
                <div className="ep-header-mid">
                  <div className="ep-title-row">
                    <span className="ep-title">{ep.title}</span>
                  </div>
                  <div className="ep-summary-preview">{ep.summary}</div>
                </div>
                <div className="ep-toggle">{isOpen ? '−' : '+'}</div>
              </div>

              {isOpen && (
                <div className="ep-body">
                  <div className="ep-body-left">
                    <div className="ep-section-label">Summary</div>
                    <p className="ep-summary-full">{ep.summary}</p>
                  </div>
                  <div className="ep-body-right">
                    <div className="ep-section-label">Key Events</div>
                    <ul className="ep-events-list">
                      {ep.key_events.map((evt, j) => (
                        <li key={j} className="ep-event-item">
                          <div className="ep-event-bullet" />
                          {evt}
                        </li>
                      ))}
                    </ul>
                    {ep.hook && (
                      <div className="ep-hook-wrap">
                        <div className="ep-hook-label">↗ Hook</div>
                        <p className="ep-hook-text">{ep.hook}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
