# The Historical Correspondent
### A classroom companion for Reacting to the Past simulations

*© Alastair Kocho-Williams*

---

## What this is

The Historical Correspondent is an AI-powered classroom tool designed to run alongside [Reacting to the Past](https://reactingconsortium.org/) (RTTP) simulations. It does not replace any student role. Instead it provides three things that no student is assigned to do:

- **The Press** — period-appropriate newspaper dispatches, bulletins, and headlines generated on demand
- **Vox Populi** — the voice of national publics (crowds, workers, families) reacting to events as they unfold
- **Rumor Mill** — unverified intelligence, café gossip, and diplomatic fragments that add fog-of-war atmosphere

It also includes a **Speech Tracker** that transcribes student speeches (via microphone or typed input), analyzes them historically, generates a period press dispatch, and logs everything to a persistent **Archive** for post-session review.

---

## Supported scenarios

| Scenario | Game |
|---|---|
| **July Crisis 1914** | Juggernaut: The Causes of the First World War |
| **Japan 1941** | Fate of a Nation: Japan at the Crossroads |
| **Restoring the World: Yalta 1945** | Restoring the World: The Paris Peace Conference of 1919 (adapted for Yalta) |

Additional scenarios can be added — see [Adding a new scenario](#adding-a-new-scenario) below.

---

## Instructor quick-start

### The Correspondent tab

This is the main interface. Select your scenario at the top, then choose a mode:

| Mode | What it does |
|---|---|
| **The Press** | Generates newspaper dispatches, headlines, and wire bulletins in period voice |
| **Vox Populi** | Speaks as national publics — crowds, workers, families — differentiated by country |
| **Rumor Mill** | Delivers unverified intelligence and atmospheric gossip, clearly marked UNCONFIRMED |
| **Instructor** | Answers historical questions directly; also reveals the event injection panel |

Type a prompt in the text box and press Send (or Enter). Example prompts:

- *"What is the Times of London saying about the Serbian response?"*
- *"How are workers in St. Petersburg reacting to the mobilisation order?"*
- *"Give me a rumor about what Germany is doing behind closed doors."*

### Injecting events (Instructor mode)

Switch to **Instructor** mode to reveal the event injection panel. Select a pre-loaded historical event from the dropdown and click **Dispatch**. The correspondent will respond with a press bulletin, a multi-national public reaction, and an unconfirmed rumor fragment — all at once. Public mood labels update automatically.

### Public mood

Below the chat area, each faction displays a short qualitative label describing their current mood (e.g. *"Bellicose, demanding punishment of Serbia"*). These update automatically after events are injected or speeches are analyzed. They are historically grounded descriptions, not numerical scores. Use the **Reset** button to return to scenario defaults between sessions or class groups.

### Section A / Section B

The toggle in the top-right corner switches between two completely independent instances of the tool — separate mood states, separate archives, separate chat histories. Designed for instructors teaching two sections of the same course. Each section's data persists across browser sessions.

---

## Speech Tracker

The Speech Tracker is designed to be used on a single device at the front of the room, or on individual student devices if preferred.

### To record and analyze a speech

1. Switch to the **Speech Tracker** tab.
2. Enter the speaker's name/role and select their faction from the dropdown.
3. Click **Mic: Start** to begin recording. The transcript appears in real time as the student speaks. Click **Mic: Stop** when finished.
   - Alternatively, type or paste a transcript directly into the text box.
4. Click **Analyze Speech**.

The tool returns four things:

| Output | Description |
|---|---|
| **Summary** | 2–3 sentence neutral historical summary of the argument |
| **Press dispatch** | A period newspaper report covering the speech, with dateline |
| **Faction reactions** | How 3–4 key factions would likely respond — supportive, hostile, or mixed |
| **Historical notes** | Constructive feedback on historical accuracy, anachronisms, or missed arguments |

Public mood labels update automatically based on the speech content. The press dispatch is also added to the Correspondent's chat history, so subsequent queries in that tab will reflect what was said.

**Voice input browser support:** Chrome and Chromium-based browsers (Edge, Brave) support the microphone feature. Safari has partial support. Firefox does not — students using Firefox should type or paste transcripts.

---

## Archive

The **Archive** tab logs every analyzed speech for the current section and scenario. Each entry shows:

- Speaker name and faction
- Date and time
- Historical summary
- Press dispatch
- Historical notes
- Full transcript (collapsible)

The archive persists across sessions. Use **Clear archive** to reset it at the end of a simulation run. Archives are stored separately per section (A/B) and per scenario.

---

## Tips for classroom use

**Projecting the tool:** The tool works well projected at the front of the room. Students can see public mood shifts in real time as events are injected and speeches are delivered.

**Pacing events:** The pre-loaded events in the Instructor dropdown are sequenced roughly chronologically. You don't have to use them all — inject events that match where your students have taken the simulation, not a fixed timeline.

**Using the Rumor Mill:** The Rumor Mill works best when used sparingly. One or two well-timed unconfirmed dispatches — *"UNCONFIRMED: Russian troops are said to be moving toward the Galician frontier"* — can raise the stakes without distorting the historical record.

**Post-session debrief:** The Archive is a useful debrief resource. The press dispatches and historical notes give students a mirror of what they argued and how it landed.

---

## Adding a new scenario

The tool is designed to be extended. Each scenario is a self-contained data object in `public/index.html`. To add a new RTTP game, find the `SC_DATA` object in the `<script>` section and add a new entry following this template:

```javascript
your_scenario_id: {
  label: "Display name of your scenario",

  // Opening mood for each faction — short, italicised, historically grounded
  defaultMoods: [
    { name: "Faction one", label: "One-line mood description" },
    { name: "Faction two", label: "One-line mood description" },
    // Add as many factions as needed
  ],

  // Faction names for the Speech Tracker dropdown
  factionNames: ["Faction one", "Faction two", "Other"],

  // Pre-loaded events for the Instructor injection panel
  events: [
    "First key event",
    "Second key event",
    // 8–12 events works well
  ],

  // Period-appropriate bylines for dispatches
  sources: {
    press:  ["Wire service, City", "Newspaper, City"],
    vox:    ["Street report, City", "Crowd, location"],
    rumor:  ["Source undisclosed", "Unverified, location"]
  },

  // One or two sentences describing the historical context for mood updates
  moodCtx: "Brief description of scenario and what public mood reflects.",

  // The main system prompt — the most important field
  // Tell the AI: what historical moment it is, who the students are playing,
  // what the three voices are, and what rules apply.
  system: `You are The Historical Correspondent for a Reacting to the Past simulation of [YOUR SCENARIO].
You are NOT a player — you are the atmosphere: press, street, rumor mill.
It is [DATE/PERIOD].
[Describe the situation students are simulating.]
THREE VOICES:
(1) THE PRESS: [describe period press style and sources]
(2) VOX POPULI: [describe relevant national publics and their concerns]
(3) RUMOR MILL: unverified intelligence — mark UNCONFIRMED.
RULES: Never speak for student roles. Exist in the present. Under 150 words unless asked for a full dispatch.`
},
```

Then add a button for it in the scenario bar in the HTML:

```html
<button class="sc-btn" onclick="setSc('your_scenario_id')" id="btn-your_scenario_id">
  Your Scenario Name
</button>
```

The quality of the `system` prompt determines the quality of the output. A detailed, historically specific briefing produces much richer dispatches than a thin one. Describe the stakes, the key actors, the information environment, and the feel of the historical moment.

---

## Technical overview

For instructors comfortable with code, or anyone setting up their own deployment.

### Architecture

```
Browser (public/index.html)
    ↓  POST /api/chat
server.js (Express)
    ↓  POST https://api.anthropic.com/v1/messages
Anthropic API
```

The browser never communicates with Anthropic directly. All API calls are proxied through the Express server, which holds the API key in an environment variable. This means the key is never exposed in page source or browser network requests to Anthropic.

### Storage

The deployed version uses `localStorage` for persistence. This means:
- Data persists per browser, per device
- Section A/B data and archives survive page refreshes and browser restarts
- Data does not sync across devices — the tool is designed for single-device instructor use
- Clearing browser data will clear the archive and mood states

### Files

| File | Purpose |
|---|---|
| `server.js` | Express server — serves static files and proxies API requests |
| `package.json` | Node dependencies and start script |
| `public/index.html` | Complete frontend — all HTML, CSS, and JavaScript |
| `DEPLOY.md` | Step-by-step Railway deployment guide |
| `README.md` | This file |

### Dependencies

- `express` — web server
- `node-fetch` — server-side HTTP requests to Anthropic
- Node.js ≥ 18

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key — set in Railway dashboard, never in code |
| `PORT` | No | Port to listen on — Railway sets this automatically |

### API model

The tool uses `claude-sonnet-4-20250514`. To change the model, find `claude-sonnet-4-20250514` in `server.js` (it is passed through from the frontend request body — no change needed server-side) or in `public/index.html` in the `callClaude` function.

### Running locally for development

```bash
# Install dependencies
npm install

# Set your API key
export ANTHROPIC_API_KEY=your_key_here

# Start the server
npm start

# Open in browser
open http://localhost:3000
```

---

## Deployment

See `DEPLOY.md` for the full step-by-step guide to deploying on Railway with a custom subdomain.

---

## License and attribution

*© Alastair Kocho-Williams*

This tool was developed for use in courses using Reacting to the Past games. If you adapt it for other scenarios or distribute it to colleagues, please retain the copyright notice.
