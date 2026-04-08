# Examine.ID

React + Vite frontend with an Express/MySQL backend for browsing Indonesian MP allowance data, benchmarks, and feedback.

## Before GitHub

Do not commit real secrets or local-only files. This repo should include:

- source code
- `client/.env.example`
- `server/.env.example`
- documentation

This repo should not include:

- `server/.env`
- `client/.env`
- any `node_modules` folder
- build output such as `dist`

## Local development

1. Create `server/.env` from `server/.env.example`.
2. Create `client/.env` from `client/.env.example`.
3. Fill in your local MySQL details in `server/.env`.

Backend env in `server/.env`:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=examineid
DB_PORT=3306
PORT=5000
CORS_ORIGIN=http://localhost:5173,http://YOUR-LAPTOP-IP:5173
```

Frontend env in `client/.env`:

```env
VITE_API_PROXY_TARGET=http://localhost:5000
VITE_API_BASE_URL=
```

Run the app:

```powershell
cd server
npm run dev
```

```powershell
cd client
npm run dev -- --host
```

Open `http://YOUR-LAPTOP-IP:5173` on your phone while both devices are on the same Wi-Fi.

## Public deployment

For a real internet deployment, keep MySQL and host the three parts separately:

1. Frontend: host the built `client` app.
2. Backend: host the `server` Express app.
3. Database: host a MySQL instance and copy your schema/data into it.

Typical production env values:

Frontend:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

Backend:

```env
DB_HOST=your-mysql-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_PORT=3306
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com
```

In development, the frontend uses the Vite proxy. In production, the frontend calls the hosted backend directly.

## Recommended GitHub Structure

- push the full repo root
- keep `client` and `server` as subfolders
- include this root `README.md`
- keep secrets only in local `.env` files or hosting provider environment settings
