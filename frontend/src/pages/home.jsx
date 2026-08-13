import { useEffect, useRef, useState } from "react";
import { getPopularMovies, searchMovies, getMoviesByGenre, getMovieById, getMovieProviders, getRecommendations } from "../services/api";
import MovieCard from "../components/MovieCard";
import MovieRow from "../components/MovieRow";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import MovieInfoModal from "../components/MovieInfoModal";
import { useAuth } from "../context/AuthContext";

// Hardcoded popular genres with icons
const POPULAR_GENRES = [
  { id: 28, name: "Action", icon: "🤜" },
  { id: 35, name: "Comedy", icon: "😂" },
  { id: 18, name: "Drama", icon: "🎭" },
  { id: 53, name: "Thriller", icon: "😰" },
  { id: 12, name: "Adventure", icon: "🗺️" }
];

function App() {
  const { session, loading: authLoading } = useAuth();
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedProviders, setSelectedProviders] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isInfoLoading, setIsInfoLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const initialSearchLoadRef = useRef(true);
  const infoRequestRef = useRef(0);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (authLoading || !session) {
      setRecommendations([]);
      setRecsLoading(false);
      return;
    }

    let isActive = true;
    setRecsLoading(true);

    (async () => {
      const { recommendations: results } = await getRecommendations();
      if (isActive) {
        setRecommendations(results || []);
        setRecsLoading(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [session, authLoading]);

  useEffect(() => {
    if (initialSearchLoadRef.current) {
      initialSearchLoadRef.current = false;
      return;
    }

    const trimmedQuery = query.trim();
    let isActive = true;
    const searchTimeout = setTimeout(async () => {
      if (!isActive) {
        return;
      }

      if (trimmedQuery.length > 0) {
        const results = await searchMovies(trimmedQuery);
        if (isActive) {
          setMovies(results.results || []);
          setSelectedGenre("");
        }
      } else {
        const movies = await getPopularMovies();
        if (isActive) {
          setMovies(movies.results || []);
        }
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(searchTimeout);
    };
  }, [query]);

  const fetchMovies = async () => {
    const movies = await getPopularMovies();
    setMovies(movies.results || []);
  }

  const handleGenreChange = async (e) => {
    const genreId = e.target.value;
    setSelectedGenre(genreId);
    setQuery("");
    
    if (genreId) {
      const genreMovies = await getMoviesByGenre(genreId);
      setMovies(genreMovies);
    } else {
      fetchMovies();
    }
  }

  const handleOpenMovieInfo = async (movie) => {
    const requestId = infoRequestRef.current + 1;
    infoRequestRef.current = requestId;

    setIsInfoOpen(true);
    setIsInfoLoading(true);
    setSelectedMovie(movie);
    setSelectedProviders(null);

    try {
      const [movieDetails, providers] = await Promise.all([
        getMovieById(movie.id),
        getMovieProviders(movie.id),
      ]);

      if (infoRequestRef.current !== requestId) {
        return;
      }

      setSelectedMovie({ ...movie, ...movieDetails });
      setSelectedProviders(providers);
    } catch {
      if (infoRequestRef.current !== requestId) {
        return;
      }

      setSelectedMovie(movie);
      setSelectedProviders(null);
    } finally {
      if (infoRequestRef.current === requestId) {
        setIsInfoLoading(false);
      }
    }
  };

  const handleCloseMovieInfo = () => {
    infoRequestRef.current += 1;
    setIsInfoOpen(false);
    setSelectedMovie(null);
    setSelectedProviders(null);
    setIsInfoLoading(false);
  };

  return (
    <div className="w-full min-h-screen bg-gray-900">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {session && (recsLoading || recommendations.length > 0) && (
          <MovieRow
            title="Recommended for you"
            movies={recommendations}
            onInfoClick={handleOpenMovieInfo}
            isLoading={recsLoading}
          />
        )}

        <div className="mb-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search movies..."
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition"
              value={ query }
              onChange={ (e) => setQuery(e.target.value) }
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleGenreChange({ target: { value: '' } })}
              className={`genre-pill ${ selectedGenre === '' ? 'genre-pill--active' : 'genre-pill--inactive' }`}
            >
              Trending
            </button>
            {POPULAR_GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreChange({ target: { value: genre.id } })}
                className={`genre-pill ${ selectedGenre == genre.id ? 'genre-pill--active' : 'genre-pill--inactive' }`}
              >
                <span className="text-lg">{genre.icon}</span>
                <span>{genre.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {selectedGenre ? POPULAR_GENRES.find(g => g.id == selectedGenre)?.name : 'Trending'}
          </h2>
          <p className="text-gray-400 text-sm">Hover a poster to see details, add to watchlist or write a review.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
        { movies.length > 0
          ? movies.map((movie) => <MovieCard key={ movie.id } movie={ movie } onInfoClick={handleOpenMovieInfo} />)
          : null }
        </div>

        <MovieInfoModal
          isOpen={isInfoOpen}
          movie={selectedMovie || { title: '', release_date: '', poster_path: null, overview: '', genres: [] }}
          providers={selectedProviders}
          isLoading={isInfoLoading}
          onClose={handleCloseMovieInfo}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;
