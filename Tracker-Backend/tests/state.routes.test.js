const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const { StateModel } = require("../state.model");

const TEST_DB =
  process.env.MONGO_URI ;

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
  await StateModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe("GET /api/state", () => {
  it("creates a default state document and returns empty arrays", async () => {
    const res = await request(app).get("/api/state");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      weeklyTasks: [],
      specialTasks: [],
      completions: [],
      weeklyDiet: [],
      specialDiet: [],
      dietCompletions: [],
    });

    const docs = await StateModel.find({});
    expect(docs.length).toBe(1);
  });
});

describe("PUT /api/state", () => {
  it("replaces current state and returns 204", async () => {
    const payload = {
      weeklyTasks: [
        { id: "1", name: "Task A", duration: 30, period: "morning", days: [1, 2, 3, 4, 5] },
      ],
      specialTasks: [],
      completions: [
        { taskId: "1", date: "2026-03-18", completed: true },
      ],
      weeklyDiet: [
        {
          id: "d1",
          name: "Oats",
          calories: 150,
          protein: 5,
          period: "morning",
          days: [0, 1, 2, 3, 4, 5, 6],
        },
      ],
      specialDiet: [],
      dietCompletions: [
        { itemId: "d1", date: "2026-03-18", completed: true },
      ],
    };

    const res = await request(app).put("/api/state").send(payload);
    expect(res.status).toBe(204);

    const doc = await StateModel.findOne({});
    expect(doc).not.toBeNull();
    expect(doc.weeklyTasks.length).toBe(1);
    expect(doc.completions.length).toBe(1);
    expect(doc.weeklyDiet.length).toBe(1);
    expect(doc.dietCompletions.length).toBe(1);
  });
});

describe("Error handling", () => {
  it("returns 500 on DB error for GET", async () => {
    const originalFindOne = StateModel.findOne;
    StateModel.findOne = jest.fn().mockRejectedValue(new Error("DB fail"));

    const res = await request(app).get("/api/state");
    expect(res.status).toBe(500);

    StateModel.findOne = originalFindOne;
  });
});
