# Anaska — Backend Deployment Guide (Railway / Render)

## 1. Railway Deployment

1. **Create New Project**:
   - Go to [Railway.app](https://railway.app/) and click **New Project** -> **Deploy from GitHub repo**.
   - Select the `Anaska-music` repository and root directory as `/backend`.
2. **Add PostgreSQL Database**:
   - Click **+ New** -> **Database** -> **Add PostgreSQL**.
   - (Optional) Enable `pgvector` in the PostgreSQL plugin via `CREATE EXTENSION vector;`.
3. **Configure Environment Variables**:
   ```env
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_ACCESS_SECRET=your_production_access_secret_key
   JWT_REFRESH_SECRET=your_production_refresh_secret_key
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   CORS_ORIGIN=*
   ```
4. **Deploy**:
   - Railway will detect the `Dockerfile` or run `npm run build && npm start`.
   - Your API will be live at `https://<your-railway-domain>.up.railway.app`.

---

## 2. Render Deployment

1. **Create Web Service**:
   - Link repository on [Render](https://render.com/).
   - Set **Root Directory** to `backend`.
   - Set **Build Command** to `npm install && npm run build`.
   - Set **Start Command** to `npm start`.
2. **Environment Variables**:
   - Add `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, etc.
3. **PostgreSQL**:
   - Create a Render PostgreSQL database and link internal `DATABASE_URL`.
