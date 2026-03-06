import React from 'react';

export default function InputForm({ onSubmit, loading }) {
    const [storyIdea, setStoryIdea] = React.useState('');
    const [targetEpisodes, setTargetEpisodes] = React.useState(6);
    const [genreHint, setGenreHint] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!storyIdea.trim() || loading) return;
        onSubmit({
            story_idea: storyIdea.trim(),
            target_episodes: targetEpisodes,
            genre_hint: genreHint.trim() || null,
        });
    };

    return (
        <form className="input-form" onSubmit={handleSubmit} id="analyse-form">
            <div className="form-group">
                <label htmlFor="story-idea">Story Idea</label>
                <textarea
                    id="story-idea"
                    value={storyIdea}
                    onChange={(e) => setStoryIdea(e.target.value)}
                    placeholder="Describe your story idea in 1–3 paragraphs. For example: A disillusioned former intelligence analyst discovers an encrypted distress signal on a decommissioned laptop, pulling them back into a shadowy world of surveillance and betrayal…"
                    required
                    minLength={10}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="target-episodes">Number of Episodes</label>
                    <select
                        id="target-episodes"
                        value={targetEpisodes}
                        onChange={(e) => setTargetEpisodes(Number(e.target.value))}
                    >
                        {[5, 6, 7, 8].map((n) => (
                            <option key={n} value={n}>
                                {n} episodes
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="genre-hint">Genre (optional)</label>
                    <input
                        id="genre-hint"
                        type="text"
                        value={genreHint}
                        onChange={(e) => setGenreHint(e.target.value)}
                        placeholder='e.g. "thriller", "romance", "sci-fi"'
                    />
                </div>
            </div>

            <button type="submit" className="btn-analyse" disabled={loading || !storyIdea.trim()} id="btn-analyse">
                {loading ? (
                    <>
                        <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                        Analysing…
                    </>
                ) : (
                    <>🚀 Analyse Story</>
                )}
            </button>
        </form>
    );
}
