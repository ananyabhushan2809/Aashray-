# 🚀 Step-by-Step Guide: Deploying Smart Hostel Management Portal for FREE

This guide provides precise, step-by-step instructions to deploy both your **Flask Backend** and **React (Vite) Frontend** completely for free using industry-standard cloud platforms.

---

## 🏗 Architecture Overview
- **Backend (Flask + SQLite):** Deployed on **[Render](https://render.com)** (Free Tier).
- **Frontend (React + Vite + Tailwind):** Deployed on **[Vercel](https://vercel.com)** or **[Netlify](https://netlify.com)** (Free Tier).
- **Database:** SQLite file stored on the Render instance disk.

*(Note: We have already configured `gunicorn` in `requirements.txt` and dynamic environment variables `VITE_API_BASE_URL` in `api.js` to ensure seamless deployment!)*

---

## STEP 1: Push Your Code to GitHub 🐙

Both Render and Vercel connect directly to your GitHub repository for automated continuous deployment.

1. Open your terminal in the root project folder (`c:\Users\ACER\Desktop\SHMS`).
2. Initialize Git (if not already done) and commit all files:
   ```bash
   git init
   git add .
   git commit -m "Prepare project for deployment"
   ```
3. Go to [GitHub](https://github.com) and create a new **Public or Private Repository** (e.g., `smart-hostel-portal`).
4. Link your local project to GitHub and push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/smart-hostel-portal.git
   git push -u origin main
   ```

---

## STEP 2: Deploy the Flask Backend on Render ☁️

Render provides a completely free Web Service tier perfect for running Python Flask backends.

### 1. Create Web Service on Render
1. Go to **[Render.com](https://render.com)** and sign in with your GitHub account.
2. Click the **"New +"** button at the top right and select **Web Service**.
3. Choose **"Build and deploy from a Git repository"** and click Next.
4. Connect your newly created GitHub repository (`smart-hostel-portal`).

### 2. Configure Settings
Fill out the service configuration exactly as follows:
- **Name:** `shms-backend` (or any name you prefer)
- **Region:** Choose the region closest to you (e.g., Frankfurt, Oregon, Singapore)
- **Branch:** `main`
- **Root Directory:** `backend` *(⚠️ Essential: Since your backend is in the `/backend` subfolder)*
- **Runtime:** `Python 3`
- **Build Command:**
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command:**
  ```bash
  gunicorn app:app
  ```
- **Instance Type:** Select **Free ($0/month)**.

### 3. Add Environment Variables (Advanced Settings)
Scroll down and click **Advanced**, then add the following environment variable:
- `PYTHONVERSION` = `3.11.0` (Ensures compatibility with modern Python packages)

### 4. Deploy & Get Backend URL
Click **Create Web Service**.
- Render will start building your Python environment.
- Once successfully deployed (takes ~2-3 mins), copy the live URL shown at the top left of the dashboard (e.g., `https://shms-backend-xxxx.onrender.com`).
- Test it by visiting `https://shms-backend-xxxx.onrender.com/api/admin/dashboard` or any active endpoint.

---

## STEP 3: Deploy the React Frontend on Vercel ⚡

Vercel provides lightning-fast global CDN hosting for Vite/React applications.

### 1. Create Project on Vercel
1. Go to **[Vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository (`smart-hostel-portal`).

### 2. Configure Build Settings
In the configuration screen before clicking Deploy:
- **Project Name:** `smart-hostel-portal`
- **Framework Preset:** Select **Vite**
- **Root Directory:** Click **Edit** and select `frontend` *(⚠️ Essential: Since your frontend is in the `/frontend` subfolder)*

### 3. Set Environment Variable
Expand the **Environment Variables** accordion section and add:
- **Key:** `VITE_API_BASE_URL`
- **Value:** `https://shms-backend-xxxx.onrender.com/api` *(Paste your live Render backend URL from Step 2 with `/api` appended)*

### 4. Configure Client-Side Routing (Vite SPA Redirect)
Because React Router requires all paths to route back to `index.html` on refresh, create a file named `vercel.json` inside your `frontend/` directory (if not already there) with this exact content:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
*(Commit and push this file to your GitHub repository).*

### 5. Deploy!
Click **Deploy**. Vercel will build your frontend and instantly provide you with a live production domain! 🎉

---

## 💡 Important Free-Tier Notes & Best Practices

1. **Render Free Tier Cold Starts:** Free web services on Render spin down after 15 minutes of inactivity. When the first user opens the web app after inactivity, the initial backend request might take 30–50 seconds to respond as the server wakes up. Once awake, all subsequent requests are instant.
2. **Database Persistence:** Since SQLite stores data in a local file (`hostel.db`), Render free instances reset local disk changes on each deployment. For long-term production persistence, you can migrate to a free PostgreSQL database (e.g., using **Supabase** or Render's Free Postgres tier) and change the SQLAlchemy/SQLite connection URI.
3. **Automated CI/CD:** Every time you run `git push origin main`, both Render and Vercel will automatically trigger a new build and deploy your latest changes!
