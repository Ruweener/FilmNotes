# 🎬 FilmNotes

**Your personal movie notebook.** Discover films, keep a watchlist, write reviews with ratings, and get recommendations based on what you actually like.

### 👉 [Try it live: filmnotes.onrender.com](https://filmnotes.onrender.com/)

> **Heads-up:** FilmNotes runs on Render's free tier. If nobody has visited in a while, the first load can take 30–60 seconds while the server wakes up. After that it's fast.

---

## Features

- **Accounts:** sign up and log in with email and password. Your reviews and watchlist are private to you.
- **Discover movies:** browse trending titles, search by name, or filter by genre.
- **Movie details:** see the overview, genres, rating, and where to stream, rent, or buy each film.
- **Watchlist:** save movies you want to see and remove them once you've watched them.
- **Reviews:** rate a movie and write notes about it. Edit or delete reviews later, and sort them by date or rating.
- **Personalized recommendations:** a "Recommended for you" row on the home page, built from the genres you rate highest.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Tailwind CSS |
| Backend | Node.js, Express, Mongoose, Helmet (CSP), express-rate-limit |
| Database | MongoDB Atlas |
| Auth | Supabase Auth |
| Movie data | [TMDB API](https://www.themoviedb.org/documentation/api) |
| Hosting | Render, plus a GitHub Actions keep-alive job |

---

## How It Works

FilmNotes runs as a single Express server. In production it serves the built React app and the `/api` routes from the same origin.

- **Movie data:** the `/api/movies/*` routes are thin public proxies to TMDB, so the TMDB API key never reaches the browser.
- **Auth:** the frontend signs users in with Supabase and sends the session's access token as `Authorization: Bearer <token>`. On the backend, `requireAuth` middleware checks that token with Supabase before running any review, watchlist, or recommendation route.
- **Per-user data:** reviews and watchlist items are stored in MongoDB and always queried by the signed-in user's id. Unique indexes on `{ userId, movieId }` let many users review or save the same movie.
- **Security:** Helmet sets a Content Security Policy that only allows Supabase and TMDB images. CORS is limited to an allowlist, and a global rate limiter covers every route except review saves.

### Recommendations

Logged-in users see a "Recommended for you" row above the trending movies on the home page. It comes from `GET /api/recommendations` (`backend/controllers/recommendationsController.js`):

1. Loads the user's 10 most recent reviews and 10 most recent watchlist items.
2. Looks up each movie's genres on TMDB and scores them. A reviewed movie adds its rating to each of its genres. A watchlisted movie that hasn't been reviewed adds a fixed weight of 5.
3. Queries TMDB's discover endpoint for the user's top two genres.
4. Leaves out movies the user has already reviewed or watchlisted, then returns the 12 highest-rated results.

The row is hidden for logged-out users, for users with no reviews or watchlist items yet, and when the TMDB lookups fail. Recommendations are computed on each request rather than stored, so they change as soon as you add a review or a watchlist item.

<!-- ---

## Running Locally

### Prerequisites

- Node.js 18+ and npm
- A MongoDB database (local or [Atlas](https://www.mongodb.com/atlas))
- A [TMDB API key](https://www.themoviedb.org/settings/api)
- A [Supabase](https://supabase.com/) project with email auth enabled

### Environment variables

Create **`backend/.env`**:

```env
MONGODB_URI=mongodb+srv://...
THEMOVIEDB_API_KEY=your_tmdb_key
THEMOVIEDB_BASE_URL=https://api.themoviedb.org/3
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000   # optional, this is the default
PORT=3000                                                     # optional, defaults to 3000
```

Create **`frontend/.env`**:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` belongs in the backend only. Never put it in `frontend/.env` or commit it.

### Install and run

```bash
# Terminal 1: backend (http://localhost:3000)
cd backend
npm install
npm run dev

# Terminal 2: frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` requests to the backend on port 3000.

### Available scripts

| Location | Command | Description |
| --- | --- | --- |
| `backend/` | `npm run dev` | Start the API with nodemon (auto-restart) |
| `backend/` | `npm start` | Start the API with node |
| `backend/` | `npm run lint` | Run ESLint |
| `frontend/` | `npm run dev` | Start the Vite dev server |
| `frontend/` | `npm run build` | Build the production bundle to `frontend/dist` |
| `frontend/` | `npm run preview` | Preview the production build |
| `frontend/` | `npm run lint` | Run ESLint |

---

## Deployment

The live app runs on [Render](https://render.com/) as a single web service:

- **Build command:** `cd frontend && npm install && npm run build && cd ../backend && npm install`
- **Start command:** `cd backend && npm start`
- **Environment:** set all the `backend/.env` variables above, plus the `VITE_SUPABASE_*` variables (Vite needs them at build time), `NODE_ENV=production`, and `ALLOWED_ORIGINS=https://filmnotes.onrender.com`.

Express serves `frontend/dist` as static files. Any GET request outside `/api` falls back to `index.html`, so client-side routes like `/watchlist` work when you refresh the page.

**Keep-alive:** free-tier MongoDB Atlas and Supabase projects pause when idle. `.github/workflows/keep-alive.yml` runs `scripts/keep-alive.mjs` every Monday and Thursday (or on demand) to ping both services. It needs these repository secrets: `MONGODB_URI`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY`.

---

## Reference

### Frontend pages

| Path | Description | Login required |
| --- | --- | --- |
| `/` | Trending movies, search, genre filter, and (when logged in) recommendations | No |
| `/about` | About FilmNotes | No |
| `/login` | Log in or create an account | No |
| `/watchlist` | Your saved movies | Yes |
| `/reviews` | Your reviews, with sorting and detail views | Yes |
| `/reviews/create/:id/:title` | Create or edit a review for a movie | Yes |

### Backend API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/movies/popular` | – | Popular movies from TMDB |
| GET | `/api/movies/search?searchquery=...` | – | Search movies by title |
| GET | `/api/movies/genres` | – | List of TMDB genres |
| GET | `/api/movies/genre/:genreId` | – | Movies in a genre |
| GET | `/api/movies/providers/:id` | – | Streaming, rent, and buy providers for a movie |
| GET | `/api/movies/:id` | – | Movie details |
| GET | `/api/watchlist` | 🔒 | Get your watchlist |
| POST | `/api/watchlist` | 🔒 | Add a movie to your watchlist |
| DELETE | `/api/watchlist/:movieId` | 🔒 | Remove a movie from your watchlist |
| GET | `/api/reviews?sort=date\|rating_high\|rating_low` | 🔒 | Get your reviews |
| POST | `/api/reviews` | 🔒 | Create or update a review |
| DELETE | `/api/reviews/:movieId` | 🔒 | Delete your review of a movie |
| GET | `/api/recommendations` | 🔒 | Personalized recommendations |

🔒 = requires `Authorization: Bearer <supabase_access_token>`

### Project structure

```
movie-reviewer/
├── backend/
│   ├── server.js              # Express app: security, CORS, rate limiting, routes, SPA fallback
│   ├── controllers/           # Review, watchlist, and recommendation logic
│   ├── middleware/            # requireAuth (Supabase token verification)
│   ├── model/                 # Mongoose schemas (reviews, watchlist)
│   └── routes/
│       ├── api/               # Authenticated routes: reviews, watchlist, recommendations
│       └── third-party-api/   # Public TMDB proxy routes
├── frontend/
│   └── src/
│       ├── pages/             # Home, About, Login, Watchlist, Reviews, Create Review
│       ├── components/        # NavBar, MovieCard, MovieRow, modals, ProtectedRoute
│       ├── context/           # AuthContext (Supabase session)
│       └── services/          # api.js (backend client), supabaseClient.js
├── scripts/keep-alive.mjs     # Pings MongoDB and Supabase so they don't pause
└── .github/workflows/         # Keep-alive cron job
```

---

## Troubleshooting

- **The site is slow to load the first time.** The Render free tier is waking up. Wait about a minute and refresh.
- **Movies don't load.** Check `THEMOVIEDB_API_KEY` and `THEMOVIEDB_BASE_URL` in `backend/.env`.
- **Login fails or protected pages send you back to `/login`.** Check that the frontend `VITE_SUPABASE_*` values and the backend `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` all point to the same Supabase project.
- **API calls fail with a CORS error.** Add your frontend's origin to `ALLOWED_ORIGINS`.
- **Reviews or watchlist items don't save.** Confirm `MONGODB_URI` is correct and the database is reachable. If you use Atlas, also check that your IP is allowed.
- **You get "Too many requests" errors.** You hit the global rate limit (400 requests per 15 minutes per IP). Wait and try again.

---

## Acknowledgements

Movie data and images come from [TMDB](https://www.themoviedb.org/).

<img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB logo" width="120" />

*This product uses the TMDB API but is not endorsed or certified by TMDB.* -->
