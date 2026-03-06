import React from 'react';

function scoreBadge(val, max = 10) {
    const pct = val / max;
    const cls = pct >= 0.7 ? 'score-high' : pct >= 0.5 ? 'score-mid' : 'score-low';
    return <span className={`score-badge ${cls}`}>{val.toFixed(1)}</span>;
}

export default function CliffhangerPanel({ cliffhangers }) {
    if (!cliffhangers || cliffhangers.length === 0) return null;

    return (
        <div className="panel fade-in-up" id="cliffhanger-panel">
            <h2 className="panel-title">
                <span className="icon">🧗</span> Cliffhanger Scores
            </h2>

            <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Episode</th>
                            <th>Tension</th>
                            <th>Stakes</th>
                            <th>Surprise</th>
                            <th>Curiosity</th>
                            <th>Total</th>
                            <th>Explanation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cliffhangers.map((c) => (
                            <tr key={c.episode_id}>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                    Ep {c.episode_id}
                                </td>
                                <td>{scoreBadge(c.tension)}</td>
                                <td>{scoreBadge(c.stakes)}</td>
                                <td>{scoreBadge(c.surprise)}</td>
                                <td>{scoreBadge(c.curiosity)}</td>
                                <td>{scoreBadge(c.total)}</td>
                                <td style={{ maxWidth: 300, fontSize: '0.85rem' }}>{c.explanation}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
