# 🚀 Railway Quick Start Guide

Deploy your Google Calendar MCP Server to Railway in 5 minutes!

## Prerequisites

✅ Railway account ([sign up here](https://railway.app))  
✅ Google OAuth credentials file (`client_secret_*.json`)  
✅ This repository pushed to GitHub

---

## Step 1: Encode Your Credentials

Run this command in your project directory:

```bash
./scripts/encode-credentials.sh
```

**Copy the output** - you'll need it in Step 3.

---

## Step 2: Deploy to Railway

### Option A: One-Click Deploy (Easiest)

1. Click this button: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)
2. Connect your GitHub repository: `shterjovad/google-calendar-mcp`
3. Click "Deploy Now"

### Option B: Manual Deploy

1. Go to [railway.app/new](https://railway.app/new)
2. Click "Deploy from GitHub repo"
3. Select `shterjovad/google-calendar-mcp`
4. Click "Deploy"

---

## Step 3: Set Environment Variables

In Railway Dashboard → Your Project → Variables:

```bash
TRANSPORT=http
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
GOOGLE_OAUTH_CREDENTIALS_BASE64=<paste your base64 string here>
```

**Important:** Paste the ENTIRE base64 string from Step 1 (it's very long!)

---

## Step 4: Get Your Railway URL

1. Go to Settings → Networking
2. Click **"Generate Domain"**
3. Copy your URL (e.g., `https://your-app.up.railway.app`)

---

## Step 5: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://your-app.up.railway.app/oauth2callback
   ```
4. Click **Save**

---

## Step 6: Authenticate

1. Visit your Railway URL: `https://your-app.up.railway.app`
2. Complete the OAuth flow
3. Done! 🎉

---

## Verify It's Working

```bash
# Check health
curl https://your-app.up.railway.app/health

# Should return: {"status":"ok"}
```

---

## Connect from Claude Desktop

Add to your Claude Desktop config (`~/.config/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "google-calendar": {
      "url": "https://your-app.up.railway.app"
    }
  }
}
```

Restart Claude Desktop and you're ready to use Google Calendar! 📅

---

## Troubleshooting

### "Cannot find credentials"
- Check that `GOOGLE_OAUTH_CREDENTIALS_BASE64` is set correctly
- Verify the base64 string has no extra spaces or line breaks

### "Redirect URI mismatch"
- Make sure the redirect URI in Google Cloud Console matches exactly
- Format: `https://your-app.up.railway.app/oauth2callback`

### "Tokens expire after 7 days"
- Publish your OAuth app to production in Google Cloud Console
- See: [docs/authentication.md](docs/authentication.md)

---

## Cost Estimate

- **Hobby Plan**: $5/month credit (usually sufficient for personal use)
- **Resource Usage**: ~50MB RAM, minimal CPU
- **Estimated Cost**: $0-5/month depending on usage

---

## Next Steps

- [ ] Set up custom domain (optional)
- [ ] Enable Railway metrics/monitoring
- [ ] Configure backup strategy for tokens
- [ ] Publish OAuth app to production

---

**Need help?** Open an issue at [github.com/shterjovad/google-calendar-mcp/issues](https://github.com/shterjovad/google-calendar-mcp/issues)

