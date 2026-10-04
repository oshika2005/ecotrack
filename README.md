# 🌍 EcoTrack – AI-Powered Carbon Footprint Tracker

EcoTrack is a modern web application designed to help users track, reduce, and offset their carbon footprint. It features an AI-powered carbon calculator, gamified challenges, a community hub, a marketplace for carbon credits, and an interactive 3D globe visualization.

---

## 🚀 How to Run the Project

You can run this project in two ways: **Local Development Mode** (great for editing code) or **Docker Mode** (great for testing the production build).

### Option 1: Local Development Mode (Node.js & Python)

**Prerequisites:**
* Python 3.10+
* Node.js 18+

#### 1. Start the Backend API
Open a terminal in the `ecotrack` root directory and run:

```bash
# Navigate to backend folder
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```
*The backend API will run at `http://localhost:8000`. You can view the interactive API documentation at `http://localhost:8000/docs`.*

#### 2. Start the Frontend App
Open a **new** terminal window in the `ecotrack` root directory and run:

```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend will run at `http://localhost:5173`. Open this URL in your browser to use the app.*

---

### Option 2: Docker Mode (Production Simulation)

If you have **Docker** and **Docker Compose** installed, you can spin up the entire application with a single command. This builds the React app into static files and serves them alongside the API.

#### 1. Start Docker Compose
Open a terminal in the `ecotrack` root directory and run:

```bash
docker compose up -d --build
```

#### 2. Access the Application
* **App:** Open your browser to `http://localhost` (or `http://127.0.0.1`).
* **API Docs:** Access the backend docs at `http://localhost/docs`.

#### 3. Stop the Application
To stop the servers and clean up the containers, run:
```bash
docker compose down
```

---

## 🛠 Tech Stack

* **Backend:** Python, FastAPI, SQLAlchemy, SQLite (Development) / PostgreSQL-ready (Production), Bcrypt, PyJWT.
* **Frontend:** React.js, Vite, Tailwind CSS v4, React Router, Chart.js.
* **3D Visualization:** Three.js, React Three Fiber.
* **Deployment Setup:** Docker, Docker Compose, Nginx, GitHub Actions.
