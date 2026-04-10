/**
 * TableRelay server entry point.
 * Thin initialization: Express, Socket.io, PocketBase auth, seeding, and the token refresh timer.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { connectToPocketBase } from './backend/pb';
import { seedIfEmpty } from './backend/seed';
import { ensureAuth } from './backend/pb';
import { preloadTokens, getMainIP } from './backend/handlers/misc';
import { initSocket } from './backend/socket/index';
import router from './backend/router';

const PORT = parseInt(process.env.PORT || '3000', 10);
const CONTROL_PANEL_ORIGIN = process.env.CONTROL_PANEL_ORIGIN || 'http://localhost:5173';
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://localhost:8090';
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(router);

async function main(): Promise<void> {
  const connected = await connectToPocketBase();
  await seedIfEmpty();
  preloadTokens();
  initSocket(io);

  // Proactively refresh the PocketBase auth token to keep it alive.
  const REAUTH_INTERVAL_MS = 23 * 60 * 60 * 1000;
  const RETRY_INTERVAL_MS = 5 * 60 * 1000;

  function scheduleRefresh(intervalMs: number): void {
    const timer = setTimeout(async () => {
      console.log('[server] PocketBase token refresh...');
      const ok = await ensureAuth();
      if (!ok) {
        console.error('[server] ❌ Token refresh failed. Retrying in 5 minutes...');
        scheduleRefresh(RETRY_INTERVAL_MS);
      } else {
        scheduleRefresh(REAUTH_INTERVAL_MS);
      }
    }, intervalMs);
    if ((timer as unknown as { unref?: () => void }).unref) {
      (timer as unknown as { unref: () => void }).unref();
    }
  }

  scheduleRefresh(connected ? REAUTH_INTERVAL_MS : RETRY_INTERVAL_MS);

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    const mainIP = getMainIP();
    console.log(`[server] Local URL: http://localhost:${PORT}`);
    console.log(`[server] Network URL: http://${mainIP}:${PORT}`);
    console.log(`[server] Stage origin: ${CONTROL_PANEL_ORIGIN}`);
    console.log('[server] PocketBase URL:', POCKETBASE_URL);
  });

  httpServer.on('error', (error: NodeJS.ErrnoException) => {
    if (!error?.code) { console.error('[server] Failed to start due to an unknown error.'); process.exit(1); }
    if (error.code === 'EADDRINUSE') {
      console.error(`[server] Port ${PORT} is already in use.`);
      console.error('[server] Stop the other process using this port, or run with a different PORT.');
      process.exit(1);
    }
    if (error.code === 'EACCES') {
      console.error(`[server] Permission denied while trying to use port ${PORT}.`);
      console.error('[server] Try a non-privileged port such as 3000 or 3001.');
      process.exit(1);
    }
    console.error(`[server] Startup error (${error.code}): ${error.message}`);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
