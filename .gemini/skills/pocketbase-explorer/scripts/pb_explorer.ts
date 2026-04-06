import PocketBase from 'pocketbase';

const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const PB_MAIL = process.env.PB_MAIL;
const PB_PASS = process.env.PB_PASS;

const pb = new PocketBase(PB_URL);

async function authenticate() {
  if (PB_MAIL && PB_PASS) {
    try {
      await pb.collection('_superusers').authWithPassword(PB_MAIL, PB_PASS);
      return true;
    } catch (err) {
      console.error('❌ Auth failed:', (err as Error).message);
      return false;
    }
  }
  return false;
}

async function listCollections() {
  const isAdmin = await authenticate();
  if (!isAdmin) {
    console.log('⚠️ Not authenticated as admin. Listing common public collections...');
    return ['characters', 'rolls', 'sessions'];
  }
  const collections = await pb.collections.getFullList();
  return collections.map(c => ({ name: c.name, type: c.type, id: c.id }));
}

async function getCollectionSchema(collectionName: string) {
  const isAdmin = await authenticate();
  if (!isAdmin) {
    throw new Error('Admin authentication required to view full schema.');
  }
  const collection = await pb.collections.getOne(collectionName);
  return collection;
}

async function queryCollection(collectionName: string, filter = '', sort = '-created', limit = 50) {
  // Try unauthenticated first for public collections
  try {
    const result = await pb.collection(collectionName).getList(1, limit, {
      filter,
      sort,
    });
    return result;
  } catch (err: any) {
    if (err.status === 403 || err.status === 400) {
      const isAdmin = await authenticate();
      if (isAdmin) {
        return await pb.collection(collectionName).getList(1, limit, {
          filter,
          sort,
        });
      }
    }
    throw err;
  }
}

const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

async function run() {
  try {
    switch (command) {
      case 'list':
        console.log(JSON.stringify(await listCollections(), null, 2));
        break;
      case 'schema':
        if (!arg1) throw new Error('Collection name required');
        console.log(JSON.stringify(await getCollectionSchema(arg1), null, 2));
        break;
      case 'query':
        if (!arg1) throw new Error('Collection name required');
        console.log(JSON.stringify(await queryCollection(arg1, arg2 || ''), null, 2));
        break;
      default:
        console.log('Usage: pb_explorer.ts <list|schema|query> [collection] [filter]');
    }
  } catch (err: any) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  }
}

run();
