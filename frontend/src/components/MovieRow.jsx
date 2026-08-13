import { useRef } from "react";
import MovieCard from "./MovieCard";

function MovieRow({ title, movies, onInfoClick, isLoading = false, emptyMessage }) {
    const scrollRef = useRef(null);

    if (!isLoading && movies.length === 0 && !emptyMessage) {
        return null;
    }

    const scrollByAmount = (direction) => {
        const el = scrollRef.current;
        if (!el) {
            return;
        }
        el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.9), behavior: "smooth" });
    };

    return (
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>

            {isLoading ? (
                <p className="text-gray-400 text-sm">Loading recommendations…</p>
            ) : movies.length === 0 ? (
                <p className="text-gray-400 text-sm">{emptyMessage}</p>
            ) : (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => scrollByAmount(-1)}
                        className="row-arrow absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 text-2xl font-bold leading-none"
                        aria-label={`Scroll ${title} left`}
                    >
                        ‹
                    </button>

                    <div ref={scrollRef} className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide scroll-smooth">
                        {movies.map((movie) => (
                            <div key={movie.id} className="shrink-0">
                                <MovieCard movie={movie} onInfoClick={onInfoClick} />
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => scrollByAmount(1)}
                        className="row-arrow absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 text-2xl font-bold leading-none"
                        aria-label={`Scroll ${title} right`}
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
}

export default MovieRow;
