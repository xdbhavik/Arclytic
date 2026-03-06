import React from 'react';

export default function SuggestionsPanel({ suggestions }) {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="panel fade-in-up" id="suggestions-panel">
            <h2 className="panel-title">
                <span className="icon">✨</span> Improvement Suggestions
            </h2>

            {suggestions.map((s) => (
                <div className="episode-card" key={s.episode_id}>
                    <div className="ep-header">
                        <span className="ep-id">{s.episode_id}</span>
                        <span className="ep-title">Episode {s.episode_id}</span>
                    </div>
                    <ul className="suggestion-list">
                        {s.suggestions.map((text, i) => (
                            <li key={i}>{text}</li>
                        ))}
                    </ul>
                    {s.alternative_hook && (
                        <div className="alt-hook">
                            <span className="alt-hook-label">Alternative Hook</span>
                            {s.alternative_hook}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
