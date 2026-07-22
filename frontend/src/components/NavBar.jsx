import { NavLink, useNavigate } from "react-router-dom";
import supabase from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

function BrandIcon() {
    return (
        <img src="/logo.png" alt="FilmNotes logo" className="nav-icon nav-logo" />
    );
}

function ReviewsIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon">
            <path d="M7 4h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H11l-4.5 3.5V18H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm1.5 4.5a1 1 0 0 0 0 2h7a1 1 0 1 0 0-2h-7Zm0 4a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2h-4Z" />
        </svg>
    );
}

function WatchlistIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon">
            <path d="M7 4a2 2 0 0 0-2 2v12l7-4 7 4V6a2 2 0 0 0-2-2H7Zm1.5 4.5a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2h-5a1 1 0 0 1-1-1Z" />
        </svg>
    );
}

function AuthIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon">
            <path d="M10 6a1 1 0 0 1 1-1h6a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-6a1 1 0 1 1 0-2h6a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-6a1 1 0 0 1-1-1Zm-1.7 4.3a1 1 0 0 1 1.4 0l2.3 2.3a1 1 0 0 1 0 1.4l-2.3 2.3a1 1 0 0 1-1.4-1.4L9.9 14H4a1 1 0 1 1 0-2h5.9l-1.6-1.6a1 1 0 0 1 0-1.4Z" />
        </svg>
    );
}

function AboutIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon">
            <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm0 4.3a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 12 6.3Zm1.6 11.2h-3.2a1 1 0 1 1 0-2h1v-4h-.7a1 1 0 1 1 0-2H12a1 1 0 0 1 1 1v5h.6a1 1 0 1 1 0 2Z" />
        </svg>
    );
}

function NavItem({ to, children, icon }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                [
                    "nav-link",
                    isActive ? "nav-link-active" : "nav-link-inactive",
                ].join(" ")
            }
        >
            {icon}
            <span>{children}</span>
        </NavLink>
    );
}

function NavBar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    return (
        <header className="nav-shell w-full">
            <div className="nav-shell__inner">
                <NavLink to="/" className="nav-brand">
                    <span className="nav-brand__mark">
                        <BrandIcon />
                    </span>
                    <span className="nav-brand__copy">
                        <span className="nav-brand__title">FilmNotes</span>
                        <span className="nav-brand__subtitle">Movies, reviews, watchlist</span>
                    </span>
                </NavLink>

                <nav className="nav-links" aria-label="Primary navigation">
                    <NavItem to="/about" icon={<AboutIcon />}>About</NavItem>
                    <NavItem to="/reviews" icon={<ReviewsIcon />}>Reviews</NavItem>
                    <NavItem to="/watchlist" icon={<WatchlistIcon />}>Watchlist</NavItem>
                </nav>

                <div className="nav-actions">
                    {user ? (
                        <button type="button" onClick={handleSignOut} className="nav-action nav-action--ghost">
                            <AuthIcon />
                            <span>Sign out</span>
                        </button>
                    ) : (
                        <NavLink to="/login" className="nav-action nav-action--solid">
                            <AuthIcon />
                            <span>Sign in</span>
                        </NavLink>
                    )}
                </div>
            </div>
        </header>
    );
}

export default NavBar;