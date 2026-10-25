# Implementation plan

## Scope and architecture

Implement the supplied Full-Stack Portfolio & Blog specification as a React SPA in `client/` and an Express MVC API in `server/`. Production uses MongoDB Atlas through Mongoose. All browser data comes from the API. A clearly identified local demo uses a real, local MongoDB process with persistent data and seeded example content; it is disabled in production.

## Delivery steps

1. **Foundation:** npm workspaces, environment templates, shared development commands, API health endpoint, configuration validation, and central JSON errors.
2. **Data and authentication:** validated User, Project, BlogPost, Comment, and Message models; bcrypt password hashing; expiring JWTs; request validation; authentication and role middleware. Public registration creates an author. Only an explicitly provisioned administrator manages projects and contact messages. Only a post's author edits/deletes it.
3. **API:** public project and blog read endpoints; protected project/blog CRUD; populated author/comment relationships; authenticated comments; contact form and administrator message inbox. Include search, tags, safe URL fields, request limits, and Helmet/CORS protections.
4. **Public UI:** responsive Home/About, Projects, Project Detail, Blog, Blog Detail, Contact, Login, Register, and Not Found routes. Reusable navigation, footer, cards, form fields, loading/error/empty states, and authentication context. Use accessible controls and CSS Modules.
5. **Dashboard:** authenticated content workspace with project/post creation and editing, confirmation before deletion, author ownership controls, and an administrator inbox. Include Bearer authorization on protected API calls.
6. **Verification:** exercise real Mongoose persistence, registration/login, unauthorized access, role isolation, ownership, CRUD, comments, contact validation, and cascade cleanup; build the production client; inspect desktop and mobile screens and core browser workflows.
7. **Handoff:** README with endpoint inventory and local/production instructions, deployment configuration, and `_Project.zip` excluding secrets, dependencies, local data, and generated caches.

## Working assumptions

- Confirmed portfolio name: Waisery. Biography, professional description, projects, and articles remain unknown. Illustrative content must be labeled sample content.
- User requested Impeccable and ImageGen visual direction samples before frontend implementation. Generate three contrasting homepage comps, show them together, and await a selection. Backend work can proceed independently.
- Visual revision: preserve study B's whitespace and elegance, adopt the Chinese celestial white-jade, gold-lit, cloud-sea and fine-openwork references from style_prompts.md and the two supplied images. Three revised homepage compositions are saved in `.impeccable/mocks/white-jade/`; final selection remains pending.
- Skill context launcher is unavailable in this environment; apply the design references directly. No workflow preference is stored on the user's behalf.
- Atlas MCP access is disabled for the connected organization. No database credentials are available. Production URLs must be recorded only after a successful deployment and live verification; do not fabricate them.
- A live deployment requires repository hosting and an Atlas URI. Prepare configuration and finish local verification before any remaining setup request.

## Acceptance criteria

- Every required endpoint and route exists and communicates through the API.
- Password hashes never appear in responses; registration cannot grant administrator access.
- Anonymous writes, non-admin project writes, and edits by another post author are rejected.
- Contact submissions and comments persist; deleting a post removes its comments.
- The client has usable loading, failure, empty, validation, expired-session, and narrow-screen states.
- Production refuses demo mode and missing/weak secrets; it never silently switches to example data.
- Tests, build results, and deployment limitations are reported accurately.

## Content reference update

Use src.zip only to adapt the biography, learning focus, skills and contact information. Use Waisery as the public name; the user explicitly approved publishing the contact email. Ignore lab placeholders, the octocat feed, missing portrait assets, and console-only contact behavior. The final project collection will be Literature, Art, and Media; await the user's local materials before replacing the labeled demonstration collection. No project data is imported from the reference archive in this update.
