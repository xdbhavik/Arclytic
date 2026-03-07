import React from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const EMOTION_CFG = {
  joy:          { color: '#10d9a0', label: 'Joy' },
  fear:         { color: '#f43f5e', label: 'Fear' },
  anger:        { color: '#f97316', label: 'Anger' },
  sadness:      { color: '#60a5fa', label: 'Sadness' },
  surprise:     { color: '#fbbf24', label: 'Surprise' },
  anticipation: { color: '#a78bfa', label: 'Anticipation' },
  neutral:      { color: 'rgba(248,248,250,0.3)', label: 'Neutral' },
};

const injectCSS = () => {
  if (document.getElementById('emo-css')) return;
  const s = document.createElement('style'); s.id = 'emo-css';
  s.textContent = `
.emo-panel-title {
  display: flex; align-items: center; gap: 10px; margin-bottom: 22px;
}
.emo-panel-title-text {
  font-size: 11px; font-weight: 600; letter-spacing: .1em;
  text-transform: uppercase; color: rgba(248,248,250,.35);
  font-family: 'DM Mono', monospace;
}
.emo-panel-title-line { flex: 1; height: 1px; background: rgba(255,255,255,.06); }

.emo-section {
  margin-bottom: 20px;
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px;
  overflow: hidden;
}

.emo-section-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,.06);
  background: rgba(255,255,255,.02);
}

.emo-ep-badge {
  font-size: 10px; font-family: 'DM Mono', monospace; font-weight: 500;
  background: rgba(0,212,255,.1); border: 1px solid rgba(0,212,255,.2);
  border-radius: 4px; padding: 3px 8px; color: #00d4ff;
}

.emo-flat-badge {
  font-size: 10px; font-family: 'DM Mono', monospace;
  background: rgba(245,158,11,.1); border: 1px solid rgba(245,158,11,.25);
  border-radius: 4px; padding: 3px 8px; color: #fbbf24;
}

.emo-legend {
  margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap;
}

.emo-legend-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 10px; font-family: 'DM Mono', monospace;
  color: rgba(248,248,250,.4);
}

.emo-legend-dot {
  width: 6px; height: 6px; border-radius: 50%;
}

.emo-chart-wrap { padding: 14px 18px 4px; }

.emo-summary {
  padding: 12px 18px 16px;
  font-size: 12.5px; color: rgba(248,248,250,.35);
  line-height: 1.7; font-weight: 300; font-style: italic;
  border-top: 1px solid rgba(255,255,255,.04);
}

.emo-tooltip {
  background: #1a1a1e;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 8px;
  padding: 8px 12px;
  font-family: 'DM Mono', monospace;
}
.emo-tooltip-label { font-size: 10px; color: rgba(248,248,250,.4); margin-bottom: 4px; }
.emo-tooltip-value { font-size: 13px; font-weight: 500; }
`;
  document.head.appendChild(s);
};

function EmoTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const cfg = EMOTION_CFG[d.emotion] || { color: '#fff', label: d.emotion };
  return (
    <div className="emo-tooltip">
      <div className="emo-tooltip-label">{d.time}</div>
      <div className="emo-tooltip-value" style={{ color: cfg.color }}>
        {cfg.label} · {(d.intensity * 100).toFixed(0)}%
      </div>
    </div>
  );
}

export default function EmotionalArcPanel({ emotionalArc }) {
  injectCSS();
  if (!emotionalArc?.length) return null;

  return (
    <div>
      <div className="emo-panel-title">
        <span className="emo-panel-title-text">Emotional Arc</span>
        <div className="emo-panel-title-line" />
      </div>

      {emotionalArc.map((ep) => {
        const data = ep.blocks.map((b) => ({
          time: `${b.start_s}s`,
          intensity: b.intensity,
          emotion: b.emotion,
        }));
        const emotions = [...new Set(data.map(d => d.emotion))];
        const dominantEmotion = data.reduce((a, b) => a.intensity > b.intensity ? a : b, data[0])?.emotion || 'neutral';
        const domColor = EMOTION_CFG[dominantEmotion]?.color || '#fff';

        return (
          <div className="emo-section" key={ep.episode_id}>
            <div className="emo-section-head">
              <span className="emo-ep-badge">E{String(ep.episode_id).padStart(2,'0')}</span>
              {ep.flat_zones?.length > 0 && (
                <span className="emo-flat-badge">⚠ {ep.flat_zones.length} flat zone{ep.flat_zones.length > 1 ? 's' : ''}</span>
              )}
              <div className="emo-legend">
                {emotions.map(em => {
                  const cfg = EMOTION_CFG[em] || { color: '#fff', label: em };
                  return (
                    <div key={em} className="emo-legend-item">
                      <div className="emo-legend-dot" style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }} />
                      {cfg.label}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="emo-chart-wrap">
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                  <defs>
                    <linearGradient id={`emoGrad${ep.episode_id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={domColor} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={domColor} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: 'rgba(248,248,250,.25)', fontFamily: "'DM Mono',monospace" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    domain={[0, 1]} ticks={[0, .5, 1]}
                    tick={{ fontSize: 10, fill: 'rgba(248,248,250,.25)', fontFamily: "'DM Mono',monospace" }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v*100).toFixed(0)}%`}
                  />
                  <Tooltip content={<EmoTooltip />} />
                  <ReferenceLine y={0.3} stroke="rgba(245,158,11,.25)" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="intensity"
                    stroke={domColor}
                    strokeWidth={2}
                    fill={`url(#emoGrad${ep.episode_id})`}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      const c = EMOTION_CFG[payload.emotion]?.color || '#fff';
                      return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3.5} fill={c} stroke="#0a0a0b" strokeWidth={1.5} />;
                    }}
                    activeDot={{ r: 6, stroke: '#0a0a0b', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {ep.summary && <p className="emo-summary">{ep.summary}</p>}
          </div>
        );
      })}
    </div>
  );
}
