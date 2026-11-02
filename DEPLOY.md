# Deployment guide

## Stack

| Component | Hosting |
|-----------|---------|
| Express API | [Render](https://render.com) |
| PostgreSQL | Render managed database |
| Admin dashboard | [Vercel](https://vercel.com) |
| Images | [Cloudinary](https://cloudinary.com) |

## Local development

1. Start Postgres:

   ```bash
   npm run db:up
   ```

2. Copy env files:

   ```bash
   cp server/.env.example server/.env
   cp admin-web/.env.example admin-web/.env.local
   ```

3. Set `server/.env`:

   - `DATABASE_URL=postgresql://pothole:pothole@localhost:5432/pothole?schema=public`
   - `JWT_SECRET` (16+ chars)
   - Cloudinary keys (optional for upload; required for cloud images)
   - `ADMIN_SEED_PASSWORD`

4. Migrate and seed:

   ```bash
   cd server && npm install && npm run db:migrate && npm run db:seed
   ```

5. Run API and admin:

   ```bash
   npm run api          # http://localhost:3000
   npm run admin        # http://localhost:3001
   ```

6. Mobile: set `EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:3000` in `.env`, restart Expo.

**Default admin:** `admin@authority.local` / value of `ADMIN_SEED_PASSWORD` (default `AdminChangeMe1!`).

## Render (API)

1. Connect repo; use `render.yaml` or create a Web Service with root `server/`.
2. Add PostgreSQL; link `DATABASE_URL`.
3. Set env: `JWT_SECRET`, `CORS_ORIGIN` (your Vercel URL), Cloudinary vars, `ADMIN_SEED_PASSWORD`.
4. Build: `npm install && npm run build && npx prisma migrate deploy`
5. Start: `npm start`
6. Run seed once in Render shell: `npm run db:seed`

## Vercel (admin)

1. Import repo; set **Root Directory** to `admin-web`.
2. Env: `NEXT_PUBLIC_API_URL=https://your-api.onrender.com`
3. Deploy.

## CORS

Set `CORS_ORIGIN` on Render to your Vercel URL, e.g.:

```
https://pothole-admin.vercel.app,http://localhost:3001
```
