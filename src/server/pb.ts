/**
 * PocketBase client singleton + auth helpers.
 * Imported by: handlers/, seed.ts, socket/index.ts
 */
import PocketBase from 'pocketbase';

export const pb = new PocketBase(
  process.env.POCKETBASE_URL || 'http://127.0.0.1:8090',
);

const PB_SUPERUSERS = '_superusers';

export async function connectToPocketBase(): Promise<boolean> {
  if (!pb) {
    console.error('❌ PocketBase client (pb) is not initialized.');
    return false;
  }
  const { PB_MAIL, PB_PASS } = process.env;
  if (!PB_MAIL || !PB_PASS) {
    console.error('❌ Missing PB_MAIL or PB_PASS environment variables.');
    return false;
  }

  const maxRetries = 5;
  let retries = 0;
  let lastError: unknown = null;

  while (retries < maxRetries) {
    try {
      const authData = await pb.collection(PB_SUPERUSERS).authWithPassword(PB_MAIL, PB_PASS);

      if (!authData || !authData.token || !authData.record) {
        throw new Error('Invalid auth response from PocketBase');
      }

      // PocketBase SDK auto-persist only works in browser environments;
      // in Node.js the token must be saved explicitly.
      pb.authStore.save(authData.token, authData.record);

      console.log('✅ Connected to PocketBase');
      return true;
    } catch (err) {
      lastError = err;
      retries++;

      const status = (err as any)?.response?.status ?? (err as any)?.status;
      if (status === 401 || status === 403) {
        console.error('❌ PocketBase authentication failed (non-retriable):', (err as Error).message || err);
        break;
      }

      if (retries < maxRetries) {
        const base = Math.min(16000, Math.pow(2, retries - 1) * 1000);
        const jitter = Math.floor(Math.random() * 1000);
        const delay = base + jitter;
        console.warn(
          `⚠️  PocketBase connection failed (attempt ${retries}/${maxRetries}). Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error(
    '❌ Failed to connect to PocketBase after',
    maxRetries,
    'attempts:',
    (lastError as Error)?.message || lastError,
  );
  return false;
}

/**
 * Ensures the PocketBase auth store is valid. Tries a lightweight token
 * refresh first; if that fails it falls back to full re-authentication.
 */
export async function ensureAuth(): Promise<boolean> {
  if (pb.authStore.isValid) {
    try {
      await pb.collection(PB_SUPERUSERS).authRefresh();
      return true;
    } catch {
      if (pb.authStore.isValid) {
        return true;
      }
    }
  }
  console.warn('[server] Auth store invalid or refresh failed — re-authenticating with PocketBase...');
  return connectToPocketBase();
}
