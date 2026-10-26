# Waisery portfolio and journal

A personal portfolio and blog built with React, React Router, CSS Modules, Node.js, Express, and MongoDB/Mongoose. The white homepage has five chapters with keyframed transitions and Chinese celestial artwork. Other pages use ivory backgrounds, pale gold accents, and dark text.

## Live URLs

- Frontend: https://waisery-portfolio.vercel.app/
- API base: https://waisery-api.onrender.com/api
- API health: https://waisery-api.onrender.com/api/health

The owner configured these deployment addresses. `VERIFICATION.md` records deployment checks and any acceptance work still to complete.

## Features

- Responsive portfolio, project gallery, project detail pages, about page, and journal.
- Article detail pages with populated authors and authenticated comments.
- Controlled contact form with validation and persistent message storage.
- Registration and sign-in with bcrypt password hashing and expiring JWTs.
- Authentication Context with session restoration, a protected dashboard, and navigation that changes when a user signs in.
- Project CRUD for administrators; article CRUD restricted to the original author.
- Administrator contact inbox with read/unread controls.
- Consistent JSON errors, request validation, URL validation, Helmet, CORS, rate limits, and graceful shutdown.
- MongoDB storage in both the local demo and production, with data fetched through the API.

The biography, learning focus, and contact details come from the owner's reference frontend. The owner uses Waisery as the public name and approved publishing the contact email and six works: three literary texts, two videos, and one audio recording. The literary texts are in English. Videos and audio keep their original recording language, with English descriptions and controls.

Generated covers are identified as illustrations, and local demo entries carry sample labels. The celestial figure does not depict the portfolio owner. Source details are in `CONTENT_SOURCES.md` and `MEDIA_PROVENANCE.json`.

## Requirements

- Node.js 24.19.0 is recommended and used for verification. The complete test suite supports Node.js 22.22.2 or newer in the 22.x line, 24.15.0 or newer in the 24.x line, or 26.x and later.
- npm and an internet connection for the first dependency installation.
- MongoDB Atlas for production.

## Run locally

From the repository root:

```bash
npm ci --include=dev --ignore-scripts
npm run dev
```

Open http://127.0.0.1:5173/. The API runs on port 4000, and Vite proxies `/api` to it.

In development, leaving the MongoDB URI unset starts a local MongoDB process with example content. The first run downloads the MongoDB distribution for your platform, which can take several minutes. The application saves database files in `server/.data/mongodb` and caches the binaries in `server/.data/binaries`.

Local demo administrator:

```text
Email: admin@waisery.local
Password: WaiseryDemo!2026
```

These credentials belong to the local demo database. Production rejects demo mode and does not create this account automatically.

To use your own database, copy `server/.env.example` to `server/.env`. Set `MONGODB_URI`, choose a random `JWT_SECRET` of at least 32 characters, and set `DEMO_MODE=false`. Set `MONGODB_DB_NAME` to keep this application's collections in their own database. If your network restricts SRV resolution, `DNS_SERVERS` accepts a comma-separated list of DNS resolvers.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the API and Vite together |
| `npm test` | Run real-MongoDB API integration tests, frontend API/gesture tests, and React component workflow tests |
| `npm run build` | Build the frontend into `client/dist` |
| `npm start` | Start the API; also serves `client/dist` if present |
| `npm run check` | Run both test suites and the frontend production build |
| `npm run seed` | Provision the explicitly configured administrator; optionally seed sample content |
| `npm run import:works` | Explicitly import the six approved works into the configured local database |

## Project structure

```text
client/
  src/                 React pages, reusable components, auth context, API client
  public/images/       Generated production artwork in WebP format
server/
  src/models/          User, Project, BlogPost, Comment, Message
  src/controllers/     Request handlers
  src/routes/          REST endpoint wiring
  src/middleware/      JWT protection, role checks, validation, errors
  test/                Database-backed API integration tests
scripts/               Local connection checks and source packaging
render.yaml            Render API deployment configuration
vercel.json            Vercel frontend build, SPA routing, security headers
IMPLEMENTATION_PLAN.md Scope, acceptance criteria, and implementation decisions
```

## API endpoints

Send `Authorization: Bearer <token>` with protected requests and use `Content-Type: application/json` for JSON bodies. Error responses use `{ "error": { "message": "...", "fields": { "field": "..." } } }`. Input validation errors include `fields`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API and database readiness |
| GET | `/api/profile` | Public | Portfolio profile and demo-mode status |
| POST | `/api/users/register` | Public | Create an author account and return a session |
| POST | `/api/users/login` | Public | Authenticate and return a session |
| GET | `/api/users/me` | Signed in | Verify the current user |
| GET | `/api/projects` | Public | List projects with owner username |
| GET | `/api/projects/:id` | Public | Read one project |
| POST | `/api/projects` | Administrator | Create a project |
| PUT | `/api/projects/:id` | Administrator | Update a project |
| DELETE | `/api/projects/:id` | Administrator | Delete a project |
| GET | `/api/blog` | Public | List articles with author username |
| GET | `/api/blog/:id` | Public | Read an article with populated comments |
| POST | `/api/blog` | Signed in | Create an article |
| PUT | `/api/blog/:id` | Original author | Update an article |
| DELETE | `/api/blog/:id` | Original author | Delete an article and its comments |
| GET | `/api/blog/:postId/comments` | Public | List populated comments |
| POST | `/api/blog/:postId/comments` | Signed in | Add a comment |
| POST | `/api/contact` | Public | Save a contact message |
| GET | `/api/messages` | Administrator | Read the contact inbox |
| PATCH | `/api/messages/:id` | Administrator | Change read/unread status |

