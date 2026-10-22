# DevInsights Deployment & Setup Guide

## 1. Local Development Setup

### Prerequisites
- Python 3.12+
- Node.js 20+ and npm
- Git

### Backend Setup
```bash
cd backend
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to explore the dashboard.

---

## 2. Docker Compose Deployment (Single Command)

```bash
# Clone and enter workspace
git clone <repository_url>
cd DevInsights

# Optional: Add GitHub token to .env to raise rate limits
cp .env.example .env

# Build and start services
docker-compose up --build -d
```

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000`
- **API Swagger Documentation:** `http://localhost:8000/docs`

---

## 3. Production Cloud Hosting

### Frontend (Vercel / Netlify)
1. Push repository to GitHub.
2. Link the `frontend/` directory in Vercel or Netlify.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variable: `VITE_API_BASE=https://your-backend-url.com/api`

### Backend (Render, Railway, Fly.io, AWS)
1. Root directory: `backend/`
2. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Environment variables:
   - `GITHUB_TOKEN`: Your GitHub personal access token (recommended for production 5,000 req/hr limits)
   - `DATABASE_URL`: Managed PostgreSQL connection string (or persistent SQLite disk)
   - `ENVIRONMENT`: `production`

---

## 4. Troubleshooting & GitHub Rate Limits

- **Unauthenticated limit:** GitHub allows 60 requests/hour per IP address.
- **Authenticated limit:** Providing a classic personal access token (`GITHUB_TOKEN`) increases quota to 5,000 requests/hour.
- **In-Memory Caching:** All GitHub responses are cached for 15 minutes by default to maximize rate-limit efficiency.
