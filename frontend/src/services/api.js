import supabase from "./supabaseClient";

const getAccessToken = async () => {
    try {
        const { data } = await supabase.auth.getSession();
        return data?.session?.access_token ?? null;
    } catch (err) {
        console.error('Error getting supabase session:', err);
        return localStorage.getItem('access_token');
    }
}

const withAuth = async (options = {}) => {
    const token = await getAccessToken();
    if (!token) {
        return options;
    }

    return {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
        },
    };
}

const getPopularMovies = async () => {
    try {
        const response = await fetch('/api/movies/popular');
        const data =  await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching popular movies:', error);
    }
}

const searchMovies = async (query) => {
    try {
        const response = await fetch(`/api/movies/search?searchquery=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error searching movies:', error);
    }
}

const getMovieById = async (movieId) =>{
    try {
        const response = await fetch(`/api/movies/${movieId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie by ID:', error);
    }
}

const getWatchlist = async () => {
    try {
        const response = await fetch('/api/watchlist', await withAuth());
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching watchlist:', error);
    }
}

const addToWatchlist = async (movieId, title, poster_path) => {
    try {
        const response = await fetch('/api/watchlist', await withAuth({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ movieId, title, poster_path }),
        }));
        const data = await response.json();
        if (response.status === 409) {
            console.warn('Movie already in watchlist');
            return { success: true, alreadyExists: true };
        }
        if (!response.ok) {
            throw new Error(data.error || 'Failed to add to watchlist');
        }
        return { success: true, alreadyExists: false, data };
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        return { success: false, error: error.message };
    }
}

const removeFromWatchlist = async (movieId) => {
    try {
        const response = await fetch(`/api/watchlist/${movieId}`, await withAuth({
            method: 'DELETE',
        }));
        if (!response.ok) {
            throw new Error('Failed to remove from watchlist');
        }
        return { success: true };
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        return { success: false, error: error.message };
    }
}

const getAllReviews = async (sort = "date") => {
    try {
        const response = await fetch(`/api/reviews?sort=${encodeURIComponent(sort)}`, await withAuth({ cache: 'no-store' }));
        if (!response.ok) {
            throw new Error('Failed to fetch reviews');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
}

const createOrUpdateReview = async (movieId, title, header, rating, reviewText) => {
    try {
        const token = await getAccessToken();
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }

        console.log("[DEBUG] Sending token:", token.slice(0, 20) + "...");
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ movieId, title, header, rating, reviewText }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) {
                // clear stored token so UI can react
                localStorage.removeItem('access_token');
            }
            if (response.status === 429) {
                throw new Error('Too many requests. Please wait a moment and try again.');
            }
            throw new Error(errorData.error || `Failed to save review: ${response.statusText}`);
        }

        const data = await response.json();
        const isCreated = response.status === 201;
        return { success: true, data, isCreated };
    } catch (error) {
        console.error('Error creating/updating review:', error);
        return { success: false, error: error.message };
    }
}

const deleteReview = async (movieId) => {
    try {
        const response = await fetch(`/api/reviews/${movieId}`, await withAuth({
            method: 'DELETE',
        }));

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to delete review');
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting review:', error);
        return { success: false, error: error.message };
    }
}

const getGenres = async () => {
    try {
        const response = await fetch('/api/movies/genres');
        const data = await response.json();
        console.log('Genres API response:', data);
        return data.genres || [];
    } catch (error) {
        console.error('Error fetching genres:', error);
        return [];
    }
}

const getMoviesByGenre = async (genreId) => {
    try {
        const response = await fetch(`/api/movies/genre/${genreId}`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching movies by genre:', error);
        return [];
    }
}

const getMovieProviders = async (movieId, region = 'US') => {
    try {
        const response = await fetch(`/api/movies/providers/${movieId}?region=${encodeURIComponent(region)}`);
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to fetch providers');
        }
        const data = await response.json();
        const regionData = data.results && data.results[region] ? data.results[region] : null;
        return regionData;
    } catch (error) {
        console.error('Error fetching providers:', error);
        return null;
    }
}

export { getPopularMovies, searchMovies, getMovieById, getWatchlist, addToWatchlist, removeFromWatchlist, getAllReviews, createOrUpdateReview, deleteReview, getGenres, getMoviesByGenre, getMovieProviders };
