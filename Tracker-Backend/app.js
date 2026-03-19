require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const stateRoutes = require("./state.routes");

const app = express();
const PORT = process.env.PORT || 3000;
// Support both MONGO_URI and MONGODB_URI env var names
const MONGO_URI = process.env.MONGODB_URI;

// CORS: only allow requests from configured frontend origins
const allowedOriginsEnv = process.env.CORS_ORIGINS || "";
const allowedOrigins = allowedOriginsEnv
	? allowedOriginsEnv.split(",").map((o) => o.trim()).filter(Boolean)
	: ["*"];

// CORS configuration: allow all origins in development,
// restrict to CORS_ORIGINS in production.
app.use(
	cors({
		origin(origin, callback) {
			// Allow same-origin or tools (no origin header)
			if (!origin) return callback(null, true);

			// In non-production, allow any origin (useful for local dev)
			if (process.env.NODE_ENV !== "production") {
				return callback(null, true);
			}

			// In production, respect configured origins. Support '*' as wildcard.
			if (
				allowedOrigins.includes("*") ||
				allowedOrigins.includes(origin)
			) {
				return callback(null, true);
			}

			return callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
	})
);
app.use(express.json());

app.use("/api", stateRoutes);

// Start server only when not running tests
if (process.env.NODE_ENV !== "test") {
	mongoose
		.connect(MONGO_URI)
		.then(() => {
			console.log("MongoDB connected");
			app.listen(PORT, () => {
				console.log(`API listening on http://localhost:${PORT}`);
			});
		})
		.catch((err) => {
			console.error("Mongo connection error", err);
			process.exit(1);
		});
}

module.exports = app;

