# University Research Opportunity Portal

FAST-NUCES Peshawar · BS (CS) 5A · Fall 2026 · Computer Networks · Assignment 01

Faculty can post research openings in one place instead of email, WhatsApp, and noticeboards. This repo will hold a small web app: a REST API, a MySQL database, and a simple frontend.

**GitHub repository:** https://github.com/m-musif/research-opportunity-portal

## Stack

- Backend: Node.js and Express
- Database: MySQL
- Frontend: HTML, CSS, and JavaScript, served by the same Express app

## Run the API

1. Install MySQL and create the tables:

```sql
source database/schema.sql
```

2. From the `backend` folder, copy `backend/.env.example` to `backend/.env` and set the database password there. Do not commit `.env`.

3. Install dependencies and start the server:

```bash
cd backend
npm install
npm start
```

The API and the faculty page both listen on `http://localhost:3000`. Open that address in a browser to use the portal.

## Endpoints

- `POST /api/opportunities` creates an opportunity (201)
- `GET /api/opportunities` lists opportunities (200). Optional filter: `?status=Open` or `?status=Closed`
- `GET /api/opportunities/:id` returns one opportunity (200, or 404)
- `PUT /api/opportunities/:id` updates the fields you send (200, or 404)
- `DELETE /api/opportunities/:id` deletes an opportunity (200, or 404)

Missing or invalid fields return 400. A database failure returns 500.

## Author

Muhammad Musif
