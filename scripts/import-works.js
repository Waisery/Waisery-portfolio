import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

// Import is explicit. Starting the API never publishes or replaces portfolio work.
if (process.argv.includes('--production')) {
  dotenv.config({ path: fileURLToPath(new URL('../server/.env.production.local', import.meta.url)), quiet: true });
  process.env.NODE_ENV = 'production';
  process.env.DEMO_MODE = 'false';
  process.env.SEED_SAMPLE_CONTENT = 'false';
}
const { connectDatabase, disconnectDatabase } = await import('../server/src/database.js');
const { config } = await import('../server/src/config.js');
const { seedContent } = await import('../server/src/seed.js');
const { default: User } = await import('../server/src/models/User.js');
const { default: Project } = await import('../server/src/models/Project.js');
const { schemas } = await import('../server/src/middleware/validate.js');
try {
  const works = JSON.parse(await readFile(new URL('../server/src/content/works.json', import.meta.url), 'utf8'));
  const validated = await Promise.all(works.map(async ({ sourceKey, contentFile, ...work }) => {
    if (!/^[a-z0-9-]+$/.test(sourceKey)) throw new Error('Every work needs a stable source key.');
    if (contentFile) {
      if (!/^[a-z0-9-]+\.txt$/.test(contentFile)) throw new Error('Invalid literature source file.');
      work.content = await readFile(new URL(`../server/src/content/${contentFile}`, import.meta.url), 'utf8');
    }
    return { sourceKey, ...schemas.project.parse(work) };
  }));
  await connectDatabase();
  await seedContent({ demo: config.demo });
  const email = config.demo ? 'admin@waisery.local' : process.env.ADMIN_EMAIL;
  const admin = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
  if (!admin) throw new Error('An explicitly configured administrator is required.');
  for (const work of validated) {
    const existing = await Project.findOne({ sourceKey: work.sourceKey });
    if (existing && String(existing.user) !== String(admin._id)) throw new Error('A source key belongs to another owner; import stopped.');
    await Project.findOneAndUpdate({ sourceKey: work.sourceKey }, { $set: { ...work, user: admin._id } }, { upsert: true, runValidators: true });
  }
  console.log(`${validated.length} approved works imported. Existing unrelated projects were preserved.`);
} catch (error) {
  console.error(error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/g, '[redacted connection string]'));
  process.exitCode = 1;
} finally { await disconnectDatabase(); }