Registration accepts `username`, `email`, and `password` and creates an author account. It cannot grant administrator access. Project payloads accept `title`, `description`, `imageUrl`, `repoUrl`, `liveUrl`, `category`, `tags`, `featured`, `sample`, `mediaType`, `mediaUrl`, `content`, and `contentNote`. Article payloads accept `title`, `content`, `excerpt`, `imageUrl`, `category`, and `sample`. The server takes owner and author IDs from the verified session and ignores IDs submitted in those request fields.

The server hashes passwords with the pure-JavaScript `bcryptjs` implementation of bcrypt, using 12 salt rounds and a 72-byte input limit. JWTs expire after eight hours; verification checks the signature algorithm, issuer, and audience. Browser sessions use sessionStorage and are cleared on sign-out or authentication rejection.

## Render backend

Connect this repository as a Node web service. Keep Root Directory empty.

```text
Build Command: npm ci --omit=dev --ignore-scripts
Start Command: npm start
Health Check Path: /api/health
```

Set these environment variables in Render:

```text
NODE_ENV=production
NODE_VERSION=24.19.0
DEMO_MODE=false
MONGODB_DB_NAME=waisery_portfolio
MONGODB_URI=<your Atlas connection string>
JWT_SECRET=<a unique random secret of at least 32 characters>
CLIENT_ORIGIN=https://waisery-portfolio.vercel.app
```

Render supplies `PORT`. Production data lives in Atlas, so the service does not need a persistent disk. The Blueprint asks for the URI and origin and can generate a JWT secret. Credentials are configured outside the Blueprint.

For a first deployment, temporarily set `CLIENT_ORIGIN=http://127.0.0.1:5173` and deploy the API. Use its URL when deploying Vercel, then update `CLIENT_ORIGIN` to the final frontend origin. Separate multiple allowed origins with commas. To test a Vercel preview, add that preview's exact origin.

## Vercel frontend

Import this repository, choose Vite, and keep Root Directory at the repository root (`./`). `vercel.json` supplies:

```text
Build Command: npm run build -w client
Output Directory: client/dist
Install Command: npm ci --include=dev --ignore-scripts
```

Set `VITE_API_URL=https://waisery-api.onrender.com/api` as a Config variable for the environments you want to deploy. Vite includes this public address in the browser bundle, so changing it requires a redeploy. Keep database credentials and the JWT signing secret on the backend.

## Provision a production administrator

Public registration creates authors. To create the owner's administrator account, temporarily set `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the backend environment, then run `npm run seed` with those settings. The password must be at least 12 characters and no more than 72 UTF-8 bytes. Remove `ADMIN_PASSWORD` from the hosting environment afterward. The seed command refuses to promote an existing author account.

Set `SEED_SAMPLE_CONTENT=true` to include example projects and articles. Seeding adds examples only to empty collections and leaves existing content in place. Production startup does not run the seed command.

## Personalization and artwork

Edit `server/src/profile.js` to change the biography and focus areas. Manage projects and posts in the dashboard, and remove the sample label when publishing your own content. Use http/https URLs for hosted images and `/images/...` paths for bundled images.

`ASSET_PROVENANCE.json` contains the illustration prompts and reference descriptions. The WebP files also include generation descriptions. Interface text and controls use semantic HTML and remain separate from the artwork.

`COVER_ARTWORK.json` records the six work covers, including prompts, export paths, and file hashes. The two `major dissemination` films use images supplied by the creator. The four literary and audio covers are photographic interpretations made with built-in ImageGen. `TYPOGRAPHY_REVIEW.md` documents text sizes and the browser checks still needed.

The About page places the biography and contact links beside a courtyard image, with the exploration list below. On small screens, these sections form one column. The courtyard is a conceptual image, not a photograph of the owner's workspace. Its ImageGen prompt and file hash are in `ABOUT_ARTWORK.json`.

## Submission

`_Project.zip` contains the application source, artwork, lockfile, example environment files, deployment configuration, and documentation. It excludes secret environment files, installed dependencies, local database files, caches, and build output. Check the production URLs after each deployment before treating the hosted submission as complete.

## Presentation and creative works

The homepage has five chapters: Opening, Work, About, Journal, and Contact. Move between them with the chapter controls, arrow keys, Page Up/Down, or a deliberate wheel or swipe gesture. Trackpad momentum cannot skip several chapters at once. Within a long chapter, scroll to its edge before a further gesture changes chapters. Browser zoom and media controls keep their normal behavior. Reduced-motion settings use a short fade, and inner pages use ordinary scrolling.

Projects accept `mediaType` values `image`, `text`, `video`, and `audio`, with `mediaUrl`, `content`, and `contentNote` for the work itself. Text works need content, while audio and video need a safe URL. Put local media in `client/public/media`. These fields are editable in the dashboard. Public detail pages show the full text or native playback controls, with autoplay disabled.

Stop the development server before importing from the command line: both processes use the same local demo database directory. Configure administrator credentials before running an import. `npm run import:works -- --production` reads the ignored `server/.env.production.local` file and connects to the Atlas database specified there. It creates the configured administrator if needed and upserts the six works by their stable source keys. Other records stay in place. Imports never run at server startup, and production imports do not add sample content. Re-importing replaces the imported fields of those six works, so save any later dashboard edits before running it again.

The production administrator credentials are kept in the ignored local file `server/.admin-credentials.local.txt`, which is excluded from Git and `_Project.zip`.

## Specification audit

SPEC_COMPLIANCE.md lists the evidence for each specification phase, model field, endpoint, route, and submission requirement. The test suite has 25 backend integration tests using real MongoDB, 12 frontend API/gesture tests, and 11 React workflow tests using an isolated test API. Live browser acceptance is still pending, and the production journal currently has no articles.
