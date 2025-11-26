import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs/promises';
import { getKeysFilePath, generateCredentialsErrorMessage, OAuthCredentials } from './utils.js';

function parseCredentialsJSON(keysContent: string): OAuthCredentials {
  const keys = JSON.parse(keysContent);

  if (keys.installed) {
    // Standard OAuth credentials file format
    const { client_id, client_secret, redirect_uris } = keys.installed;
    return { client_id, client_secret, redirect_uris };
  } else if (keys.client_id && keys.client_secret) {
    // Direct format
    return {
      client_id: keys.client_id,
      client_secret: keys.client_secret,
      redirect_uris: keys.redirect_uris || ['http://localhost:3000/oauth2callback']
    };
  } else {
    throw new Error('Invalid credentials file format. Expected either "installed" object or direct client_id/client_secret fields.');
  }
}

async function loadCredentialsFromFile(): Promise<OAuthCredentials> {
  const keysContent = await fs.readFile(getKeysFilePath(), "utf-8");
  return parseCredentialsJSON(keysContent);
}

async function loadCredentialsWithFallback(): Promise<OAuthCredentials> {
  // Priority 1: Base64 encoded environment variable (for cloud deployment like Railway)
  const base64Creds = process.env.GOOGLE_OAUTH_CREDENTIALS_BASE64;
  if (base64Creds) {
    try {
      const decoded = Buffer.from(base64Creds, 'base64').toString('utf-8');
      process.stderr.write('Using OAuth credentials from GOOGLE_OAUTH_CREDENTIALS_BASE64\n');
      return parseCredentialsJSON(decoded);
    } catch (error) {
      throw new Error(`Failed to decode GOOGLE_OAUTH_CREDENTIALS_BASE64: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Priority 2: Load credentials from file (CLI param, env var, or default path)
  try {
    return await loadCredentialsFromFile();
  } catch (fileError) {
    // Generate helpful error message
    const errorMessage = generateCredentialsErrorMessage();
    throw new Error(`${errorMessage}\n\nOriginal error: ${fileError instanceof Error ? fileError.message : fileError}`);
  }
}

export async function initializeOAuth2Client(): Promise<OAuth2Client> {
  // Always use real OAuth credentials - no mocking.
  // Unit tests should mock at the handler level, integration tests need real credentials.
  try {
    const credentials = await loadCredentialsWithFallback();
    
    // Use the first redirect URI as the default for the base client
    return new OAuth2Client({
      clientId: credentials.client_id,
      clientSecret: credentials.client_secret,
      redirectUri: credentials.redirect_uris[0],
    });
  } catch (error) {
    throw new Error(`Error loading OAuth keys: ${error instanceof Error ? error.message : error}`);
  }
}

export async function loadCredentials(): Promise<{ client_id: string; client_secret: string }> {
  try {
    const credentials = await loadCredentialsWithFallback();
    
    if (!credentials.client_id || !credentials.client_secret) {
        throw new Error('Client ID or Client Secret missing in credentials.');
    }
    return {
      client_id: credentials.client_id,
      client_secret: credentials.client_secret
    };
  } catch (error) {
    throw new Error(`Error loading credentials: ${error instanceof Error ? error.message : error}`);
  }
}