# University Research Opportunity Portal

FAST-NUCES Peshawar · BS (CS) 5A · Fall 2026 · Computer Networks · Assignment 01

Faculty can post research openings in one place instead of email, WhatsApp, and noticeboards. This repo will hold a small web app: a REST API, a MySQL database, and a simple frontend.

**GitHub repository:** https://github.com/m-musif/research-opportunity-portal

## Stack

- Backend: Node.js and Express
- Database: MySQL
- Frontend: HTML, CSS, and JavaScript, served by the same Express app

## Run the API

1. Install MySQL and start it.

2. From the `backend` folder, copy `.env.example` to `.env` and set the database user and password there. Do not commit `.env`.

3. Install dependencies, create the database, and start the server:

```bash
cd backend
npm install
npm run setup-db
npm start
```

`npm run setup-db` runs `database/schema.sql` and creates the `research_portal` database. The API and the faculty page both listen on `http://localhost:3000`.

If MySQL is not running, list and save return **500** with `Database is unavailable`.

## Postman

Import `postman/Research-Opportunity-Portal.postman_collection.json`. With the server and MySQL running, use the requests in this order:

1. Create opportunity 1, 2, and 3 (201)
2. List opportunities (200)
3. Get one opportunity (200)
4. Update opportunity (200)
5. Close opportunity (200)
6. Delete opportunity (200)
7. Get deleted opportunity (404)
8. Create with missing fields (400)

## Endpoints

- `POST /api/opportunities` creates an opportunity (201)
- `GET /api/opportunities` lists opportunities (200). Optional filter: `?status=Open` or `?status=Closed`
- `GET /api/opportunities/:id` returns one opportunity (200, or 404)
- `PUT /api/opportunities/:id` updates the fields you send (200, or 404)
- `DELETE /api/opportunities/:id` deletes an opportunity (200, or 404)

Missing or invalid fields return 400. A database failure returns 500.

## Author

Muhammad Musif
