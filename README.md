# serpents-Carbon_foot_prints
🌿 Carbon Calculus – Personal Carbon Footprint Tracker

A smart, modern, and user-friendly platform to calculate, analyze, and reduce your carbon footprint.
Includes AI-powered eco-suggestions, history tracking, personalized goals, and detailed analytics.

✨ Features
🔢 Carbon Footprint Calculator

Calculates CO₂ emissions based on:

Transportation

Energy use

Food consumption

Waste

Purchases

🤖 AI-Generated Advice

Uses DistilGPT-2 (local model, no API keys required)

Generates 3 personalized eco-friendly tips

📊 Charts & Analytics

Pie chart breakdown (Chart.js)

Weekly / Monthly / Yearly scaling

PDF report export (jsPDF)

🗂️ History Tracking

Track previous calculations

Auto-saves up to 50 entries per user

Can clear history anytime

🎯 Goal Setting

Users can set a weekly CO₂ target

Backend stores goals in SQLite

🏆 Leaderboard

Ranks users by lowest average CO₂ emissions

🔐 Authentication

Signup / Login / Reset Password

Passwords securely hashed (SHA-256)

🏗️ Tech Stack
Frontend

HTML, CSS, JavaScript

Chart.js

jsPDF

Netlify Hosting

Backend

FastAPI

SQLite3

Transformers + DistilGPT-2

Uvicorn

Railway Hosting

📁 Folder Structure
serpents-Carbon_foot_prints/
│── frontend/
│   ├── home.html
│   ├── login.html
│   ├── signup.html
│   ├── calculate.html
│   ├── *.css
│   ├── *.js
│   └── assets/
│
│── backend/
│   ├── server.py
│   ├── requirements.txt
│   ├── users.db
│   └── README.md
│
└── README.md (this file)

🚀 Running Backend Locally
1️⃣ Install dependencies
pip install -r requirements.txt

2️⃣ Start the FastAPI server
uvicorn server:app --reload

3️⃣ Open API docs
http://127.0.0.1:8000/docs

🌎 Deployment
Frontend (Netlify)

Go to https://app.netlify.com

Click Deploy Site → Upload Folder

Upload your frontend/ folder

Netlify will generate a live URL

Backend (Railway)

Go to https://railway.app

New Project → Deploy from GitHub

Add start command:

uvicorn server:app --host 0.0.0.0 --port $PORT


Add environment variable:

SERVER_WORKER=1


Deploy → Get backend URL

Update Frontend

In login.js, signup.js, calculate.js, update:

const BACKEND = "https://your-railway-url.up.railway.app";

📡 API Endpoints
🔐 Auth

POST /signup

POST /login

POST /reset_password

📊 Footprint

POST /save_footprint

GET /get_history?email=

🎯 Goals

POST /set_goal

GET /get_goal?email=

🏆 Leaderboard

GET /leaderboard

🤖 AI Advice

POST /advice

