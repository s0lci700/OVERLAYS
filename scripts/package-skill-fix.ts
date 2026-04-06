import AdmZip from 'adm-zip';
import { join } from 'path';

try {
  const zip = new AdmZip();
  zip.addLocalFolder('pocketbase-explorer');
  zip.writeZip('pocketbase-explorer.skill');
  console.log('✅ Successfully created pocketbase-explorer.skill');
} catch (err) {
  console.error('❌ Error creating skill:', err.message || err);
}
