const mongoose = require("mongoose");

const { Schema } = mongoose;

const stateSchema = new Schema(
	{
		weeklyTasks: { type: Array, default: [] },
		specialTasks: { type: Array, default: [] },
		completions: { type: Array, default: [] },
		weeklyDiet: { type: Array, default: [] },
		specialDiet: { type: Array, default: [] },
		dietCompletions: { type: Array, default: [] },
	},
	{ timestamps: true }
);

const StateModel = mongoose.models.State || mongoose.model("State", stateSchema);

module.exports = { StateModel };