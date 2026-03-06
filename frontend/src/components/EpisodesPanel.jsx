import React from 'react';

export default function EpisodesPanel({ episodes }) {
    if (!episodes || episodes.length === 0) return null;

    return (
        <div className="panel fade-in-up" id="episodes-panel">
            <h2 className="panel-title">
                <span className="icon">🎬</span> Episode Arc
            </h2>
            {episodes.map((ep) => (
                <div className="episode-card" key={ep.id}>
                    <div className="ep-header">
                        <span className="ep-id">{ep.id}</span>
                        <span className="ep-title">{ep.title}</span>
                    </div>
                    <p className="ep-summary">{ep.summary}</p>
                    <ul className="ep-events">
                        {ep.key_events.map((evt, i) => (
                            <li key={i}>{evt}</li>
                        ))}
                    </ul>
                    <div className="ep-hook">{ep.hook}</div>
                </div>
            ))}
        </div>
    );
}
