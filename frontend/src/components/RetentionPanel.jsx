import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

const injectCSS = () => {
  if (document.getElementById('ret-css')) return;
  const s = document.createElement('style'); s.id = 'ret-css';
  s.textContent = `
.ret-panel-title {
  display: flex; align-items: center; gap: 10px; margin-bottom: 22px;
}
.ret-panel-title-text {
  font-size: 11px; font-weight: 600; letter-spacing: .1em;
  text-transform: uppercase; color: rgba(248,248,250,.35);
  font-family: 'DM Mono', monospace;
}
.ret-panel-title-line { flex: 1; height: 1px; background: rgba(255,255,255,.06); }

.ret-section {
  margin-bottom: 16px;
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px; overflow: hidden;
}

.ret-section-head {
  display: flex; align-items: center; gap: 10px; justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,.06);
  background: rgba(255,255,255,.02);
}

.ret-ep-badge {
  font-size: 10px; font-family: 'DM Mono', monospace;
  background: rgba(0,212,255,.1); border: 1px solid rgba(0,212,255,.2);
  border-radius: 4px; padding: 3px 8px; color: #00d4ff;
}

.ret-risk-summary {
  display: flex; gap: 10px;
}

.ret-risk-chip {
  font-size: 10px; font-family: 'DM Mono', monospace;
  border-radius: 4px; padding: 3px 8px;
  border: 1px solid;
}

.ret-chart-wrap { padding: 14px 18px 10px; }

.ret-legend {
  display: flex; gap: 16px; flex-wrap: wrap;
  padding: 12px 18px 14px;
  border-top: 1px solid rgba(255,255,255,.04);
}

.ret-legend-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 10.5px; font-family: 'DM Mono', monospace;
  color: rgba(248,248,250,.3);
}

.ret-legend-swatch {
  width: 10px; height: 10px; border-radius: 3px;
}

.ret-tooltip {
  background: #1a1a1e;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 8px;
  padding: 8px 12px;
  font-family: 'DM Mono', monospace;
}
.ret-tooltip-label { font-size: 10px; color: rgba(248,248,250,.4); margin-bottom: 4px; }
.ret-tooltip-value { font-size: 13px; font-weight: 500; }
`;
  document.head.appendChild(s);
};

function riskCfg(risk) {
  if (risk >= .7) return { color: '#f43f5e', label: 'High',      bg: 'rgba(244,63,94,.1)',  border: 'rgba(244,63,94,.25)' };
  if (risk >= .5) return { color: '#f59e0b', label: 'Moderate',  bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.25)' };
  if (risk >= .35)return { color: '#60a5fa', label: 'Low',       bg: 'rgba(96,165,250,.1)', border: 'rgba(96,165,250,.25)' };
  return            { color: '#10d9a0', label: 'Very Low',  bg: 'rgba(16,217,160,.1)', border: 'rgba(16,217,160,.25)' };
}

function RetTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const cfg = riskCfg(d.risk);
  return (
    <div className="ret-tooltip">
      <div className="ret-tooltip-label">{d.time}</div>
      <div className="ret-tooltip-value" style={{ color: cfg.color }}>
        {(d.risk * 100).toFixed(0)}% — {cfg.label} risk
      </div>
    </div>
  );
}

export default function RetentionPanel({ retentionRisk }) {
  injectCSS();
  if (!retentionRisk?.length) return null;

  return (
    <div>
      <div className="ret-panel-title">
        <span className="ret-panel-title-text">Retention Risk</span>
        <div className="ret-panel-title-line" />
      </div>

      {retentionRisk.map((ep) => {
        const data = ep.blocks.map((b) => ({ time: `${b.start_s}–${b.end_s}s`, risk: b.risk }));
        const avgRisk = data.reduce((s, d) => s + d.risk, 0) / data.length;
        const maxRisk = Math.max(...data.map(d => d.risk));
        const highCount = data.filter(d => d.risk >= .7).length;
        const avgCfg = riskCfg(avgRisk);
        const maxCfg = riskCfg(maxRisk);

        return (
          <div className="ret-section" key={ep.episode_id}>
            <div className="ret-section-head">
              <span className="ret-ep-badge">E{String(ep.episode_id).padStart(2,'0')}</span>
              <div className="ret-risk-summary">
                <span className="ret-risk-chip" style={{ color: avgCfg.color, background: avgCfg.bg, borderColor: avgCfg.border }}>
                  avg {(avgRisk * 100).toFixed(0)}%
                </span>
                <span className="ret-risk-chip" style={{ color: maxCfg.color, background: maxCfg.bg, borderColor: maxCfg.border }}>
                  peak {(maxRisk * 100).toFixed(0)}%
                </span>
                {highCount > 0 && (
                  <span className="ret-risk-chip" style={{ color: '#f43f5e', background: 'rgba(244,63,94,.1)', borderColor: 'rgba(244,63,94,.25)' }}>
                    {highCount} high-risk block{highCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="ret-chart-wrap">
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={data} margin={{ top: 6, right: 12, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,.05)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 9, fill: 'rgba(248,248,250,.25)', fontFamily: "'DM Mono',monospace" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    domain={[0, 1]} ticks={[0, .25, .5, .75, 1]}
                    tick={{ fontSize: 10, fill: 'rgba(248,248,250,.25)', fontFamily: "'DM Mono',monospace" }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v*100).toFixed(0)}%`}
                  />
                  <Tooltip content={<RetTooltip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
                  <ReferenceLine y={.7} stroke="rgba(244,63,94,.3)" strokeDasharray="4 4" strokeWidth={1} />
                  <ReferenceLine y={.5} stroke="rgba(245,158,11,.2)" strokeDasharray="4 4" strokeWidth={1} />
                  <Bar dataKey="risk" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {data.map((entry, i) => {
                      const cfg = riskCfg(entry.risk);
                      return <Cell key={i} fill={cfg.color} fillOpacity={.75} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="ret-legend">
              {[
                { color: '#10d9a0', label: 'Very low  <35%' },
                { color: '#60a5fa', label: 'Low  35–50%' },
                { color: '#f59e0b', label: 'Moderate  50–70%' },
                { color: '#f43f5e', label: 'High  >70%' },
              ].map(l => (
                <div key={l.label} className="ret-legend-item">
                  <div className="ret-legend-swatch" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
