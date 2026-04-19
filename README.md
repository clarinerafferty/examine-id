# Examine.ID

`examine.id` is a mobile-first transparency web app for exploring Indonesian MP allowance data, category benchmarks, and public feedback through a React frontend with an Express/MySQL backend.

## Project status

- The application is intended to be demonstrated locally.
- A cloud deployment was attempted using Vercel, Render, and Railway.
- The remaining deployment issue is hosted database reliability on the free-tier stack, not the core local app flow.

## Data notice

The dataset in this repository is prototype/demo data for development and presentation purposes.

- It should not be treated as fully verified parliamentary data.
- Some benchmark figures are placeholders or proxy values.
- Any future public deployment should clearly label the dataset as prototype data unless it has been formally validated.

## Tech stack

- Frontend: React, Vite, React Router
- Backend: Express
- Database: MySQL
- Styling/UI: custom CSS, MUI icon/components where needed

## Repository structure

```text
client/   React frontend
server/   Express API and MySQL connection
docs/     supporting notes/documentation
```

## Local setup

### 1. Install dependencies

In the project root, install dependencies for both apps:

```powershell
cd server
npm.cmd install

cd ../client
npm.cmd install
```

### 2. Create environment files

Create local env files from the examples:

- `server/.env` from `server/.env.example`
- `client/.env` from `client/.env.example`

Suggested local backend env:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=examineid
DB_PORT=3306
DB_SSL=false
PORT=5000
CORS_ORIGIN=http://localhost:5173,http://192.168.1.100:5173
```

Suggested local frontend env:

```env
VITE_API_PROXY_TARGET=http://localhost:5000
VITE_API_BASE_URL=
```

### 3. Prepare MySQL

- Create a local MySQL database named `examineid`
- Import the project schema/data from the SQL file(s) included in the repository
- Use the local database credentials in `server/.env`

## Running the project locally

Start the backend in one terminal:

```powershell
cd server
npm.cmd start
```

Start the frontend in another terminal:

```powershell
cd client
npm.cmd run dev -- --host
```

Then open the Vite URL shown in the terminal.

If you want to test on your phone while on the same Wi-Fi, open:

```text
http://YOUR-LAPTOP-IP:5173
```

## What works locally

- dashboard overview
- MP list and detail pages
- category list and detail pages
- allowance and benchmark browsing
- feedback submission flow
