# PocketBase Auth Token Persistence Fix

## Problem
Railway deployment of the SERVER service was failing with:
```
[server] PocketBase connection not valid. Auth store invalid.
```

Despite successful authentication API calls (status 200) in the PocketBase logs, the Node.js PocketBase SDK client was not persisting the authentication token, causing all subsequent API requests to fail with 401 errors.

## Root Cause
The PocketBase SDK's `authStore` is designed for browser environments with localStorage. In Node.js server-to-server scenarios, the auth token returned by `authWithPassword()` was not being explicitly saved to the authStore, resulting in a disconnected state where the SDK had validated credentials but no valid auth token in memory.

## Solution
Explicitly capture and save the authentication response to the authStore:

```javascript
// BEFORE (lines 32-34 in server.js)
await pb
  .collection("_superusers")
  .authWithPassword(process.env.PB_MAIL, process.env.PB_PASS);

// AFTER (lines 32-36 in server.js)
const authData = await pb
  .collection("_superusers")
  .authWithPassword(process.env.PB_MAIL, process.env.PB_PASS);
// Explicitly save token to authStore for Node.js environments
pb.authStore.save(authData.token, authData.record);
```

## Changes Made
**File:** `server.js` (connectToPocketBase function)
- Captured the `authData` response from `authWithPassword()`
- Called `pb.authStore.save(authData.token, authData.record)` to persist auth state
- Added explanatory comment for Node.js context

**Commit:** `a3e2cc7`
**Branch:** `claude/fix-railway-pocketbase-deploy-gE8sN`

## Environment Context
- **Platform:** Railway deployment
- **Server:** Node.js Express + Socket.io on port 3000
- **Database:** PocketBase on Railway (https://db-production-4bc8.up.railway.app)
- **Auth Credentials:**
  - `PB_MAIL`: solv.leong@gmail.com
  - `PB_PASS`: L0rem*psum
  - `POCKETBASE_URL`: https://db-production-4bc8.up.railway.app

## Expected Behavior After Fix
✅ Server startup logs should show:
```
✅ Connected to PocketBase
```

✅ Database seeding should proceed with all three stages:
1. Characters (core bootstrap)
2. NPC data, templates, conditions
3. Campaign data, sessions, abilities

✅ Socket.io connections should receive full initialData with characters and rolls

## Related Files
- `server.js`: Main Express server with PocketBase connection logic
- `data/characters.js`: PocketBase CRUD wrappers (all functions require valid `pb` auth)
- `data/rolls.js`: Roll logging module
- `.env` (Railway): Contains `PB_MAIL`, `PB_PASS`, `POCKETBASE_URL`

## Testing
To verify the fix on Railway:
1. Merge this commit to `main`
2. Redeploy the SERVER service
3. Monitor logs for:
   - Connection attempts and success message
   - Seeding stage completion
   - Socket.io client connections receiving initialData

## PocketBase SDK Version
- **Package:** `pocketbase@^0.26.0`
- **Documentation:** https://pocketbase.io/docs/sdk-setup/

---

**Commit Message:**
```
fix: explicitly save PocketBase auth token to authStore for Node.js

The PocketBase SDK's authStore was not persisting the authentication token
in Node.js environments, causing subsequent API requests to fail with 401
errors. Now explicitly save the token and record after successful
authentication to ensure the auth state is properly maintained.

This fixes the 'Auth store invalid' error on Railway deployments.
```
