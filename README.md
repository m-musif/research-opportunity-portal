# University Research Opportunity Portal

FAST-NUCES Peshawar · BS (CS) 5A · Fall 2026 · Computer Networks · Assignment 01

Faculty post research openings in one place. The app stores them in MySQL and lets a faculty member create, view, update, close, and delete an opening from the browser. The page talks only to the REST API. Nothing on the page is hard-coded.

**GitHub repository:** https://github.com/m-musif/research-opportunity-portal

**Student:** Muhammad Musif · P24-0680

## What you can do

- See every opening, and filter by Open or Closed
- Search by title, research area, faculty name, or department
- Open one row to read the full record
- Create an opening, or edit the one you selected
- Change status from Open to Closed, or back to Open
- Delete an opening
- See a success or error message on the page
- Required fields are checked before the request is sent

## Stack

| Part | Technology |
| --- | --- |
| API | Node.js and Express |
| Database | MySQL |
| Page | HTML, CSS, and JavaScript, served by the same Express app |

## Project layout

```
research-opportunity-portal/
├── backend/        Express API, database setup script
├── frontend/       Faculty page
├── database/       schema.sql
├── postman/        Exported Postman collection
└── README.md
```

## Run it

1. Install MySQL and start the server.

2. In `backend`, copy the example environment file and set your own user and password. Do not commit `.env`.

```bash
cd backend
copy .env.example .env
```

3. Install packages, create the database, and start the API:

```bash
npm install
npm run setup-db
npm start
```

`npm run setup-db` runs `database/schema.sql` and creates the `research_portal` database and the `opportunities` table.

Open http://localhost:3000 for the faculty page. The API is on the same address.

If MySQL is stopped, the list and the save button return **500** with `Database is unavailable`.

## API

| Method | Path | Success | Failure |
| --- | --- | --- | --- |
| POST | `/api/opportunities` | 201 Created | 400 if a field is missing or invalid |
| GET | `/api/opportunities` | 200 and an array | 400 if `?status=` is not Open or Closed |
| GET | `/api/opportunities/:id` | 200 and one record | 404 if that id is gone, 400 if the id is not a number |
| PUT | `/api/opportunities/:id` | 200 and the updated record | 404 if the id does not exist, 400 if a sent field is invalid |
| DELETE | `/api/opportunities/:id` | 200 | 404 if the id does not exist |

`PUT` only changes the fields you send. Sending `{ "status": "Closed" }` is enough to close an opening.

A date such as `2026-02-31` is rejected with **400**. A database failure returns **500**.

Create body:

```json
{
  "title": "Urdu handwriting recognition",
  "description": "Collect and label Urdu handwriting samples.",
  "researchArea": "Computer vision",
  "facultyName": "Dr. Ayesha Khan",
  "department": "Computer Science",
  "requiredSkills": "Python, OpenCV",
  "availablePositions": 2,
  "applicationDeadline": "2026-12-15",
  "status": "Open"
}
```

## Postman

Import `postman/Research-Opportunity-Portal.postman_collection.json`. Start MySQL and the API first, then run the folder from top to bottom. Each request checks its status code.

1. Create opportunity 1, 2, and 3 — **201**. The first request saves the new id.
2. List opportunities — **200**
3. Get one opportunity — **200**
4. Update opportunity — **200**
5. Close opportunity — **200**
6. Delete opportunity — **200**
7. Get deleted opportunity — **404**
8. Create with missing fields — **400**

## One-minute video

Keep the recording under one minute. This order fits:

1. Terminal with `npm start` and the line that says the API is listening.
2. The faculty page. Create one opening and show the success message.
3. Click that row and show the full details.
4. Edit the title or the number of seats and save.
5. Mark it closed and show the Closed badge.
6. Delete it.
7. In Postman, send the empty create request and show **400**, or request the deleted id and show **404**.

## Author

Muhammad Musif
