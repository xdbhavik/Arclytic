import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    ReferenceArea,
} from 'recharts';

const EMOTION_COLORS = {
    joy: '#34d399',
    fear: '#f87171',
    anger: '#fb923c',
    sadness: '#60a5fa',
    surprise: '#fbbf24',
    anticipation: '#a78bfa',
    neutral: '#94a3b8',
};

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
        <div className="custom-tooltip">
            <div className="label">{d.time}</div>
            <div className="value">
                {d.emotion} — {(d.intensity * 100).toFixed(0)}%
            </div>
        </div>
    );
}

export default function EmotionalArcPanel({ emotionalArc }) {
    if (!emotionalArc || emotionalArc.length === 0) return null;

    return (
        <div className="panel fade-in-up" id="emotional-arc-panel">
            <h2 className="panel-title">
                <span className="icon">💫</span> Emotional Arc
            </h2>

            {emotionalArc.map((ep) => {
                const data = ep.blocks.map((b) => ({
                    time: `${b.start_s}s`,
                    intensity: b.intensity,
                    emotion: b.emotion,
                    fill: EMOTION_COLORS[b.emotion] || '#94a3b8',
                }));

                return (
                    <div className="chart-episode-section" key={ep.episode_id}>
                        <div className="chart-episode-title">
                            Episode {ep.episode_id}
                            {ep.flat_zones.length > 0 && (
                                <span className="flat-zone-badge">
                                    ⚠ {ep.flat_zones.length} flat zone{ep.flat_zones.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                                <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />

                                {/* Shade flat zones */}
                                {ep.flat_zones.map((fz, i) => (
                                    <ReferenceArea
                                        key={i}
                                        x1={`${fz.start_s}s`}
                                        x2={`${fz.end_s - 15}s`}
                                        fill="rgba(251, 191, 36, 0.08)"
                                        strokeOpacity={0}
                                    />
                                ))}

                                {/* Low-intensity threshold line */}
                                <ReferenceLine y={0.3} stroke="rgba(251, 191, 36, 0.4)" strokeDasharray="4 4" />

                                <Line
                                    type="monotone"
                                    dataKey="intensity"
                                    stroke="#818cf8"
                                    strokeWidth={2.5}
                                    dot={{ r: 5, fill: '#6366f1', stroke: '#818cf8', strokeWidth: 2 }}
                                    activeDot={{ r: 7, fill: '#a78bfa' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>

                        <p className="emo-summary">{ep.summary}</p>
                    </div>
                );
            })}
        </div>
    );
}
