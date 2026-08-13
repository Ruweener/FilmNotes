import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import mongoose from "mongoose";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Resolve __dirname correctly with ESM file URL handling
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from backend/.env explicitly so running from the repo root still works
const envPath = path.join(__dirname, ".env");
console.log(`[env] attempting to load ${envPath}`);
console.log(`[env] exists: ${fs.existsSync(envPath)}`);
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3000;

// Fail fast with a clear message when required env is missing
if (!process.env.MONGODB_URI) {
	console.error("MONGODB_URI is not set. Please set it in backend/.env or your host's environment variables.");
	process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI).catch((err) => {
	console.error("Failed to connect to MongoDB", err);
	process.exit(1);
});

// Security middlewares
app.use(helmet());

// Trust proxy so rate limiter works correctly behind proxies/load balancers
app.set("trust proxy", 1);

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 400, // allow normal browsing and repeated form submissions without blocking reviews
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many requests from this IP, please try again later." },
	handler: (req, res) => {
		res.status(429).json({ error: "Too many requests from this IP, please try again later." });
	},
});

app.use((req, res, next) => {
	if (req.originalUrl.startsWith("/api/reviews")) {
		return next();
	}
	return limiter(req, res, next);
});

// Configure CORS via environment variable for production safety
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000").split(",");
app.use(
	cors({
		origin: (origin, callback) => {
			// allow requests with no origin (like mobile apps, curl, server-to-server)
			if (!origin) return callback(null, true);
			if (allowedOrigins.includes(origin)) return callback(null, true);
			return callback(new Error("Not allowed by CORS"));
		},
	})
);

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("/", (req, res) => {
	res.send("Welcome to the Movie Reviewer API");
});

app.use(
	"/api/movies/popular",
	(await import("./routes/third-party-api/popularMovies.js")).default
);
app.use(
	"/api/movies/search",
	(await import("./routes/third-party-api/searchMovies.js")).default
);
app.use(
	"/api/movies/genres",
	(await import("./routes/third-party-api/getGenres.js")).default
);
app.use(
	"/api/movies/genre",
	(await import("./routes/third-party-api/getMoviesByGenre.js")).default
);
app.use(
	"/api/movies/providers",
	(await import("./routes/third-party-api/getMovieProviders.js")).default
);
app.use(
	"/api/movies",
	(await import("./routes/third-party-api/getMovieById.js")).default
);

app.use("/api/reviews", (await import("./routes/api/reviewMovies.js")).default);
app.use("/api/watchlist", (await import("./routes/api/watchlist.js")).default);
app.use("/api/recommendations", (await import("./routes/api/recommendations.js")).default);

// SPA fallback: serve index.html for non-API routes (client-side routing)
app.get(/.\//, (req, res) => {
	if (req.path.startsWith("/api/")) return res.status(404).send("Not Found");
	return res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const cleanupLegacyReviewIndexes = async () => {
	try {
		const collection = mongoose.connection.collection("moviereviewmodels");
		const indexes = await collection.indexes();
		const legacyMovieIdIndex = indexes.find((index) => index.name === "movieId_1" && index.unique);

		if (legacyMovieIdIndex) {
			await collection.dropIndex("movieId_1");
			console.log("Dropped legacy unique index: movieId_1");
		}
	} catch (error) {
		// Collection may not exist yet on a fresh DB; that's safe to ignore.
		if (error.codeName !== "NamespaceNotFound") {
			console.error("Failed cleaning review indexes:", error.message);
		}
	}
};

mongoose.connection.once("open", async () => {
	console.log("Connected to MongoDB");
	await cleanupLegacyReviewIndexes();
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
});
