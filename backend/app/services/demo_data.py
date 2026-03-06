"""
Demo / fallback data.

Returns a complete AnalyseResponse for a built-in sample story so
the frontend always has something to render even without a live LLM.
"""

from __future__ import annotations

from app.models import (
    AnalyseResponse,
    Block,
    CliffhangerScore,
    EmotionalBlock,
    EmotionalEpisode,
    Episode,
    RetentionBlock,
    RetentionEpisode,
    Suggestion,
)


def get_demo_response() -> AnalyseResponse:
    """Return a fully-populated demo analysis for a spy-thriller story."""

    # ---- Episodes --------------------------------------------------------
    _ep_data = [
        {
            "id": 1,
            "title": "Episode 1: The Signal",
            "summary": "Alex, a former intelligence analyst, discovers an encrypted distress signal on a decommissioned laptop, pulling them back into a world they swore to leave behind.",
            "key_events": [
                "Alex finds the encrypted message",
                "Flashback to agency days",
                "A stranger appears at the door",
            ],
            "hook": "The stranger whispers: 'They already know you\u2019re awake.' Cut to black.",
            "blocks": [
                {"s": 0, "e": 15, "t": "Rain-soaked city skyline at dusk. A lone figure crosses an empty bridge, collar up against the wind."},
                {"s": 15, "e": 30, "t": "Inside a dim apartment, ALEX boots an old laptop. An encrypted message blinks on screen — origin unknown."},
                {"s": 30, "e": 45, "t": "Flashback: younger Alex in a government bunker, burning files. A superior says, 'This never happened.'"},
                {"s": 45, "e": 60, "t": "Back in the present. Alex starts decoding. Somewhere across the city, a red light blinks on a surveillance board."},
                {"s": 60, "e": 75, "t": "A knock at the door. Alex freezes. Through the peephole: a woman, drenched, holding a familiar agency badge."},
                {"s": 75, "e": 90, "t": "The stranger whispers: 'They already know you\u2019re awake.' Cut to black."},
            ],
        },
        {
            "id": 2,
            "title": "Episode 2: The Contact",
            "summary": "Alex and the mysterious visitor Maya form an uneasy alliance after she reveals classified surveillance footage implicating a powerful official.",
            "key_events": [
                "Maya reveals the USB drive",
                "They watch classified footage",
                "Alex recognises Director Hale",
            ],
            "hook": "Alex and Maya flee the apartment moments before a black SUV arrives.",
            "blocks": [
                {"s": 0, "e": 15, "t": "Morning light. Alex and MAYA sit across a small table, coffee untouched. Tension fills the silence."},
                {"s": 15, "e": 30, "t": "Maya slides a USB drive across the table. 'Surveillance footage. Classified. You need to see this.'"},
                {"s": 30, "e": 45, "t": "On screen: a high-ranking official shakes hands with known arms dealers in a private airfield."},
                {"s": 45, "e": 60, "t": "Alex's face drains of colour. 'That's Director Hale. He was my mentor.' Maya nods. 'I know.'"},
                {"s": 60, "e": 75, "t": "A phone buzzes — unknown caller. Heavy breathing, then: 'Stop digging. Last warning.' Line goes dead."},
                {"s": 75, "e": 90, "t": "Alex and Maya flee the apartment moments before a black SUV arrives."},
            ],
        },
        {
            "id": 3,
            "title": "Episode 3: The Chase",
            "summary": "On the run and hunted, Alex and Maya take refuge in an abandoned warehouse where trust is tested and a new lead is discovered.",
            "key_events": [
                "Counter-surveillance training",
                "Discovery of server-farm coordinates",
                "A drone finds them",
            ],
            "hook": "A drone buzzes overhead — they've been found. They sprint into the night.",
            "blocks": [
                {"s": 0, "e": 15, "t": "Panting, Alex and Maya duck into an abandoned warehouse. Rain hammers the tin roof."},
                {"s": 15, "e": 30, "t": "Maya pulls out a kit and teaches Alex how to detect tracking devices. One was in Alex's jacket."},
                {"s": 30, "e": 45, "t": "Deeper in the USB data: GPS coordinates pointing to a hidden server farm beneath a derelict factory."},
                {"s": 45, "e": 60, "t": "A breaking-news ticker scrolls on Maya's phone: 'Former analyst Alex Mercer wanted for security breach.'"},
                {"s": 60, "e": 75, "t": "Alex confronts Maya: 'How long have you been watching me?' She hesitates. 'Six months.'"},
                {"s": 75, "e": 90, "t": "A drone buzzes overhead — they've been found. They sprint into the night."},
            ],
        },
        {
            "id": 4,
            "title": "Episode 4: The Breach",
            "summary": "Alex and Maya infiltrate the hidden server farm, extract critical evidence, but walk straight into an ambush led by Director Hale.",
            "key_events": [
                "Server-farm infiltration",
                "Armed confrontation",
                "Maya is injured",
            ],
            "hook": "At the tunnel exit, Director Hale stands waiting, flanked by armed agents.",
            "blocks": [
                {"s": 0, "e": 15, "t": "Midnight. Alex and Maya descend through a rusted hatch into the server farm beneath the factory."},
                {"s": 15, "e": 30, "t": "Rows of humming servers. Maya jacks in and begins extracting data. A progress bar crawls forward."},
                {"s": 30, "e": 45, "t": "Alex watches through thermal goggles. Three armed figures approach outside. Heart rate spikes."},
                {"s": 45, "e": 60, "t": "Gunfire erupts. Alex returns fire from cover while Maya's download hits 87%… 93%… 100%."},
                {"s": 60, "e": 75, "t": "They escape through underground tunnels. Maya clutches her side — a bullet graze. Blood on concrete."},
                {"s": 75, "e": 90, "t": "At the tunnel exit, Director Hale stands waiting, flanked by armed agents."},
            ],
        },
        {
            "id": 5,
            "title": "Episode 5: The Reveal",
            "summary": "Cornered by Hale, Alex stalls while Maya secretly broadcasts the evidence to journalists worldwide, leading to a chaotic escape.",
            "key_events": [
                "Hale offers a deal",
                "Maya broadcasts evidence globally",
                "EMP-powered escape",
            ],
            "hook": "Alex looks at the sunrise — free but forever changed.",
            "blocks": [
                {"s": 0, "e": 15, "t": "Hale steps forward, gun lowered. 'Return the data. Walk away. All forgiven.' His voice is calm."},
                {"s": 15, "e": 30, "t": "Alex stalls, asking questions. Behind them, Maya silently taps a sequence — uploading to every major newsroom."},
                {"s": 30, "e": 45, "t": "Hale's phone buzzes. His face twists. 'What have you done?' He orders agents to seize them."},
                {"s": 45, "e": 60, "t": "Alex pulls a compact EMP device from Maya's bag. One press — the area plunges into darkness."},
                {"s": 60, "e": 75, "t": "Chaos. Shouts. Alex grabs Maya and they disappear into the treeline. Sirens wail in the distance."},
                {"s": 75, "e": 90, "t": "Alex looks at the sunrise — free but forever changed."},
            ],
        },
        {
            "id": 6,
            "title": "Episode 6: The Aftermath",
            "summary": "The leaked footage sparks public outrage and investigations. Alex starts a new life overseas — until a new message arrives.",
            "key_events": [
                "News channels air the footage",
                "Hale resigns",
                "Maya sends a new coded message",
            ],
            "hook": "Alex opens the message. New coordinates appear on screen. Smash cut to black.",
            "blocks": [
                {"s": 0, "e": 15, "t": "Montage: news anchors worldwide broadcast the leaked surveillance footage. Hashtags trend instantly."},
                {"s": 15, "e": 30, "t": "Director Hale, grey-faced, reads a resignation statement. Congressional hearings are announced."},
                {"s": 30, "e": 45, "t": "Weeks later. Alex sits in a sun-drenched café in Lisbon under a new identity, reading a paper."},
                {"s": 45, "e": 60, "t": "A notification pings — a coded message from Maya: 'There's another layer. Deeper.'"},
                {"s": 60, "e": 75, "t": "Alex stares at the message. Fingers hover over the keyboard. The old life pulls."},
                {"s": 75, "e": 90, "t": "Alex opens the message. New coordinates appear on screen. Smash cut to black."},
            ],
        },
    ]

    episodes = []
    for d in _ep_data:
        blocks = [Block(start_s=b["s"], end_s=b["e"], text=b["t"]) for b in d["blocks"]]
        episodes.append(Episode(
            id=d["id"], title=d["title"], summary=d["summary"],
            key_events=d["key_events"], hook=d["hook"], blocks=blocks,
        ))

    # ---- Emotional arc ---------------------------------------------------
    _emo_profiles = [
        # (emotion, intensity) per block for each episode
        [("anticipation", 0.45), ("surprise", 0.65), ("sadness", 0.55), ("anticipation", 0.70), ("fear", 0.80), ("fear", 0.90)],
        [("neutral", 0.25), ("surprise", 0.60), ("anger", 0.75), ("sadness", 0.70), ("fear", 0.85), ("fear", 0.80)],
        [("fear", 0.70), ("anticipation", 0.55), ("surprise", 0.65), ("fear", 0.75), ("anger", 0.60), ("fear", 0.85)],
        [("anticipation", 0.60), ("anticipation", 0.50), ("fear", 0.80), ("fear", 0.90), ("sadness", 0.75), ("fear", 0.85)],
        [("anticipation", 0.55), ("anticipation", 0.65), ("anger", 0.80), ("surprise", 0.85), ("fear", 0.70), ("joy", 0.60)],
        [("joy", 0.50), ("joy", 0.45), ("neutral", 0.30), ("surprise", 0.70), ("anticipation", 0.65), ("surprise", 0.80)],
    ]

    emotional_arc = []
    for ep_idx, profile in enumerate(_emo_profiles):
        eblocks = []
        for i, (emo, inten) in enumerate(profile):
            eblocks.append(EmotionalBlock(
                start_s=i * 15, end_s=(i + 1) * 15, emotion=emo, intensity=inten,
            ))
        flat_zones = []
        # Episode 6 has a slight dip in the middle
        if ep_idx == 5:
            flat_zones = [{"start_s": 15, "end_s": 45, "duration_s": 30, "block_indices": [1, 2]}]

        emotional_arc.append(EmotionalEpisode(
            episode_id=ep_idx + 1,
            blocks=eblocks,
            flat_zones=flat_zones,
            summary=f"Episode {ep_idx + 1} {'builds tension steadily toward a gripping cliffhanger' if ep_idx < 5 else 'opens reflectively before a surprise ending pulls viewers forward'}.",
        ))

    # ---- Cliffhanger scores ----------------------------------------------
    _cliff = [
        (8.5, 7.0, 7.5, 9.0, "The whispered warning is cryptic and urgent, creating a strong curiosity gap."),
        (7.0, 8.0, 6.0, 7.5, "The sudden arrival of the SUV raises stakes but the surprise element could be stronger."),
        (8.0, 7.5, 7.0, 8.5, "Being discovered by a drone after a trust confrontation doubles the tension."),
        (9.0, 9.0, 8.0, 8.5, "Hale's appearance at the tunnel exit is a devastating reveal. Very high stakes."),
        (6.0, 6.5, 5.5, 6.0, "The sunrise ending is emotional but lacks a strong forward pull for the next episode."),
        (7.5, 7.0, 8.5, 9.5, "The new coordinates tease a larger conspiracy, maximising curiosity for a second season."),
    ]

    cliffhangers = []
    for i, (t, s, su, c, exp) in enumerate(_cliff):
        total = round(0.3 * t + 0.3 * s + 0.2 * su + 0.2 * c, 1)
        cliffhangers.append(CliffhangerScore(
            episode_id=i + 1, tension=t, stakes=s, surprise=su,
            curiosity=c, total=total, explanation=exp,
        ))

    # ---- Retention risk --------------------------------------------------
    _risk_profiles = [
        [0.35, 0.30, 0.45, 0.35, 0.25, 0.15],
        [0.50, 0.30, 0.25, 0.30, 0.20, 0.20],
        [0.25, 0.40, 0.35, 0.30, 0.45, 0.15],
        [0.30, 0.40, 0.20, 0.15, 0.25, 0.15],
        [0.40, 0.35, 0.20, 0.15, 0.25, 0.45],
        [0.45, 0.55, 0.65, 0.30, 0.35, 0.15],
    ]

    retention_risk = []
    for ep_idx, risks in enumerate(_risk_profiles):
        rblocks = [
            RetentionBlock(start_s=i * 15, end_s=(i + 1) * 15, risk=r)
            for i, r in enumerate(risks)
        ]
        retention_risk.append(RetentionEpisode(episode_id=ep_idx + 1, blocks=rblocks))

    # ---- Suggestions -----------------------------------------------------
    suggestions = [
        Suggestion(episode_id=1, suggestions=[
            "Add ambient sound cues (rain, static) in the opening to immerse viewers faster.",
            "Make the encrypted message visually dramatic — glitch effects or a countdown.",
            "Shorten the flashback to 10 seconds; use the extra 5s for a reaction shot.",
        ], alternative_hook="The stranger holds up a photo — it's Alex, taken this morning."),
        Suggestion(episode_id=2, suggestions=[
            "Open with action (Maya arriving) rather than a static coffee scene.",
            "Add a ticking-clock element: 'We have 12 hours before they wipe the servers.'",
            "Show Hale's face in shadow first to build mystery before the reveal.",
        ], alternative_hook="As they run, Maya drops a second USB. 'That one's worse.'"),
        Suggestion(episode_id=3, suggestions=[
            "The tracking-device reveal is strong — add a beat where Alex questions all past encounters.",
            "Move the news broadcast to the opening to raise urgency immediately.",
            "End the Maya confrontation with her revealing she lost someone to Hale too.",
        ], alternative_hook="The drone's red light blinks twice — then projects a holographic message from Hale."),
        Suggestion(episode_id=4, suggestions=[
            "Add an extraction countdown timer to build visual tension.",
            "Show Maya's injury more viscerally — it raises stakes for the finale.",
            "Have one agent hesitate, hinting not everyone is loyal to Hale.",
        ], alternative_hook="Hale smiles and says: 'I was hoping you'd make it this far.'"),
        Suggestion(episode_id=5, suggestions=[
            "The EMP beat is clever but needs foreshadowing in an earlier episode.",
            "Add reaction shots from around the world as people see the footage.",
            "The sunrise ending is soft — consider ending on Maya's injury worsening.",
        ], alternative_hook="As Alex watches the sunrise, a news ticker reads: 'Second leak detected — source unknown.'"),
        Suggestion(episode_id=6, suggestions=[
            "The café scene (30–45s) feels slow — add a near-miss recognition moment.",
            "Show parallel action: Hale's allies destroying evidence as hearings begin.",
            "Maya's message should include a name Alex recognises — deepens the hook.",
        ], alternative_hook="The coordinates resolve to a location Alex has been before — their childhood home."),
    ]

    return AnalyseResponse(
        episodes=episodes,
        emotional_arc=emotional_arc,
        cliffhangers=cliffhangers,
        retention_risk=retention_risk,
        suggestions=suggestions,
    )
