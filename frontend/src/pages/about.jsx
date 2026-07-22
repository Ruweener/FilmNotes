import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

function About() {
    return (
        <>
            <NavBar />
            <main className="about-page min-h-screen bg-gray-900 text-slate-100">
                <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_28%)]" />
                    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
                        <div className="max-w-3xl space-y-5">
                            <p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                                About FilmNotes
                            </p>
                            <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                                A place to collect, review, and revisit the movies that matter to you.
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                                FilmNotes is a movie review app built to help you keep track of what you have watched, record your thoughts, and save films for later. It combines a fast review flow with a personal watchlist so your favorite titles and future picks stay in one place.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <article className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur">
                                <h2 className="text-lg font-bold text-white">Review your favorites</h2>
                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                    Write quick reactions or detailed thoughts after a movie and keep your opinions organized in one private review history.
                                </p>
                            </article>
                            <article className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur">
                                <h2 className="text-lg font-bold text-white">Build a watchlist</h2>
                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                    Save upcoming films while browsing so you always have a short list ready when you are looking for something new to watch.
                                </p>
                            </article>
                            <article className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur">
                                <h2 className="text-lg font-bold text-white">Stay organized</h2>
                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                    Use the app as a personal movie notebook, keeping ratings, notes, and saved titles together in a clean, focused interface.
                                </p>
                            </article>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
                            <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur sm:p-8">
                                <h2 className="text-2xl font-extrabold text-white">Why it exists</h2>
                                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                                    Movie lovers usually juggle notes, saved lists, and scattered ratings across different apps. FilmNotes brings those pieces together so you can move from discovery to opinion tracking without leaving the same experience.
                                </p>
                                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                                    The goal is simple: make it easy to remember what you watched, what you liked, and what you still want to see next.
                                </p>
                            </section>

                            <aside className="rounded-[2rem] border border-amber-400/20 bg-gradient-to-br from-amber-400/15 via-white/5 to-sky-500/10 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur sm:p-8">
                                <h2 className="text-2xl font-extrabold text-white">What you can do here</h2>
                                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
                                    <li className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">Browse movies and open details quickly.</li>
                                    <li className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">Create reviews and revisit them later.</li>
                                    <li className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">Keep a watchlist of titles you want to see.</li>
                                </ul>
                            </aside>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default About;