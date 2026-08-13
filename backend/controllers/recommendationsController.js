import MovieReview from "../model/movieReviewModel.js";
import Watchlist from "../model/watchlistModel.js";

const RECOMMENDATION_LIMIT = 12;
const HISTORY_LIMIT = 10;
const WATCHLIST_GENRE_WEIGHT = 5;

const tmdbUrl = (path, params = {}) => {
	const apiKey = process.env.THEMOVIEDB_API_KEY;
	const baseUrl = process.env.THEMOVIEDB_BASE_URL;
	const query = new URLSearchParams({ api_key: apiKey, language: "en-US", ...params });
	return `${baseUrl}${path}?${query.toString()}`;
};

const resolveGenreScores = async (reviews, watchlist) => {
	const weightByMovieId = new Map();
	for (const review of reviews) {
		weightByMovieId.set(review.movieId, review.rating);
	}
	for (const item of watchlist) {
		if (!weightByMovieId.has(item.movieId)) {
			weightByMovieId.set(item.movieId, WATCHLIST_GENRE_WEIGHT);
		}
	}

	const movieIds = [...weightByMovieId.keys()];
	const lookups = await Promise.allSettled(
		movieIds.map(async (movieId) => {
			const response = await fetch(tmdbUrl(`/movie/${movieId}`));
			if (!response.ok) {
				throw new Error(`TMDB movie lookup failed with status ${response.status}`);
			}
			return response.json();
		})
	);

	const genreScores = new Map();
	lookups.forEach((result, index) => {
		if (result.status !== "fulfilled") {
			return;
		}
		const weight = weightByMovieId.get(movieIds[index]);
		const genres = result.value.genres || [];
		for (const genre of genres) {
			genreScores.set(genre.id, (genreScores.get(genre.id) || 0) + weight);
		}
	});

	return genreScores;
};

const handleGetRecommendations = async (req, res) => {
	try {
		const [reviews, watchlist] = await Promise.all([
			MovieReview.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(HISTORY_LIMIT),
			Watchlist.find({ userId: req.user.id }).sort({ addedAt: -1 }).limit(HISTORY_LIMIT),
		]);

		if (reviews.length === 0 && watchlist.length === 0) {
			return res.json({ recommendations: [], reason: "no_history" });
		}

		const knownMovieIds = new Set([
			...reviews.map((review) => review.movieId),
			...watchlist.map((item) => item.movieId),
		]);

		const genreScores = await resolveGenreScores(reviews, watchlist);
		const topGenres = [...genreScores.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 2)
			.map(([genreId]) => genreId);

		if (topGenres.length === 0) {
			return res.json({ recommendations: [], reason: "no_history" });
		}

		const discoverResponse = await fetch(
			tmdbUrl("/discover/movie", { with_genres: topGenres.join(","), page: 1 })
		);

		if (!discoverResponse.ok) {
			const text = await discoverResponse.text();
			console.error("TMDB API error:", discoverResponse.status, text);
			return res.status(502).json({ error: "Failed to fetch recommendations" });
		}

		const discoverData = await discoverResponse.json();
		const recommendations = (discoverData.results || [])
			.filter((movie) => !knownMovieIds.has(movie.id))
			.sort((a, b) => b.vote_average - a.vote_average)
			.slice(0, RECOMMENDATION_LIMIT);

		res.json({ recommendations, reason: "ok" });
	} catch (error) {
		console.error("Error building recommendations:", error);
		res.status(502).json({ error: "Failed to fetch recommendations" });
	}
};

export { handleGetRecommendations };
