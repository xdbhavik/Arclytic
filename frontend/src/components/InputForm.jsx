import React, { useState, useRef } from 'react';

const css = `
.iform-root { display: flex; flex-direction: column; gap: 18px; }

.iform-group { display: flex; flex-direction: column; gap: 7px; }

.iform-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .09em;
  text-transform: uppercase;
  color: rgba(248,248,250,0.35);
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'DM Mono', monospace;
}

.iform-label-req {
  color: #00d4ff;
  font-size: 13px;
  line-height: 1;
}

.iform-textarea {
  width: 100%;
  min-height: 110px;
  resize: vertical;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: rgba(248,248,250,0.9);
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 300;
  line-height: 1.7;
  padding: 13px 16px;
  outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
  box-sizing: border-box;
}

.iform-textarea::placeholder { color: rgba(248,248,250,0.2); }

.iform-textarea:focus {
  border-color: rgba(0,212,255,0.35);
  background: rgba(0,212,255,0.03);
  box-shadow: 0 0 0 3px rgba(0,212,255,0.06), inset 0 0 20px rgba(0,212,255,0.02);
}

.iform-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.iform-input, .iform-select {
  width: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: rgba(248,248,250,0.9);
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 13.5px;
  font-weight: 400;
  padding: 10px 14px;
  outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
  box-sizing: border-box;
}

.iform-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(248,248,250,.3)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.iform-select option { background: #141416; color: #f8f8fa; }

.iform-input::placeholder { color: rgba(248,248,250,.2); }

.iform-input:focus, .iform-select:focus {
  border-color: rgba(0,212,255,.35);
  background: rgba(0,212,255,.03);
  box-shadow: 0 0 0 3px rgba(0,212,255,.06);
}

.iform-char-count {
  font-size: 10px;
  font-family: 'DM Mono', monospace;
  color: rgba(248,248,250,.2);
  text-align: right;
  transition: color .2s;
}

.iform-char-count.warn { color: #f59e0b; }

.iform-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.iform-hints {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.iform-hint-chip {
  font-size: 11px;
  font-family: 'DM Mono', monospace;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 5px;
  padding: 4px 10px;
  color: rgba(248,248,250,.3);
  cursor: pointer;
  transition: all .18s;
}

.iform-hint-chip:hover {
  background: rgba(0,212,255,.08);
  border-color: rgba(0,212,255,.2);
  color: #00d4ff;
}

.iform-submit {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #00d4ff 0%, #10d9a0 100%);
  border: none;
  border-radius: 10px;
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  color: #000;
  cursor: pointer;
  overflow: hidden;
  transition: transform .18s, box-shadow .22s, opacity .2s;
  letter-spacing: -.01em;
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0,212,255,.2);
  flex-shrink: 0;
}

.iform-submit::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
  pointer-events: none;
}

.iform-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 28px rgba(0,212,255,.35);
}

.iform-submit:active:not(:disabled) {
  transform: translateY(0) scale(.98);
}

.iform-submit:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.iform-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(0,0,0,.3);
  border-top: 2px solid #000;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }
`;

const GENRE_HINTS = ['thriller', 'romance', 'sci-fi', 'horror', 'fantasy', 'drama'];
const EXAMPLE = 'A disgraced forensic archivist uncovers a 40-year-old pattern buried in cold-case files, realising the killer never stopped — they just became invisible.';

export default function InputForm({ onSubmit, loading }) {
  const [storyIdea,      setStoryIdea]      = useState('');
  const [targetEpisodes, setTargetEpisodes] = useState(6);
  const [genreHint,      setGenreHint]      = useState('');
  const textareaRef = useRef(null);

  // inject once
  if (!document.getElementById('iform-css')) {
    const s = document.createElement('style'); s.id = 'iform-css'; s.textContent = css;
    document.head.appendChild(s);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!storyIdea.trim() || loading) return;
    onSubmit({ story_idea: storyIdea.trim(), target_episodes: targetEpisodes, genre_hint: genreHint.trim() || null });
  };

  const fillExample = () => { setStoryIdea(EXAMPLE); textareaRef.current?.focus(); };
  const charPct = storyIdea.length / 2000;

  return (
    <form className="iform-root" onSubmit={handleSubmit}>
      {/* Story idea */}
      <div className="iform-group">
        <label className="iform-label">
          Story Premise <span className="iform-label-req">*</span>
        </label>
        <textarea
          ref={textareaRef}
          className="iform-textarea"
          value={storyIdea}
          onChange={(e) => setStoryIdea(e.target.value)}
          placeholder="Describe your story idea — the more detail, the richer the arc analysis…"
          required minLength={10}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="iform-hints">
            <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: 'rgba(248,248,250,.2)', marginRight: 4 }}>try:</span>
            {GENRE_HINTS.map(h => (
              <button type="button" key={h} className="iform-hint-chip"
                onClick={() => setGenreHint(h)}>{h}</button>
            ))}
            <button type="button" className="iform-hint-chip" onClick={fillExample}>example ↗</button>
          </div>
          <span className={`iform-char-count ${charPct > .8 ? 'warn' : ''}`}>
            {storyIdea.length}
          </span>
        </div>
      </div>

      {/* Row */}
      <div className="iform-row">
        <div className="iform-group">
          <label className="iform-label">Episodes</label>
          <select className="iform-select" value={targetEpisodes}
            onChange={(e) => setTargetEpisodes(Number(e.target.value))}>
            {[5, 6, 7, 8].map(n => <option key={n} value={n}>{n} episodes</option>)}
          </select>
        </div>
        <div className="iform-group">
          <label className="iform-label">Genre <span style={{ color: 'rgba(248,248,250,.18)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <input className="iform-input" type="text" value={genreHint}
            onChange={(e) => setGenreHint(e.target.value)}
            placeholder='e.g. "thriller", "sci-fi"' />
        </div>
      </div>

      {/* Submit row */}
      <div className="iform-footer">
        <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: 'rgba(248,248,250,.2)', lineHeight: 1.5 }}>
          Powered by arc-v2 · ~12s avg
        </div>
        <button className="iform-submit" type="submit" disabled={loading || !storyIdea.trim()}>
          {loading ? (
            <><div className="iform-spinner" /> Analysing…</>
          ) : (
            <>Run Analysis →</>
          )}
        </button>
      </div>
    </form>
  );
}
