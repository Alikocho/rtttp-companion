# The Historical Correspondent

An AI-powered classroom companion for [Reacting to the Past](https://reacting.barnard.edu/) (RTTP) simulations. It runs alongside a live game session as ambient historical atmosphere — period press dispatches, public opinion, and rumor — and gives instructors a tool for tracking and giving feedback on in-game speeches.

Built for two seminar sections running any of three scenarios:

- **July Crisis 1914**
- **Japan 1941: Between Pan-Asianism and the West**
- **Restoring the World: Yalta 1945**

© Alastair Kocho-Williams

---

## Part 1 — For instructors

### The three tabs

**Correspondent** — a chat interface with four modes (chips above the input box):

| Mode | What it does |
|---|---|
| **The Press** | Newspaper dispatches, headlines, bulletins — period voice |
| **Vox Populi** | The voice of the people, with national/factional variation |
| **Rumor Mill** | Unverified atmospheric intelligence, marked `UNCONFIRMED:` or `RUMOR:` |
| **Instructor** | Direct, out-of-character answers to historical/rules questions, plus an event-injection bar for pushing breaking news into the room |

Faction mood labels along the side update automatically — when a chat exchange or a tracked speech touches on conflict-adjacent language (war, mobilize, ultimatum, negotiate, etc.), Claude re-evaluates and rewrites the affected mood labels.

**Speech Tracker** — for capturing and giving feedback on student speeches:
1. Enter the speaker's name and faction.
2. Click **Mic: Start** to transcribe live (Chrome/Edge only — uses the browser's built-in Web Speech API), or just type/paste a transcript directly.
3. Click **Analyze Speech**. Claude returns a summary, an in-character press dispatch, faction-by-faction reactions, and historical notes on the speech's strengths or anachronisms.
4. The result also updates the mood sidebar and is saved automatically to the Archive.

**Archive** — every analyzed speech for the current Section + scenario, newest first. Each entry can be expanded to show the full transcript.
- **Export JSON** downloads the current section/scenario's archive as a timestamped `.json` file — a good end-of-class habit, independent of server-side backups.
- **Clear archive** wipes it (asks for confirmation first — this cannot be undone).

### Section A / Section B

The pill toggle at the top switches between two independent class sections. Each section has its own mood state, chat context, and speech archive per scenario — nothing crosses over between A and B.

### Switching scenarios

The three scenario buttons switch the active game. Switching scenario or section resets the visible chat (new conversation, same archive/mood persistence) — nothing is lost, it's just scoped correctly to what you're viewing.

---

## Part 2 — For technical deployers

### Stack

- **Frontend:** single file, `public/index.html` — vanilla JS, no build step.
- **Backend:** `server.js` — a minimal Express server that does two jobs:
  1. Proxies chat completions to the Anthropic API (`/api/chat`), keeping the API key server-side only.
  2. Serves a small persistent key/value store (`/api/storage/:key`) for moods and the speech archive, backed by a JSON file on disk.
- **Hosting:** Railway, with a **Volume** attached for persistent storage.
- **DNS:** Cloudflare, CNAME record with the proxy (orange cloud) disabled.

### File layout

```
rttp-companion/
├── server.js
├── package.json
└── public/
    └── index.html
```

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Server-side only. Never appears in client code. |
| `DATA_DIR` | Recommended | Where `store.json` (moods + archive) lives. Point this at a mounted Railway Volume, e.g. `/data`. Without it, storage defaults to a local `data/` folder that **is wiped on every redeploy**. |
| `PORT` | No | Defaults to `3000`; Railway sets this automatically. |

### Local development

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... npm start
```

Visit `http://localhost:3000`. Storage will default to `./data/store.json` unless `DATA_DIR` is set.

### Deploying to Railway

1. Push this repo (or connect it) to a new Railway service.
2. **Settings → Variables**: add `ANTHROPIC_API_KEY`. Setting the variable alone isn't enough — **trigger a redeploy** after saving it, or the key won't be live yet. (This is the cause of "TRANSMISSION INTERRUPTED" errors immediately post-deploy — see Troubleshooting.)
3. Attach persistent storage:
   - `⌘K` / `Ctrl+K` → search "volume" → create a volume, mount it at `/data`.
   - Add env var `DATA_DIR=/data`.
   - Redeploy. (Attaching a volume causes a brief restart — expected.)
4. Point your domain at Railway: in Cloudflare DNS, add a **CNAME** record to Railway's provided target, with the proxy status set to **DNS only** (grey cloud, not orange).

### Troubleshooting

**"TRANSMISSION INTERRUPTED" on every message.**
Almost always the API key. Check:
- `ANTHROPIC_API_KEY` is set in Railway → Variables.
- You redeployed *after* setting/changing it — env var changes don't take effect on a running instance.
- Browser DevTools → Network tab → find the `/api/chat` request → check the response body for the actual error (invalid key, rate limit, etc.) rather than guessing.
- Railway → Deployments → logs, for server-side errors.

**Archive/moods reset after a deploy.**
`DATA_DIR` isn't pointed at a mounted volume — it's writing to the ephemeral container filesystem, which resets on every redeploy (though it survives plain restarts). Attach a volume (see above).

**Voice transcription doesn't work.**
The Web Speech API is Chrome/Edge only. Safari and Firefox will show "Voice not supported here" — students can still type or paste transcripts.

---

## Extending: adding a new scenario

Scenarios live in the `SC_DATA` object near the top of the `<script>` block in `index.html`. Each one is a single entry keyed by a short id (`july1914`, `japan1941`, `yalta1945`):

```js
newscenario1968:{
  label:"Display name shown on the scenario tab",

  defaultMoods:[
    {name:"Faction or public name", label:"Starting mood, present tense, under ~12 words"},
    // one entry per faction/public you want tracked in the sidebar
  ],

  factionNames:["Faction A","Faction B","Faction C"], // powers the Speaker's Faction dropdown in Speech Tracker

  events:[
    "Short description of a breaking-news event",
    // used to populate the Instructor tab's event-injection dropdown
  ],

  sources:{
    press:["Wire service or newspaper, dateline", ...],
    vox:["Type of person/place for a Vox Populi voice", ...],
    rumor:["Type of source for an unattributed rumor", ...]
  },

  moodCtx:"A few sentences of scenario context, fed to Claude specifically when regenerating mood labels — who the players are, what's at stake, key names.",

  system:`The full system prompt for the Correspondent. Should cover: the scenario setup, every named faction/character with enough detail to role-play accurately, the three-voices structure (Press/Vox Populi/Rumor Mill), and ground rules — never speak for a student role, stay in the historical present, never reveal hidden/secret student objectives, keep responses under ~150 words unless a full dispatch is requested.`
}
```

Then add a button for it in the scenario bar (`<button class="sc-btn" onclick="setSc('newscenario1968')">...</button>`), matching the existing three.

Keep `system` prompts detailed and name-specific — the app leans on named factions and characters (not generic categories) for historically grounded, differentiated responses in each voice.
