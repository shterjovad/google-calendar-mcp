#!/bin/bash
# Script to encode OAuth credentials to base64 for Railway deployment

set -e

# Find the client_secret file
CRED_FILE=$(find . -maxdepth 1 -name "client_secret_*.json" -type f | head -n 1)

if [ -z "$CRED_FILE" ]; then
    echo "❌ Error: No client_secret_*.json file found in current directory"
    echo "Please make sure your OAuth credentials file is in the project root"
    exit 1
fi

echo "📁 Found credentials file: $CRED_FILE"
echo ""
echo "🔐 Base64 encoded credentials (copy this for Railway):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$CRED_FILE" | base64 -w 0
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Copy the string above and set it as GOOGLE_OAUTH_CREDENTIALS_BASE64"
echo "   in your Railway project's environment variables"
echo ""
echo "📝 Quick Railway CLI command:"
echo '   railway variables set GOOGLE_OAUTH_CREDENTIALS_BASE64="<paste-string-here>"'

