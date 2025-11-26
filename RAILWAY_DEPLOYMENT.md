# Railway Deployment Guide for Google Calendar MCP

This guide will help you deploy the Google Calendar MCP Server to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Google OAuth Credentials**: Your `client_secret_*.json` file (stored locally, NOT in git)
3. **GitHub Repository**: Your forked repository at `https://github.com/shterjovad/google-calendar-mcp`

## Step 1: Prepare Google OAuth Credentials

Before deploying, you need to set up your OAuth credentials as environment variables.

### Convert your credentials to base64:

```bash
# On Linux/WSL
cat client_secret_*.json | base64 -w 0 > credentials_base64.txt

# Copy the output, you'll need it for Railway
cat credentials_base64.txt
```

### Update OAuth Redirect URIs in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add your Railway URL to **Authorized redirect URIs**:
   - Format: `https://your-app-name.up.railway.app/oauth/callback`
   - You'll get the exact URL after deployment, so you may need to update this later

## Step 2: Deploy to Railway

### Option A: Deploy via Railway Dashboard

1. **Go to Railway Dashboard**: [railway.app/new](https://railway.app/new)

2. **Deploy from GitHub**:
   - Click "Deploy from GitHub repo"
   - Select `shterjovad/google-calendar-mcp`
   - Click "Deploy Now"

3. **Configure Environment Variables**:
   
   Go to your project → Variables tab and add:
   
   ```
   TRANSPORT=http
   HOST=0.0.0.0
   PORT=3000
   GOOGLE_OAUTH_CREDENTIALS_BASE64=<paste your base64 credentials here>
   NODE_ENV=production
   ```

4. **Add Start Command** (if not auto-detected):
   - Go to Settings → Deploy
   - Set Start Command: `npm run start:http:public`
   - Set Build Command: `npm run build`

5. **Generate Domain**:
   - Go to Settings → Networking
   - Click "Generate Domain"
   - Copy your URL (e.g., `https://your-app-name.up.railway.app`)

### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to your GitHub repo
railway link

# Set environment variables
railway variables set TRANSPORT=http
railway variables set HOST=0.0.0.0
railway variables set PORT=3000
railway variables set NODE_ENV=production

# Set OAuth credentials (replace with your base64 string)
railway variables set GOOGLE_OAUTH_CREDENTIALS_BASE64="<your-base64-credentials>"

# Deploy
railway up
```

## Step 3: Configure OAuth Credentials Loading

You need to modify the authentication code to load credentials from the base64 environment variable. Let me create a helper:

Add this to your `src/auth/index.ts` or credentials loading file:

```typescript
function loadCredentials() {
  // Check for base64 encoded credentials (for Railway/cloud deployment)
  if (process.env.GOOGLE_OAUTH_CREDENTIALS_BASE64) {
    const decoded = Buffer.from(
      process.env.GOOGLE_OAUTH_CREDENTIALS_BASE64,
      'base64'
    ).toString('utf-8');
    return JSON.parse(decoded);
  }
  
  // Fall back to file-based credentials (local development)
  const credPath = process.env.GOOGLE_OAUTH_CREDENTIALS || './gcp-oauth.keys.json';
  return JSON.parse(fs.readFileSync(credPath, 'utf-8'));
}
```

## Step 4: Update Google OAuth Redirect URI

After deployment:

1. Copy your Railway URL: `https://your-app-name.up.railway.app`
2. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   - `https://your-app-name.up.railway.app/oauth/callback`
5. Save changes

## Step 5: Initial Authentication

After deployment, you need to authenticate once:

1. Visit your Railway URL: `https://your-app-name.up.railway.app`
2. Follow the OAuth flow to authenticate with Google
3. Tokens will be stored in Railway's persistent storage

## Step 6: Test Your Deployment

```bash
# Health check
curl https://your-app-name.up.railway.app/health

# Test MCP endpoint (if exposed)
curl https://your-app-name.up.railway.app/
```

## Persistent Storage for Tokens

Railway provides persistent storage through volumes. To configure:

1. Go to your service in Railway Dashboard
2. Click "Variables" tab
3. Add a volume mount for token storage:
   - Mount Path: `/app/.config/google-calendar-mcp`
   - Size: 1GB (minimum)

Or via CLI:
```bash
railway volume create --mount /app/.config/google-calendar-mcp
```

## Environment Variables Summary

| Variable | Value | Description |
|----------|-------|-------------|
| `TRANSPORT` | `http` | Use HTTP transport for remote access |
| `HOST` | `0.0.0.0` | Listen on all interfaces |
| `PORT` | `3000` | Server port (Railway auto-assigns) |
| `NODE_ENV` | `production` | Production mode |
| `GOOGLE_OAUTH_CREDENTIALS_BASE64` | `<base64-string>` | Your OAuth credentials encoded |

## Monitoring & Logs

View logs in Railway:
```bash
# Via CLI
railway logs

# Or in Dashboard: Project → Deployments → View Logs
```

## Troubleshooting

### Issue: "Cannot find credentials"
- Ensure `GOOGLE_OAUTH_CREDENTIALS_BASE64` is set correctly
- Verify base64 encoding has no line breaks (`-w 0` flag)

### Issue: "Redirect URI mismatch"
- Update your Google Cloud Console redirect URIs
- Ensure Railway URL matches exactly (with `/oauth/callback`)

### Issue: "Tokens expired after 7 days"
- Publish your OAuth app to production in Google Cloud Console
- See: [Authentication Guide](docs/authentication.md)

### Issue: "Connection refused"
- Verify `HOST=0.0.0.0` is set (not `localhost`)
- Check Railway port configuration

## Security Considerations

1. **HTTPS**: Railway provides free SSL certificates automatically
2. **Environment Variables**: Never commit credentials to git
3. **OAuth Scopes**: Only request necessary calendar permissions
4. **Token Storage**: Use Railway volumes for persistent token storage
5. **Production OAuth**: Publish your OAuth app to remove test mode limitations

## Costs

Railway offers:
- **Free Tier**: $5 credit/month (sufficient for testing)
- **Pro Plan**: $20/month for production use
- Pricing based on resource usage (RAM/CPU/Network)

## Next Steps

1. Set up monitoring/alerting
2. Configure custom domain (optional)
3. Enable Railway's auto-scaling
4. Set up CI/CD with GitHub Actions (optional)

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Project Issues: [GitHub Issues](https://github.com/shterjovad/google-calendar-mcp/issues)

