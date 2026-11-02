# Pothole Detection — Final Year Project

Built with **Expo SDK 54** (mobile), **Express + PostgreSQL** (API), and **Next.js** (authority admin dashboard).

## Features

- Mobile: pothole capture (camera + GPS), CV detection stub, prioritization, reports, maps
- API: JWT auth, report CRUD, Cloudinary image upload, admin triage endpoints
- Admin web: login, KPI dashboard, report list/detail, status and crew assignment

## Prerequisites

- Node.js 20+ and npm
- Docker (for local PostgreSQL) or a hosted Postgres URL
- Expo Go or emulator (mobile)
- Cloudinary account (for cloud image storage in production)

## Quick start

### 1. Env files

```bash
cp server/.env.example server/.env
cp admin-web/.env.example admin-web/.env.local
```

Local dev uses **SQLite** (`DATABASE_URL="file:./dev.db"`) — no Docker required.  
For production Postgres on Render, see `server/prisma/schema.postgres.prisma` and [DEPLOY.md](./DEPLOY.md).

### 2. API

```bash
cd server && npm install && npx prisma db push && npm run db:seed
cd .. && npm run api
```

Default admin: **admin@authority.local** / **AdminChangeMe1!** (or your `ADMIN_SEED_PASSWORD`).

### 3. Admin dashboard

```bash
cd admin-web && npm install
cd .. && npm run admin
```

Open http://localhost:3001

### 4. Mobile app

```bash
npm install
# .env: EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:3000
npm run start
```

When `EXPO_PUBLIC_API_BASE_URL` is empty, the app runs in **stub mode** (local auth/reports).

## Project structure

| Path | Description |
|------|-------------|
| `src/` | Expo mobile app |
| `server/` | Express API + Prisma |
| `admin-web/` | Next.js authority console |
| `docker-compose.yml` | Local PostgreSQL |
| `DEPLOY.md` | Render + Vercel deployment |

## API routes

| Route | Auth | Description |
|-------|------|-------------|
| `POST /auth/login` | — | Login |
| `POST /auth/register` | — | Citizen signup |
| `GET/POST /reports` | JWT | User reports |
| `POST /uploads/image` | JWT | Cloudinary upload |
| `GET /admin/stats` | Admin | KPIs |
| `GET/PATCH /admin/reports/:id` | Admin | Triage |

## Deployment

See [DEPLOY.md](./DEPLOY.md) for Render (API + Postgres) and Vercel (admin).

## Notes

- Folder name contains spaces — quote paths in terminals.
- Android emulator API URL: `http://10.0.2.2:3000`
