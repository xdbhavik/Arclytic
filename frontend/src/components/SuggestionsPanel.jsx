import React, { useState } from 'react';

const S = {
    title: {
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: '22px',
        fontWeight: 900,
        letterSpacing: '-0.02em',
        color: '#2A1840',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    titleLine: {
        flex: 1, height: '1.5px',
        background: 'linear-gradient(90deg, rgba(200,160,230,0.3), transparent)',
    },
    grid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    card: {
        background: 'rgba(255,255,255,0.62)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.9)',
        borderRadius: '20px',
        padding: '24px 28px',
        boxShadow: '0 4px 24px rgba(170,130,210,0.1)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.22s, box-shadow 0.22s',
    },
    cardAccent: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '3px', borderRadius: '20px 20px 0 0',
        background: 'linear-gradient(90deg, #FCD34D, #F9A8D4, #C4B5FD)',
    },
    cardShine: {
        position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '18px',
        paddingTop: '4px',
    },
    epBadge: {
        background: 'linear-gradient(135deg, #E8C0DC, #C8B0F0)',
        borderRadius: '8px',
        padding: '4px 14px',
        fontSize: '11px',
        fontWeight: 800,
        color: '#3A1E52',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        boxShadow: '0 2px 10px rgba(180,130,210,0.2)',
    },
    countBadge: {
        background: 'rgba(240,230,255,0.7)',
        border: '1px solid rgba(200,170,230,0.3)',
        borderRadius: '100px',
        padding: '3px 10px',
        fontSize: '11px',
        fontWeight: 700,
        color: '#9060B8',
    },
    list: {
        listStyle: 'none',
        padding: 0,
        margin: '0 0 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    listItem: {
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        padding: '12px 16px',
        background: 'rgba(240,230,255,0.35)',
        border: '1px solid rgba(200,170,230,0.2)',
        borderRadius: '14px',
        transition: 'background 0.2s, transform 0.15s',
        cursor: 'default',
    },
    itemNumber: {
        width: '22px', height: '22px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #E8C0DC, #C8B0F0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 800,
        color: '#3A1E52',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(180,130,210,0.2)',
        marginTop: '1px',
    },
    itemText: {
        fontSize: '13.5px',
        color: '#5A4070',
        lineHeight: 1.65,
        fontWeight: 500,
    },
    altHook: {
        background: 'linear-gradient(135deg, rgba(252,211,77,0.15), rgba(249,168,212,0.15))',
        border: '1.5px solid rgba(252,211,77,0.35)',
        borderRadius: '14px',
        padding: '14px 18px',
        position: 'relative',
        overflow: 'hidden',
    },
    altHookAccent: {
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: '3px',
        background: 'linear-gradient(180deg, #FCD34D, #F9A8D4)',
        borderRadius: '14px 0 0 14px',
    },
    altHookLabel: {
        fontSize: '10px',
        fontWeight: 800,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#A07020',
        marginBottom: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    altHookText: {
        fontSize: '13.5px',
        color: '#5A3840',
        lineHeight: 1.65,
        fontWeight: 500,
        fontStyle: 'italic',
        paddingLeft: '4px',
    },
};

function SuggestionCard({ s }) {
    const [hovered, setHovered] = useState(null);

    return (
        <div
            style={S.card}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(170,130,210,0.18)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(170,130,210,0.1)';
            }}
        >
            <div style={S.cardAccent} />
            <div style={S.cardShine} />

            <div style={S.header}>
                <span style={S.epBadge}>Episode {s.episode_id}</span>
                <span style={S.countBadge}>{s.suggestions.length} suggestions</span>
            </div>

            <ul style={S.list}>
                {s.suggestions.map((text, i) => (
                    <li
                        key={i}
                        style={{
                            ...S.listItem,
                            ...(hovered === i ? {
                                background: 'rgba(220,200,255,0.45)',
                                transform: 'translateX(3px)',
                            } : {}),
                        }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <div style={S.itemNumber}>{i + 1}</div>
                        <span style={S.itemText}>{text}</span>
                    </li>
                ))}
            </ul>

            {s.alternative_hook && (
                <div style={S.altHook}>
                    <div style={S.altHookAccent} />
                    <div style={S.altHookLabel}>
                        <span>🪝</span> Alternative Hook
                    </div>
                    <p style={S.altHookText}>{s.alternative_hook}</p>
                </div>
            )}
        </div>
    );
}

export default function SuggestionsPanel({ suggestions }) {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div>
            <h2 style={S.title}>
                <span>✨</span> Improvement Suggestions
                <div style={S.titleLine} />
            </h2>
            <div style={S.grid}>
                {suggestions.map((s) => (
                    <SuggestionCard key={s.episode_id} s={s} />
                ))}
            </div>
        </div>
    );
}
