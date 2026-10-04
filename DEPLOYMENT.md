# EcoTrack Deployment Guide

This guide explains how to deploy EcoTrack to production.

## Option 1: Docker Compose (VPS / Self-Hosted) - Recommended

The easiest way to deploy the entire stack is using `docker-compose`. This ensures the backend API and frontend Nginx server run seamlessly together.

### Prerequisites
- A Linux VPS (AWS EC2, DigitalOcean Droplet, Linode, etc.)
- Docker and Docker Compose installed

### Steps

1. Clone your repository to your server:
   ```bash
   git clone https://github.com/yourusername/ecotrack.git
   cd ecotrack
   ```

2. Update `docker-compose.yml` environment variables:
   - Change `SECRET_KEY` to a strong random string.
   - Update `CORS_ORIGINS` to include your production domain (e.g., `https://ecotrack.yourdomain.com`).

3. Start the application:
   ```bash
   docker-compose up -d --build
   ```

4. The application is now running. Nginx is listening on port 80. You should set up a reverse proxy (like another Nginx instance or Caddy) or an API Gateway in front of it to handle SSL/TLS (HTTPS).

---

## Option 2: Split Deployment (Vercel + Render/Railway)

For serverless edge deployments, you can split the frontend and backend.

### Part A: Backend Deployment (Render / Railway / Heroku)

1. Connect your GitHub repository to your platform of choice.
2. Set the build command to standard Python pip install:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Set the start command:
   ```bash
   cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. Set Environment Variables:
   - `DATABASE_URL`: If using Render/Railway, attach a PostgreSQL database and provide the URL here (e.g., `postgresql://user:pass@host/db`).
   - `SECRET_KEY`: Your secure JWT secret.
   - `CORS_ORIGINS`: Provide your Vercel frontend URL once deployed.

### Part B: Frontend Deployment (Vercel)

1. Connect your GitHub repo to Vercel.
2. Select the `frontend` folder as your Root Directory.
3. Vercel will automatically detect Vite. 
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Important**: Because we separated the backend, you must configure API routing. Open `frontend/vite.config.js` and remove the proxy.
5. Create a `frontend/vercel.json` file to route `/api/*` requests to your hosted backend URL:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-backend-url.onrender.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
6. Deploy!

---

## Database Migration Note

By default, the local app uses SQLite. For a true production environment, update your `.env` or Server Environment Variables to point to a managed PostgreSQL instance:

`DATABASE_URL=postgresql://user:password@host:5432/ecotrack`

FastAPI's `lifespan` event (in `app.main:app`) is configured to run `Base.metadata.create_all(bind=engine)` and `seed_challenges()` automatically on startup, so your schema and default gamification challenges will migrate automatically.
