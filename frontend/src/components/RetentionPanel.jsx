import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
} from 'recharts';

function riskColor(risk) {
    if (risk >= 0.7) return '#f87171';
    if (risk >= 0.5) return '#fbbf24';
    if (risk >= 0.35) return '#60a5fa';
    return '#34d399';
}

function CustomTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    const pct = (d.risk * 100).toFixed(0);
    const label =
        d.risk >= 0.7 ? 'High risk' : d.risk >= 0.5 ? 'Moderate risk' : d.risk >= 0.35 ? 'Low risk' : 'Very low risk';
    return (
        <div className="custom-tooltip">
            <div className="label">{d.time}</div>
            <div className="value">
                {pct}% — {label}
            </div>
        </div>
    );
}

export default function RetentionPanel({ retentionRisk }) {
    if (!retentionRisk || retentionRisk.length === 0) return null;

    return (
        <div className="panel fade-in-up" id="retention-panel">
            <h2 className="panel-title">
                <span className="icon">📉</span> Retention Risk
            </h2>

            {retentionRisk.map((ep) => {
                const data = ep.blocks.map((b) => ({
                    time: `${b.start_s}–${b.end_s}s`,
                    risk: b.risk,
                }));

                return (
                    <div className="chart-episode-section" key={ep.episode_id}>
                        <div className="chart-episode-title">Episode {ep.episode_id}</div>

                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                                <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine y={0.7} stroke="rgba(248, 113, 113, 0.5)" strokeDasharray="4 4" label="" />
                                <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                                    {data.map((entry, i) => (
                                        <Cell key={i} fill={riskColor(entry.risk)} fillOpacity={0.85} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );
            })}

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {[
                    { color: '#34d399', label: 'Very low (<35%)' },
                    { color: '#60a5fa', label: 'Low (35–50%)' },
                    { color: '#fbbf24', label: 'Moderate (50–70%)' },
                    { color: '#f87171', label: 'High (>70%)' },
                ].map((l) => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: l.color, display: 'inline-block' }} />
                        {l.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
