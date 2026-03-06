import React, { useState } from 'react';
import InputForm from './components/InputForm.jsx';
import EpisodesPanel from './components/EpisodesPanel.jsx';
import EmotionalArcPanel from './components/EmotionalArcPanel.jsx';
import CliffhangerPanel from './components/CliffhangerPanel.jsx';
import RetentionPanel from './components/RetentionPanel.jsx';
import SuggestionsPanel from './components/SuggestionsPanel.jsx';

const API_BASE = '';  // Uses Vite proxy in dev; set to full URL in production

const TABS = [
    { id: 'episodes', label: '🎬 Episodes' },
    { id: 'emotional', label: '💫 Emotional Arc' },
    { id: 'cliffhanger', label: '🧗 Cliffhangers' },
    { id: 'retention', label: '📉 Retention' },
    { id: 'suggestions', label: '✨ Suggestions' },
];

export default function App() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('episodes');

    const handleAnalyse = async (payload) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const res = await fetch(`${API_BASE}/analyse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server error ${res.status}: ${text}`);
            }

            const result = await res.json();
            setData(result);
            setActiveTab('episodes');
        } catch (err) {
            console.error('Analysis failed:', err);
            setError(err.message || 'Failed to connect to the backend. Is it running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Episodic Intelligence Engine</h1>
                <p>
                    Transform story ideas into structured vertical-video episode arcs
                    with emotional tracking, cliffhanger scoring, and retention prediction.
                </p>
            </header>

            <InputForm onSubmit={handleAnalyse} loading={loading} />

            {error && (
                <div className="error-banner" id="error-banner">
                    ⚠️ {error}
                </div>
            )}

            {loading && (
                <div className="spinner-overlay" id="loading-spinner">
                    <div className="spinner" />
                    <p className="spinner-text">Analysing your story… This may take a moment.</p>
                </div>
            )}

            {data && !loading && (
                <>
                    <nav className="panel-tabs" id="results-tabs">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                className={`panel-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                id={`tab-${tab.id}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {activeTab === 'episodes' && <EpisodesPanel episodes={data.episodes} />}
                    {activeTab === 'emotional' && <EmotionalArcPanel emotionalArc={data.emotional_arc} />}
                    {activeTab === 'cliffhanger' && <CliffhangerPanel cliffhangers={data.cliffhangers} />}
                    {activeTab === 'retention' && <RetentionPanel retentionRisk={data.retention_risk} />}
                    {activeTab === 'suggestions' && <SuggestionsPanel suggestions={data.suggestions} />}
                </>
            )}
        </div>
    );
}
