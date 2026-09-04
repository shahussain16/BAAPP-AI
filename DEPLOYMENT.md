# 🚀 BAAPP-AI 100% Free Deployment Guide

Deploying **BAAPP-AI** online allows you to share your project URL with recruiters, friends, or portfolio viewers for 100% free!

---

## 🏗️ Architecture Overview

| Component | Technology | Free Hosting Platform |
| :--- | :--- | :--- |
| **Backend API** | Python FastAPI + Pandas | **Render.com** (Free Web Service) |
| **Frontend Web App** | React + Vite + Recharts | **Vercel** or **Render** (Free Static Site) |

---

## 📌 Step 1: Push Project to GitHub

1. Open your terminal in `c:\poetrycam\BAAPP-AI`.
2. Initialize Git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial BAAPP-AI release"
   ```
3. Create a new repository on [GitHub.com](https://github.com/new) called `BAAPP-AI`.
4. Link and push your repo:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/BAAPP-AI.git
   git branch -M main
   git push -u origin main
   ```

---

## ⚙️ Step 2: Deploy Backend to Render.com (100% Free)

1. Sign up / log in to [Render.com](https://render.com) (Log in with GitHub).
2. Click **New +** ➡️ **Web Service**.
3. Connect your `BAAPP-AI` GitHub repository.
4. Configure these settings:
   - **Name**: `baapp-ai-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Click **Create Web Service**.
6. Render will build your backend and give you a live URL like:
   `https://baapp-ai-backend.onrender.com`

---

## 🌐 Step 3: Deploy Frontend to Vercel or Render

### Option A: Deploy to Vercel (Recommended - 1-Click Setup)

1. Log in to [Vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New Project** and import your `BAAPP-AI` repository.
3. Set **Framework Preset**: `Vite`
4. Set **Root Directory**: `frontend`
5. Under **Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://baapp-ai-backend.onrender.com` (Your Render backend URL from Step 2)
6. Click **Deploy**. Vercel will build and give you a live URL like:
   `https://baapp-ai.vercel.app`

---

## ⚡ Step 4: Configure CORS (Connecting Frontend & Backend)

In `backend/app/main.py`, CORS is already configured with `allow_origins=["*"]`, allowing your Vercel frontend to talk to your Render backend out of the box!

---

## 🎉 Congratulations! Your App is Live!

Your project **BAAPP-AI** will be accessible live on the web at your Vercel URL (`https://baapp-ai.vercel.app`)!
