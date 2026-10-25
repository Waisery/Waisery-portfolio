import { z } from 'zod';
const text = (min, max) => z.string().trim().min(min, `Use at least ${min} characters.`).max(max, `Use no more than ${max} characters.`);
const url = z.string().trim().max(2000).refine(v => !v || /^https?:\/\/[^\s]+$/i.test(v), 'Enter a full http or https URL.').default('');
const image = z.string().trim().max(2000).refine(v => !v || /^https?:\/\/[^\s]+$/i.test(v) || /^\/images\/[a-zA-Z0-9_./-]+$/.test(v), 'Use an http/https URL or a local /images/ path.').default('');
const password = z.string().min(6, 'Use at least 6 characters.').refine(v => Buffer.byteLength(v, 'utf8') <= 72, 'Use a password of at most 72 UTF-8 bytes.');
export const schemas = {
  register: z.object({ username: text(2, 40).regex(/^[\p{L}\p{N}_ .-]+$/u, 'Use letters, numbers, spaces, dots, dashes or underscores.'), email: z.email('Enter a valid email address.').max(254).transform(v => v.toLowerCase()), password }),
  login: z.object({ email: z.email('Enter a valid email address.').max(254).transform(v => v.toLowerCase()), password: z.string().min(1).max(200) }),
  project: z.object({ title: text(2, 150), description: text(10, 12000), imageUrl: image, repoUrl: url, liveUrl: url, category: text(2, 60).default('Digital experience'), tags: z.array(text(1, 30)).max(10).default([]), featured: z.boolean().default(false), sample: z.boolean().default(false) }),
  post: z.object({ title: text(3, 180), content: text(20, 50000), excerpt: z.string().trim().max(400).default(''), imageUrl: image, category: text(2, 60).default('Reflections'), sample: z.boolean().default(false) }),
  comment: z.object({ body: text(1, 2000) }),
  contact: z.object({ name: text(2, 100), email: z.email('Enter a valid email address.').max(254), message: text(10, 5000) }),
  read: z.object({ read: z.boolean() }),
};
export const validate = name => (req, _res, next) => { req.input = schemas[name].parse(req.body); next(); };
