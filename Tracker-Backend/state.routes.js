const express = require("express");
const { StateModel } = require("./state.model");

const router = express.Router();

// Ensure weekly tasks / diet items always have an explicit days array
function normalizeDaysArray(items) {
  if (!Array.isArray(items)) return [];
  const allDays = [0, 1, 2, 3, 4, 5, 6];
  return items.map((item) => {
    // If the document already has a non-empty days array, keep it as-is
    if (Array.isArray(item.days) && item.days.length > 0) return item;
    // For older documents without days, default to every day of the week
    return { ...item, days: allDays };
  });
}

// GET /api/state - return current state
router.get("/state", async (req, res) => {
  try {
    let doc = await StateModel.findOne();
    if (!doc) {
      // Fresh install: create an empty state document
      doc = await StateModel.create({});
    }

    // Normalise legacy documents that don't have days stored on weekly tasks/diet
    const weeklyTasks = normalizeDaysArray(doc.weeklyTasks ?? []);
    const weeklyDiet = normalizeDaysArray(doc.weeklyDiet ?? []);

    // Persist the normalised shape back to Mongo once (best-effort)
    const needsMigration =
      (doc.weeklyTasks || []).some((t) => !Array.isArray(t.days) || t.days.length === 0) ||
      (doc.weeklyDiet || []).some((d) => !Array.isArray(d.days) || d.days.length === 0);
    if (needsMigration) {
      try {
        await StateModel.updateOne(
          { _id: doc._id },
          { $set: { weeklyTasks, weeklyDiet } }
        );
      } catch (err) {
        // Migration failure should not break the API response
        console.warn("State migration failed", err);
      }
    }

    res.json({
      weeklyTasks,
      specialTasks: doc.specialTasks ?? [],
      completions: doc.completions ?? [],
      weeklyDiet,
      specialDiet: doc.specialDiet ?? [],
      dietCompletions: doc.dietCompletions ?? [],
    });
  } catch (err) {
    console.error("GET /state error", err);
    res.status(500).send("Failed to fetch state");
  }
});

// PUT /api/state - replace current state (optimistic sync)
router.put("/state", async (req, res) => {
  try {
    const payload = req.body || {};
    await StateModel.findOneAndUpdate(
      {},
      {
        weeklyTasks: normalizeDaysArray(payload.weeklyTasks ?? []),
        specialTasks: payload.specialTasks ?? [],
        completions: payload.completions ?? [],
        weeklyDiet: normalizeDaysArray(payload.weeklyDiet ?? []),
        specialDiet: payload.specialDiet ?? [],
        dietCompletions: payload.dietCompletions ?? [],
      },
      { upsert: true, new: true }
    );
    res.status(204).send();
  } catch (err) {
    console.error("PUT /state error", err);
    res.status(500).send("Failed to save state");
  }
});

module.exports = router;
