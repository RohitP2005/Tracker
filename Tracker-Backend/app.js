const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const stateRoutes = require("./state.routes");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI =
	process.env.MONGO_URI || "mongodb+srv://maverick:Ha33ezHHrCv3iT@cluster.yucb3sn.mongodb.net/";

app.use(cors());
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

