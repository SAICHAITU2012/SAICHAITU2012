# Asset credits — THE LANTERN SEA

## Music

**Track:** “Floating Cities”
**Composer:** Kevin MacLeod (incompetech.com)
**Source:** https://incompetech.com/music/royalty-free/mp3-royaltyfree/Floating%20Cities.mp3
**License:** Creative Commons Attribution 4.0 International (CC-BY 4.0)
https://creativecommons.org/licenses/by/4.0/

**Usage:** looped ambient score, triggered by the ♪ sound toggle.
**File:** `assets/audio/lantern-sea-loop.mp3` (128 kbps mp3, 44.1 kHz stereo).
**Modification:** the shipped file is edited for gapless looping — the final
5 s are crossfaded into the first 5 s (ffmpeg `acrossfade`), which removes
the original fade-out ending so a `loop=true` Web Audio source is seamless.
No other musical changes were made.
**Attribution (required by CC-BY):** shown in the site footer
(“music · ‘floating cities’ — kevin macLeod · cc-by 4.0”, linked to
incompetech.com and the license deed) and in this file.

**Selection rationale:** chosen from six analyzed candidates
(Floating Cities, Snowfall — Scott Buckley, Meditation Impromptu 02,
Peaceful Desolation, Deep Relaxation, Almost in F — all Kevin MacLeod
except where noted). Evaluated by envelope/loop analysis (per-second RMS
shape, transient density, dynamic range, seam loudness) against the
LANTERN SEA atmosphere: night ocean, drifting lanterns, peaceful wonder.
“Floating Cities” had the smoothest envelope flow of all candidates and
its dreamy piano-over-pad texture matches the drifting lantern fleet.
Pixabay and Mixkit were also explored but block scripted/automated access
(Cloudflare), so no tracks could be downloaded from them for evaluation.

## Everything else

All visuals (ocean, sky, lighthouse, lanterns, gate, star chart), the
boot-lantern canvas, and the procedural sea-bed audio (waves, pad,
chimes) are original, hand-written code and shaders in this repository —
no downloaded models, textures, or samples.
