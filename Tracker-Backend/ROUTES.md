# API Routes Documentation

Base URL: `/api`

## GET /api/state

- **Description**: Fetch the current persisted state of tasks and diet.
- **Method**: `GET`
- **Request Body**: None
- **Query Params**: None
- **Response Status**: `200 OK` on success, `500 Internal Server Error` on failure.
- **Response Body** (`application/json`):

	```json
	{
		"weeklyTasks": [
			{
				"id": "string",
				"name": "string",
				"duration": 30,
				"period": "string",
				"specificTime": "string (optional)",
				"days": [0, 1, 2, 3, 4, 5, 6]
			}
		],
		"specialTasks": [
			{
				"id": "string",
				"name": "string",
				"duration": 30,
				"period": "string",
				"specificTime": "string (optional)",
				"isSpecial": true,
				"specialDate": "YYYY-MM-DD"
			}
		],
		"completions": [
			{
				"taskId": "string",
				"date": "YYYY-MM-DD",
				"completed": true
			}
		],
		"weeklyDiet": [
			{
				"id": "string",
				"name": "string",
				"calories": 150,
				"protein": 5,
				"period": "string",
				"specificTime": "string (optional)",
				"days": [0, 1, 2, 3, 4, 5, 6]
			}
		],
		"specialDiet": [
			{
				"id": "string",
				"name": "string",
				"calories": 300,
				"protein": 20,
				"period": "string",
				"specificTime": "string (optional)"
			}
		],
		"dietCompletions": [
			{
				"itemId": "string",
				"date": "YYYY-MM-DD",
				"completed": true
			}
		]
	}
	```

- **Notes**:
	- If no state document exists, the server will create one with all arrays empty and return it.
	- For legacy documents where `days` was not stored on `weeklyTasks` or `weeklyDiet`, the API will default `days` to all days of the week (`[0,1,2,3,4,5,6]`) and persist that shape.

## PUT /api/state

- **Description**: Replace the entire current state document (optimistic sync from frontend).
- **Method**: `PUT`
- **Request Body** (`application/json`):

	- `weeklyTasks` (array, optional)
	- `specialTasks` (array, optional)
	- `completions` (array, optional)
	- `weeklyDiet` (array, optional)
	- `specialDiet` (array, optional)
	- `dietCompletions` (array, optional)

	Any omitted field will be treated as an empty array.

- **Example Request Body**:

	```json
	{
		"weeklyTasks": [
			{ "id": "1", "name": "Task A", "duration": 30, "period": "morning", "days": [1, 2, 3, 4, 5] }
		],
		"specialTasks": [],
		"completions": [
			{ "taskId": "1", "date": "2026-03-18", "completed": true }
		],
		"weeklyDiet": [
			{ "id": "d1", "name": "Oats", "calories": 150, "protein": 5, "period": "morning", "days": [0, 1, 2, 3, 4, 5, 6] }
		],
		"specialDiet": [],
		"dietCompletions": [
			{ "itemId": "d1", "date": "2026-03-18", "completed": true }
		]
	}
	```

- **Response Status**: `204 No Content` on success, `500 Internal Server Error` on failure.
- **Response Body**: None on success.

- **Notes**:
	- The server uses `findOneAndUpdate` with `upsert: true`, so the document is created if it does not exist.
	- This endpoint is designed for optimistic syncing: the frontend can send the full state snapshot and the backend will replace the stored one.
	- If any `weeklyTasks` or `weeklyDiet` items are missing a `days` array, the server will default them to all days of the week.
+