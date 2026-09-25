# FilmNotes

FilmNotes is a full-stack movie review web app built with React, Vite, Express, MongoDB, and the TMDB API. It lets users discover popular movies, search for titles, save movies to a personal watchlist, create or update reviews with ratings and written notes, and get personalized movie recommendations based on their activity.

### Click [Here](https://www.youtube.com/watch?v=Wam0NEXCfgE) to check out the Showcase!

## Features

- Browse popular movies from TMDB
- Search for movies by title
- Add and remove movies from a persistent watchlist
- Create, edit, and delete movie reviews
- View review details alongside movie artwork and ratings
- Get a personalized "Recommended for you" row on the home page, based on your reviews and watchlist

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

- `/` - Home page with popular movies, search, and (when logged in) a "Recommended for you" row
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
- `GET /api/recommendations` - Get personalized movie recommendations for the logged-in user

## Recommendations

Logged-in users see a "Recommended for you" row above the trending movies on the home page. It is built by `GET /api/recommendations` (`backend/controllers/recommendationsController.js`):

1. Loads the user's 10 most recent reviews and 10 most recent watchlist items.
2. Looks up each movie's genres on TMDB and scores them. Reviewed movies count by their rating, and watchlisted movies (not yet reviewed) count with a fixed weight of 5.
3. Queries TMDB's discover endpoint for the user's top two genres.
4. Leaves out movies the user has already reviewed or watchlisted, then returns the 12 highest-rated results.

The row is hidden for logged-out users, for users with no reviews or watchlist yet, and when the TMDB lookups fail.

## Notes

- The frontend expects the backend to be available at the same origin during development through the Vite setup used in the app.
- Movie posters are loaded from the TMDB image CDN.
- Watchlist entries are de-duplicated by `movieId`.
- Recommendations are computed on each request rather than stored, so they update as soon as you add reviews or watchlist items.

## Troubleshooting

- If movies do not load, verify the TMDB API key in `backend/.env`.
- If watchlist or review data is not saving, confirm the MongoDB URI is correct and the database is reachable.
- If the frontend cannot reach the API, make sure the backend is running before refreshing the browser.
