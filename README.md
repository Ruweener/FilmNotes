# FilmNotes

FilmNotes is a full-stack movie review web app built with React, Vite, Express, MongoDB, and the TMDB API. It lets users discover popular movies, search for titles, save movies to a personal watchlist, and create or update reviews with ratings and written notes.

[![FilmNotes Showcase](https://img.youtube.com/vi/Wam0NEXCfgE/0.jpg)](https://www.youtube.com/watch?v=Wam0NEXCfgE)

## Features

- Browse popular movies from TMDB
- Search for movies by title
- Add and remove movies from a persistent watchlist
- Create, edit, and delete movie reviews
- View review details alongside movie artwork and ratings

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express, Mongoose
- Data: MongoDB for watchlists and reviews
- External API: TMDB for movie metadata and posters

## Project Structure

- `frontend/` - React app and UI components
- `backend/` - Express API, controllers, models, and third-party movie routes

## Prerequisites

- Node.js and npm
- MongoDB database
- TMDB API key

## Environment Variables

Create a `backend/.env` file with:

- `MONGODB_URI` - MongoDB connection string
- `THEMOVIEDB_API_KEY` - TMDB API key
- `PORT` - Optional backend port, defaults to `3000`

## Setup

Install dependencies for both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Start the backend server:

```bash
cd backend
npm start
```

Start the frontend dev server in a second terminal:

```bash
cd frontend
npm run dev
```

## Available Scripts

### Backend

- `npm start` - Start the Express server
- `npm run dev` - Start the server with nodemon
- `npm run lint` - Run ESLint

### Frontend

- `npm run dev` - Start the Vite development server
- `npm run build` - Build the production frontend
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint

## Main Routes

### Frontend Pages

- `/` - Home page with popular movies and search
- `/watchlist` - Saved movies
- `/reviews` - Review list and detail views
- `/reviews/create/:id/:title` - Create or edit a review

### Backend API

- `GET /api/movies/popular` - Fetch popular movies from TMDB
- `GET /api/movies/search?searchquery=...` - Search TMDB movies
- `GET /api/movies/:id` - Fetch a single movie by ID
- `GET /api/watchlist` - Get saved watchlist items
- `POST /api/watchlist` - Add a movie to the watchlist
- `DELETE /api/watchlist/:movieId` - Remove a movie from the watchlist
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create or update a review
- `DELETE /api/reviews/:id` - Delete a review

## Notes

- The frontend expects the backend to be available at the same origin during development through the Vite setup used in the app.
- Movie posters are loaded from the TMDB image CDN.
- Watchlist entries are de-duplicated by `movieId`.

## Troubleshooting

- If movies do not load, verify the TMDB API key in `backend/.env`.
- If watchlist or review data is not saving, confirm the MongoDB URI is correct and the database is reachable.
- If the frontend cannot reach the API, make sure the backend is running before refreshing the browser.
