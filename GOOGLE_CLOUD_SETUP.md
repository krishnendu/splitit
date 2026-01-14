# Google Cloud Setup Guide (Sheets API + OAuth)

This guide walks you through creating the **Google Sheets API key** and **OAuth Client ID** needed by the app’s onboarding screen.

## 1) Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project selector at the top-left.
3. Click **New Project**.
4. Name it (e.g., `SplitIt`) and click **Create**.

## 2) Configure OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services → OAuth consent screen**.
2. Choose **External** (recommended for personal use) and click **Create**.
3. Fill in:
   - **App name**: `SplitIt`
   - **User support email**
   - **Developer contact email**
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes**, then add:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `../auth/spreadsheets`
6. Click **Save and Continue** until finished.
7. If you keep the app in **Testing**, add your email under **Test users**.

## 3) Enable Required APIs

1. Go to **APIs & Services → Library**.
2. Enable these:
   - **Google Sheets API**
   - **Google People API** (needed for profile info in Google Sign-In)

## 4) Create OAuth Client ID

1. Go to **APIs & Services → Credentials**.
2. Click **Create Credentials → OAuth client ID**.
3. Choose **Web application**.
4. Add **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://www.splitit.in`
   - `https://krishnendu.github.io` (optional if you still access GitHub Pages domain)
5. Click **Create** and copy the **Client ID**.

This is the value you paste into **OAuth Client ID** in the app.

## 5) Create Google Sheets API Key

1. In **APIs & Services → Credentials**, click **Create Credentials → API key**.
2. Copy the key (this is your **Sheets API Key**).
3. (Recommended) Restrict the key:
   - **Application restrictions**: HTTP referrers
   - Add these referrers:
     - `http://localhost:5173/*`
     - `https://www.splitit.in/*`
     - `https://krishnendu.github.io/*` (optional)
   - **API restrictions**: Restrict to **Google Sheets API**

This is the value you paste into **Google Sheets API Key** in the app.

## 6) Find Your Google Sheet ID

Open your Google Sheet and copy the ID from the URL:

```
https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit
```

Paste `<SHEET_ID>` into **Google Sheet ID** in the app.

## 7) Quick Checklist

- OAuth consent screen configured
- Google Sheets API enabled
- Google People API enabled
- OAuth Client ID created (Web)
- API key created and restricted
- Sheet ID copied from URL

## Notes

- If your app is in **Testing**, only **Test users** can sign in.
- Use **External** for your own Google account or invite others later.
- If you update domains, update both **OAuth** and **API key** referrers.
