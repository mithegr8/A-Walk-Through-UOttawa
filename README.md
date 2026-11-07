# A Walk Through uOttawa

Campus walking map with Google Street View. The Google key lives on the server,
so any computer, phone or the cylinder can open the site and Street View just works.

```
public/index.html        the website
api/                     online backend (Vercel functions)
lib/streetview.js        shared Street View logic
server.js                same backend for running on one computer
vercel.json              Vercel settings
.env.example             template for the key when running locally
```

---

## Put it online (Vercel, free)

### 1. Put the folder on GitHub
1. Make a free account at github.com.
2. Click **+ → New repository**, name it `uottawa-walk`, and keep it **Private** if you like. Click **Create**.
3. On the new repo page, click **uploading an existing file**.
4. Drag in **everything inside** the `uottawa-campus` folder: `api`, `lib`, `public`, `server.js`, `vercel.json`, `package.json`, `README.md`, `.gitignore`.
   **Do not upload a `.env` file.**
5. Click **Commit changes**.

### 2. Deploy on Vercel
1. Go to vercel.com and **Sign up with GitHub**.
2. Click **Add New → Project** and **Import** `uottawa-walk`.
3. Leave Framework Preset as **Other**. Don't change the build settings.
4. Open **Environment Variables** and add:
   - Name: `GOOGLE_MAPS_EMBED_KEY`
   - Value: your Google key
5. Click **Deploy**. After about a minute you get a link like `https://uottawa-walk.vercel.app`.

That link works from any computer. Open it on the cylinder too.

### 3. Tell Google your new address
Google Cloud Console → **APIs & Services → Credentials** → click your key:
- **API restrictions:** Restrict key → **Maps Embed API** only.
- **Application restrictions:** **Websites**, then add:
  - `https://uottawa-walk.vercel.app/*` (use your actual link)
  - `http://localhost:3000/*` (only if you also run it locally)
- Save. Changes can take a few minutes to apply.

### Updating the site later
Upload the new `index.html` into the `public` folder on GitHub and commit.
Vercel redeploys automatically within a minute.

### If you change the key
Vercel → your project → **Settings → Environment Variables** → edit it,
then **Deployments → ⋯ → Redeploy**. New values only apply after a redeploy.

---

## Run on one computer instead (optional)
1. Install Node 18+.
2. Copy `.env.example` to `.env` and paste your key.
3. In this folder: `node server.js`, then open `http://localhost:3000`.

---

## Troubleshooting
- **Street View shows the "Enable" key form:** the key isn't set on Vercel,
  or you opened the `.html` file directly instead of the website link.
  Add the variable and redeploy.
- **Google says the key is invalid or the page can't load:** your website link
  isn't in the key's Website restrictions yet, or it hasn't applied yet.
- **The key is visible in the browser's network tab:** that's normal for
  Google's embed. The Website restriction stops anyone using it elsewhere,
  and the Maps Embed API is free.
