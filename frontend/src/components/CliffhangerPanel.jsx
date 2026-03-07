import React from 'react';

const injectCSS = () => {
  if (document.getElementById('cliff-css')) return;
  const s = document.createElement('style'); s.id = 'cliff-css';
  s.textContent = `
.cliff-panel-title {
  display: flex; align-items: center; gap: 10px; margin-bottom: 22px;
}
.cliff-panel-title-text {
  font-size: 11px; font-weight: 600; letter-spacing: .1em;
  text-transform: uppercase; color: rgba(248,248,250,.35);
  font-family: 'DM Mono', monospace;
}
.cliff-panel-title-line { flex: 1; height: 1px; background: rgba(255,255,255,.06); }

.cliff-grid { display: flex; flex-direction: column; gap: 14px; }

.cliff-card {
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px; overflow: hidden;
  transition: border-color .2s;
}
.cliff-card:hover { border-color: rgba(255,255,255,.12); }

.cliff-card-top {
  display: flex; align-items: center; gap: 0;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.cliff-ep-col {
  width: 56px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 16px 0;
  border-right: 1px solid rgba(255,255,255,.06);
  font-size: 10px; font-family: 'DM Mono', monospace;
  color: rgba(248,248,250,.25);
  background: rgba(255,255,255,.02);
}

.cliff-title-col { flex: 1; padding: 14px 18px; }

.cliff-ep-label {
  font-size: 12px; font-weight: 500;
  color: rgba(248,248,250,.7);
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
}

.cliff-total-col {
  padding: 14px 20px;
  display: flex; align-items: center; gap: 10px;
  border-left: 1px solid rgba(255,255,255,.06);
}

.cliff-total-label {
  font-size: 9.5px; font-family: 'DM Mono', monospace;
  color: rgba(248,248,250,.25); letter-spacing: .08em;
  text-transform: uppercase;
}

.cliff-total-num {
  font-size: 24px; font-family: 'Instrument Serif', Georgia, serif;
  font-weight: 400; line-height: 1; letter-spacing: -.03em;
}

.cliff-total-max {
  font-size: 11px; color: rgba(248,248,250,.25);
  font-family: 'DM Mono', monospace; margin-left: 1px; margin-top: 6px;
}

.cliff-scores {
  display: grid; grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.cliff-score-box {
  padding: 16px 18px;
  border-right: 1px solid rgba(255,255,255,.06);
  position: relative; overflow: hidden;
}
.cliff-score-box:last-child { border-right: none; }

.cliff-score-label {
  font-size: 9.5px; font-family: 'DM Mono', monospace;
  letter-spacing: .09em; text-transform: uppercase;
  color: rgba(248,248,250,.3); margin-bottom: 8px;
}

.cliff-score-num {
  font-size: 22px; font-family: 'Instrument Serif', Georgia, serif;
  line-height: 1; letter-spacing: -.02em; margin-bottom: 10px;
}

.cliff-bar-track {
  height: 2px; background: rgba(255,255,255,.06); border-radius: 2px; overflow: hidden;
}
.cliff-bar-fill {
  height: 100%; border-radius: 2px;
  transform-origin: left;
  animation: bar-grow .8s cubic-bezier(.22,1,.36,1) both;
}

.cliff-explanation {
  padding: 14px 18px 16px;
  font-size: 12.5px; color: rgba(248,248,250,.35);
  line-height: 1.7; font-weight: 300;
}

.cliff-explanation-label {
  font-size: 9px; font-family: 'DM Mono', monospace;
  letter-spacing: .1em; text-transform: uppercase;
  color: rgba(248,248,250,.2); margin-bottom: 5px;
}

@keyframes bar-grow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
`;
  document.head.appendChild(s);
};

function scoreColor(val, max = 10) {
  const p = val / max;
  if (p >= .75) return { text: '#10d9a0', bar: 'linear-gradient(90deg,#00d4ff,#10d9a0)' };
  if (p >= .55) return { text: '#a78bfa', bar: 'linear-gradient(90deg,#8b5cf6,#a78bfa)' };
  if (p >= .35) return { text: '#fbbf24', bar: 'linear-gradient(90deg,#f59e0b,#fbbf24)' };
  return { text: 'rgba(248,248,250,.4)', bar: 'rgba(255,255,255,.15)' };
}

function totalColor(val, max = 10) {
  const p = val / max;
  if (p >= .75) return '#10d9a0';
  if (p >= .55) return '#00d4ff';
  if (p >= .35) return '#fbbf24';
  return 'rgba(248,248,250,.5)';
}

function ScoreBox({ label, value, max = 10 }) {
  const { text, bar } = scoreColor(value, max);
  return (
    <div className="cliff-score-box">
      <div className="cliff-score-label">{label}</div>
      <div className="cliff-score-num" style={{ color: text }}>{value.toFixed(1)}</div>
      <div className="cliff-bar-track">
        <div className="cliff-bar-fill" style={{ width: `${(value/max)*100}%`, background: bar }} />
      </div>
    </div>
  );
}

export default function CliffhangerPanel({ cliffhangers }) {
  injectCSS();
  if (!cliffhangers?.length) return null;

  return (
    <div>
      <div className="cliff-panel-title">
        <span className="cliff-panel-title-text">Cliffhanger Scores</span>
        <div className="cliff-panel-title-line" />
      </div>

      <div className="cliff-grid">
        {cliffhangers.map((c) => {
          const tc = totalColor(c.total);
          return (
            <div key={c.episode_id} className="cliff-card">
              {/* top row */}
              <div className="cliff-card-top">
                <div className="cliff-ep-col">E{String(c.episode_id).padStart(2,'0')}</div>
                <div className="cliff-title-col">
                  <div className="cliff-ep-label">Episode {c.episode_id}</div>
                </div>
                <div className="cliff-total-col">
                  <div>
                    <div className="cliff-total-label">Total Score</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                      <span className="cliff-total-num" style={{ color: tc }}>{c.total.toFixed(1)}</span>
                      <span className="cliff-total-max">/10</span>
                    </div>
                  </div>
                  {/* mini spark bar */}
                  <div style={{ width: 64, height: 32, display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                    {[c.tension, c.stakes, c.surprise, c.curiosity].map((v, i) => (
                      <div key={i} style={{
                        flex: 1, borderRadius: 2,
                        height: `${(v/10)*100}%`, minHeight: 4,
                        background: i === 0 ? '#00d4ff' : i === 1 ? '#a78bfa' : i === 2 ? '#fbbf24' : '#10d9a0',
                        opacity: .7,
                      }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* score cells */}
              <div className="cliff-scores">
                <ScoreBox label="Tension"   value={c.tension} />
                <ScoreBox label="Stakes"    value={c.stakes} />
                <ScoreBox label="Surprise"  value={c.surprise} />
                <ScoreBox label="Curiosity" value={c.curiosity} />
              </div>

              {/* explanation */}
              <div className="cliff-explanation">
                <div className="cliff-explanation-label">Analysis</div>
                {c.explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
