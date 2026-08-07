const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured on server.' });
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy request failed.' });
  }
});

// --- Persistent storage (moods, speech archive) -------------------------
// Single JSON file holding a flat key/value map. Reads are served from an
// in-memory cache; writes update the cache immediately and are flushed to
// disk through a serialized queue with an atomic write-then-rename so a
// crash mid-write can never leave store.json truncated or corrupt.
//
// DATA_DIR should point at a Railway Volume mount (e.g. "/data") so the
// archive survives redeploys, not just restarts. Without a volume attached,
// this falls back to a local "data/" folder next to the server, which
// Railway's ephemeral filesystem will wipe on the next deploy.
//
// If the requested DATA_DIR can't be created or written to (wrong path,
// permissions, volume not yet mounted at boot), we fall back rather than
// crash the whole server — a live class needs the app up even if the
// archive can't persist that session, and the fallback is logged loudly
// so the misconfiguration is easy to spot in Railway's deploy logs.
function resolveDataDir(requested) {
  try {
    fs.mkdirSync(requested, { recursive: true });
    fs.accessSync(requested, fs.constants.W_OK);
    console.log(`Storage directory: ${requested}`);
    return requested;
  } catch (err) {
    const fallback = path.join(__dirname, 'data');
    console.error(`WARNING: could not use DATA_DIR="${requested}" (${err.code || err.message}).`);
    console.error(`WARNING: falling back to "${fallback}" — this will NOT survive a redeploy.`);
    console.error('WARNING: check that the Railway Volume is attached and mounted at this exact path.');
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

const DATA_DIR = resolveDataDir(process.env.DATA_DIR || path.join(__dirname, 'data'));
const STORE_FILE = path.join(DATA_DIR, 'store.json');

let store = {};
try {
  if (fs.existsSync(STORE_FILE)) {
    store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    console.log(`Loaded ${Object.keys(store).length} storage key(s) from ${STORE_FILE}`);
  } else {
    console.log(`No existing store.json at ${STORE_FILE} — starting fresh.`);
  }
} catch (err) {
  console.error('Failed to read storage file, starting fresh:', err);
  store = {};
}

let writeChain = Promise.resolve();
function persist() {
  writeChain = writeChain.then(() => new Promise((resolve) => {
    const tmpFile = STORE_FILE + '.tmp';
    const json = JSON.stringify(store);
    fs.writeFile(tmpFile, json, (err) => {
      if (err) { console.error('Storage write failed:', err); return resolve(); }
      fs.rename(tmpFile, STORE_FILE, (err2) => {
        if (err2) console.error('Storage rename failed:', err2);
        resolve();
      });
    });
  }));
  return writeChain;
}

app.get('/api/storage/:key', (req, res) => {
  const key = req.params.key;
  if (!Object.prototype.hasOwnProperty.call(store, key)) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json({ value: store[key] });
});

app.put('/api/storage/:key', async (req, res) => {
  const key = req.params.key;
  const value = req.body && req.body.value;
  if (typeof value !== 'string') {
    return res.status(400).json({ error: 'Body must be { "value": "<string>" }' });
  }
  store[key] = value;
  await persist();
  res.json({ ok: true });
});

app.delete('/api/storage/:key', async (req, res) => {
  const key = req.params.key;
  delete store[key];
  await persist();
  res.json({ ok: true });
});
// --------------------------------------------------------------------------

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RTTP Companion running on port ${PORT}`));
