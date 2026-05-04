# AI Resume Builder — full stack

Production-style monorepo matching your build spec: React (Vite) + Tailwind, Node/Express, MongoDB, OpenAI, Multer + `pdf-parse`, and PDF downloads via `pdfkit`.

## Folder structure

```text
resume-builder/
├── backend/                 # Express API
│   ├── src/
│   │   ├── config/          # Database
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # JWT auth
│   │   ├── models/          # Users, Projects, GeneratedResumes
│   │   ├── routes/          # REST routes
│   │   ├── services/        # OpenAI + PDF
│   │   └── server.js
│   └── package.json
├── frontend/                # React SPA
│   ├── src/
│   │   ├── api/             # Fetch helper
│   │   ├── components/
│   │   ├── context/         # Auth
│   │   ├── pages/
│   │   └── ...
│   └── package.json
└── README.md (this file)
```

## Prerequisites

- Node.js 18+
- MongoDB ([Atlas free tier](https://www.mongodb.com/atlas/database) recommended) or Docker / local MongoDB  
- OpenAI API key for **AI generate** (`OPENAI_API_KEY` in `.env`)

### Troubleshooting (“not working”)

1. **`MONGO_URI is not set` or API exits immediately** — Create `resume-builder/backend/.env` by copying `.env.example` and set **`MONGO_URI`** (Atlas SRV URI or local `mongodb://127.0.0.1:27017/resume_builder`).
2. **`ECONNREFUSED` / `Server selection timed out`** — Mongo is not reachable. Quick fix: Atlas cluster + paste SRV URI. Or run `docker compose up -d` from the **repo root** (starts Mongo on port 27017) and keep the local URI above.
3. **Frontend: “Cannot reach the API”** — Start the backend on port **5000** and open the UI with **`npm run dev`** (Vite), not `file://…`, so `/api` is proxied correctly.
4. **Login works but Generate fails** — Set **`OPENAI_API_KEY`** in `backend/.env` and reload the API.
5. **One-shot DB check**: `cd resume-builder/backend && npm run check-db`

## 1. Backend setup

```bash
cd resume-builder/backend
cp .env.example .env
# Edit .env: MONGO_URI, JWT_SECRET, OPENAI_API_KEY
npm install
npm run dev
```

Listen port defaults to `5000`.

### Environment variables

| Variable           | Description                          |
| ------------------ | ------------------------------------ |
| `PORT`             | API port                             |
| `MONGO_URI`        | Mongo connection string              |
| `JWT_SECRET`       | Secret for signing JWTs              |
| `JWT_EXPIRES_IN`   | Optional, default `7d`               |
| `OPENAI_API_KEY`   | OpenAI key (server only)             |
| `GOOGLE_CLIENT_ID` | Google OAuth **Web client ID** (server verifies ID tokens) |
| `CLIENT_ORIGIN`    | CORS origin(s), e.g. Vercel URL     |

### Google Sign-In (optional)

1. In [Google Cloud Console](https://console.cloud.google.com/) create a project (or pick an existing one).
2. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
3. Application type: **Web application** (not iOS/Android for this flow).
4. **Authorized JavaScript origins** (required):
   - `http://localhost:5173` (Vite dev)
   - Production: `https://your-domain.example` (exact origin, no path)
5. **Authorized redirect URIs** — optional for the popup + ID-token flow; add if Google Console or your setup asks for it.
6. Copy the **same** Web client ID into **both** env files:
   - `resume-builder/backend/.env` → `GOOGLE_CLIENT_ID=...`
   - `resume-builder/frontend/.env` → `VITE_GOOGLE_CLIENT_ID=...` (must use the `VITE_` prefix so Vite exposes it)
7. **Restart** the backend and **restart** the Vite dev server (env is read at startup).
8. End-to-end flow: user clicks Google → frontend receives `credential` (JWT) → `POST /api/auth/google` with `{ "credential": "..." }` or `{ "token": "..." }` → server verifies with `google-auth-library` → returns your app JWT + user.

**Common mistakes:** mismatched client IDs, missing `VITE_` prefix, forgetting to restart dev servers, wrong OAuth type (must be Web client).

Email/password auth continues to work unchanged; Google links `googleId` + `profilePicture` on the user document when used.

### REST API (mounted under `/api`)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `POST` | `/auth/register` | — | Register |
| `POST` | `/auth/login` | — | Login (returns JWT) |
| `POST` | `/auth/google` | — | Body: `{ credential }` or `{ token }` (Google ID JWT) → returns app JWT |
| `GET`  | `/projects` | JWT | List resume projects |
| `POST` | `/projects` | JWT | Create project |
| `GET`  | `/projects/:id` | JWT | Load one project |
| `PUT`  | `/projects/:id` | JWT | Update structured data + PDF text |
| `DELETE` | `/projects/:id` | JWT | Delete project |
| `POST` | `/upload-resume` | JWT | Form: `resume` (file), `projectId` |
| `POST` | `/generate-resume` | JWT | Body: `projectId`, `jobDescription` |
| `GET`  | `/resume-pdf/:id` | JWT | Download PDF for a `GeneratedResume` id |
| `POST` | `/assistant/chat` | JWT | Body: `{ message, projectId? }` — in-app AI coach |
| `POST` | `/resume-score` | JWT | Body: `{ projectId, jobDescription? }` — score + notes JSON |
| `GET`  | `/project/:projectId/generations` | JWT | List generations (no full text) |

## 2. Frontend setup

Dev server proxies `/api` to `http://localhost:5000`.

```bash
cd resume-builder/frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Optional: set `VITE_API_URL` to your deployed API (e.g. `https://your-api.onrender.com`) for production builds — no trailing slash.

## 3. Typical user flow

1. Sign up / log in  
2. Dashboard → **New project**  
3. Multi-step **Resume form** (saved to Mongo)  
4. **Upload PDF** (optional; text merged for AI)  
5. **Job description** (stored in sessionStorage for the session)  
6. **Generate & preview** → **Download PDF**

## 4. Deployment checklist

**Frontend (Vercel)**  
- Framework preset: Vite  
- Build: `cd frontend && npm ci && npm run build`  
- Output: `frontend/dist`  
- Env: `VITE_API_URL=https://your-backend.example.com`  

**Backend (Render / Railway)**  
- Start: `node src/server.js` (or `npm start`)  
- Env: `MONGO_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, `CLIENT_ORIGIN` (your Vercel domain)

**MongoDB Atlas**  
- Whitelist hosting provider IPs (or `0.0.0.0/0` with strong auth for small projects)  
- Connection string in `MONGO_URI`

**Common issues**  
- CORS: set `CLIENT_ORIGIN` to exact frontend origin  
- 401 on PDF: SPA must send `Authorization` (this app uses authenticated `fetch` blob download)  
- OpenAI errors: verify billing and key scope

## License

MIT — use and adapt freely for your portfolio or product.

## Run
https://frontend-sand-eight-xya4czd8dy.vercel.app/
