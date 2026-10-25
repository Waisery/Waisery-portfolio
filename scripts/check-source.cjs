const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const dotenv = require('dotenv');
const result = spawnSync(process.env.GIT_BIN || 'git', ['-c', `safe.directory=${process.cwd()}`, 'diff', '--cached', '--name-only', '-z'], { encoding: 'utf8' });
if (result.status !== 0) throw new Error('Cannot inspect the staged source files.');
const files = result.stdout.split('\0').filter(Boolean);
const secrets = [];
for (const file of ['server/.env', 'server/.env.production.local']) {
  if (!fs.existsSync(file)) continue;
  const values = dotenv.parse(fs.readFileSync(file));
  for (const key of ['MONGODB_URI', 'MONGO_URI', 'JWT_SECRET', 'ADMIN_PASSWORD']) {
    if (values[key]?.length >= 6) secrets.push(values[key]);
  }
  if (values.MONGODB_URI) {
    try { const password = decodeURIComponent(new URL(values.MONGODB_URI).password); if (password.length >= 6) secrets.push(password); } catch {}
  }
}
const problems = [];
for (const file of files) {
  const example = /(?:^|\/)\.env\.(?:production\.)?example$/.test(file);
  if ((!example && /(?:^|\/)\.env(?:\.|$)/.test(file)) || /(?:^|\/)(?:node_modules|\.data|dist|\.npm-cache|\.git)\//.test(file)) problems.push(`${file}: private or generated file`);
  const content = fs.readFileSync(file).toString('utf8');
  if (secrets.some(value => content.includes(value))) problems.push(`${file}: contains a local secret value`);
}
if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
else console.log(`Source check passed: ${files.length} staged files; no private environment files, caches, or known local secrets.`);
