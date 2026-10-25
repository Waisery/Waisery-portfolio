import { pathToFileURL } from 'node:url';
import User from './models/User.js';
import Project from './models/Project.js';
import BlogPost from './models/BlogPost.js';
import { config } from './config.js';
import { connectDatabase, disconnectDatabase } from './database.js';

export async function seedContent({ demo = config.demo } = {}) {
  const email = demo ? 'admin@waisery.local' : process.env.ADMIN_EMAIL;
  const password = demo ? 'WaiseryDemo!2026' : process.env.ADMIN_PASSWORD;
  const username = demo ? 'Waisery' : process.env.ADMIN_USERNAME;
  if (!email || !password || !username) throw new Error('Set ADMIN_EMAIL, ADMIN_USERNAME and ADMIN_PASSWORD to provision an administrator.');
  if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) throw new Error('Administrator password must be 12–72 UTF-8 bytes.');
  let admin = await User.findOne({ email: email.toLowerCase() });
  if (!admin) admin = await User.create({ username, email, password, role: 'admin' });
  else if (admin.role !== 'admin') throw new Error('This email belongs to an author. Use a new administrator email.');
  if (!demo && process.env.SEED_SAMPLE_CONTENT !== 'true') return;
  if (!(await Project.exists({}))) await Project.create([
    { title: 'Stillwater', description: 'An exploration of quiet digital spaces. Stillwater brings the rhythm of a Chinese celestial landscape into a contemplative interface, pairing carefully measured typography with luminous imagery. This sample project demonstrates a visual direction; replace it with your own work and links.', imageUrl: '/images/stillwater.webp', category: 'Digital experience', tags: ['React', 'Visual design'], featured: true, sample: true, user: admin._id },
    { title: 'Fieldnotes', description: 'A place for ideas to take shape. Fieldnotes explores a focused writing experience with considered reading measures, warm materials, and simple tools for organizing observations. This is an illustrative portfolio entry, ready to replace with a real project.', imageUrl: '/images/fieldnotes.webp', category: 'Web application', tags: ['React', 'Node.js', 'MongoDB'], featured: true, sample: true, user: admin._id },
    { title: 'Jade Horizon', description: 'A cinematic study of light, scale, and spatial storytelling. White-jade architecture and an endless cloud sea form an immersive canvas for a responsive digital experience. This is sample work, not a commissioned client project.', imageUrl: '/images/jade-horizon.webp', category: 'Visual exploration', tags: ['Art direction', 'Creative development'], sample: true, user: admin._id },
  ]);
  if (!(await BlogPost.exists({}))) await BlogPost.create([
    { title: 'Making room for the essential', excerpt: 'On quiet interfaces, deliberate choices, and the things we choose to leave out.', category: 'Design notes', imageUrl: '/images/fieldnotes.webp', sample: true, author: admin._id, content: 'A useful starting point\n\nEvery interface asks for a little of our attention. The work begins by deciding what deserves that attention, and what can quietly step aside. A clear page gives each element a reason to be there.\n\nWorking with restraint\n\nWhitespace is part of the composition. It helps separate decisions, makes relationships visible, and gives an image or a sentence room to carry its meaning. Start with the task, then choose the few details that help it.\n\nFrom atmosphere to interaction\n\nA beautiful opening is an invitation. The next step still needs to be obvious: a project to explore, an article to read, or a message to send. The atmosphere should make those actions feel natural.\n\nThis is a sample article provided with the portfolio. Edit it in the dashboard to tell your own story.' },
    { title: 'Building a small, considered API', excerpt: 'A few notes on keeping data models, permissions, and error responses easy to understand.', category: 'Development', imageUrl: '/images/stillwater.webp', sample: true, author: admin._id, content: 'Begin with the relationships\n\nA portfolio API has a handful of important relationships: projects belong to a user, articles have an author, and comments connect a reader to an article. Model these relationships explicitly before writing the screens.\n\nPermissions are part of the model\n\nAuthentication tells the server who is asking. Authorization decides whether that person can perform the action. Check ownership on every update and delete, even when the interface hides the button.\n\nErrors should help the next attempt\n\nUse consistent error responses and explain what a person can change. A duplicate email, an expired session, and an unavailable database need different recovery paths.\n\nThis is a sample article. Replace it with your own technical writing.' },
    { title: 'Finding a visual language in light', excerpt: 'White jade, an open horizon, and a study in turning references into a coherent digital world.', category: 'Reflections', imageUrl: '/images/jade-horizon.webp', sample: true, author: admin._id, content: 'Read the reference carefully\n\nA reference image holds more than a palette. Look for the way it organizes light, the space between its subjects, and the balance between a quiet area and a detailed one.\n\nChoose one leading idea\n\nThe cloud-lit architectural opening and the figure-led composition share a material language. Their transition works when the horizon, color temperature, and negative space feel continuous.\n\nKeep the interface readable\n\nAtmosphere can be rich while controls remain simple. Use real text, maintain contrast, and adapt the artwork to the available space rather than shrinking the whole composition.\n\nThis is a sample reflection included for demonstration.' },
  ]);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await connectDatabase(); await seedContent(); console.log('Administrator provisioning and requested sample content completed.'); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { await disconnectDatabase(); }
}
