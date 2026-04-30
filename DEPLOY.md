# Deploying The Historical Correspondent to Railway
## rttp.coldalchemygames.com (or any subdomain you choose)

---

## What's in this folder

```
rttp-companion/
├── server.js          ← Node/Express proxy server (holds your API key)
├── package.json       ← Dependencies and start command
├── .gitignore         ← Keeps secrets and junk out of Git
└── public/
    └── index.html     ← The full app (calls /api/chat, not Anthropic directly)
```

---

## Step 1 — Create a GitHub repository

1. Go to https://github.com and sign in (create a free account if needed).
2. Click **New repository**.
3. Name it `rttp-companion` (or anything you like). Set it to **Private**.
4. Click **Create repository**.
5. Upload the contents of this folder to the repository:
   - You can drag and drop the files using GitHub's web interface, or
   - Use GitHub Desktop (https://desktop.github.com) for a simpler experience.
   - Make sure the folder structure is preserved — `public/index.html` must stay inside a `public` folder.

---

## Step 2 — Get an Anthropic API key

1. Go to https://console.anthropic.com and sign in.
2. Click **API Keys** in the left sidebar.
3. Click **Create Key**, give it a name (e.g. "RTTP Companion"), and copy the key.
4. Keep this key private — it will only go into Railway's environment variables, never in your code.

**Cost note:** For two sections used a few hours per week across a semester, expect roughly $5–15 total in API usage.

---

## Step 3 — Deploy on Railway

1. Go to https://railway.app and sign in with your GitHub account.
2. Click **New Project → Deploy from GitHub repo**.
3. Select your `rttp-companion` repository.
4. Railway will detect it as a Node.js app and start deploying automatically.
5. Once deployed, click on your service, then go to **Variables**.
6. Click **New Variable** and add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste your API key from Step 2
7. Railway will automatically redeploy with the key in place.

Your app is now live at a Railway-generated URL (something like `rttp-companion-production.up.railway.app`). Test it there before setting up your domain.

---

## Step 4 — Connect your subdomain

You want the app at something like `rttp.coldalchemygames.com`.

**In Railway:**
1. Go to your service → **Settings → Networking → Custom Domain**.
2. Click **Add Domain** and type your subdomain (e.g. `rttp.coldalchemygames.com`).
3. Railway will show you a CNAME target — copy it (looks like `xxxx.railway.app`).

**In your domain registrar / DNS provider** (wherever coldalchemygames.com is managed):
1. Add a new DNS record:
   - **Type:** CNAME
   - **Name:** `rttp` (or whatever subdomain prefix you want)
   - **Value:** paste the CNAME target from Railway
   - **TTL:** 3600 (or Auto)
2. Save the record.

DNS changes typically take 5–30 minutes to propagate. Railway automatically provisions an SSL certificate (https) once the domain is connected.

---

## Step 5 — Test

Open `https://rttp.coldalchemygames.com` (or your chosen subdomain) in a browser.

- Select a scenario and mode.
- Type a message and confirm the correspondent responds.
- Test the speech tracker.
- Confirm the archive saves across a page refresh (it uses localStorage, so it persists per browser).

---

## Updating the app

Any time you want to change the tool — add a scenario, adjust prompts, change styling — edit the files in your GitHub repository. Railway detects the push and redeploys automatically within about 60 seconds.

---

## Sharing with other professors

If you want to give other instructors their own instance:
- They create their own Railway account and GitHub repo.
- You share the folder with them; they follow Steps 1–4 with their own API key.
- Each professor controls their own deployment and pays for their own API usage.

Alternatively, you can host a single shared instance and give colleagues the URL — they'd share your API costs, so a usage-tracking arrangement might be worth discussing if that grows.

---

## Troubleshooting

**App loads but responses fail:**
Check that `ANTHROPIC_API_KEY` is set correctly in Railway Variables (no extra spaces).

**Domain not connecting:**
DNS propagation can take up to 24 hours in rare cases. Check your CNAME record is pointed at the correct Railway URL.

**"Transmission interrupted" errors:**
Usually a network blip. If persistent, check Railway logs (service → Deployments → View Logs) for server-side errors.

**Railway free tier limits:**
Railway's free tier includes $5 of usage per month. For light classroom use this is often sufficient, but you may want to add a payment method to avoid interruptions during class. Their hobby plan is $5/month.

---

*© Alastair Kocho-Williams*
