
## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


📊 Expense Calculator — Multi-Family Smart Expense Manager

A modern, multi-account expense tracking application built using React (Vite), Firebase, and GitHub Pages.
Users can sign up with their Family Name, create multiple profiles, add categorized expenses, and view a clean dashboard with summaries.

🚀 Live Demo: (update after deployment)
👉 https://somasreddy.github.io/expense-calculator

⭐ Features
🔐 Authentication

Email + Password Signup/Login (Firebase Auth)

Each user provides a Family Name

Persistent login using Firebase Auth state listener

👨‍👩‍👧 Family & Profile Management

Each account = separate family with isolated data

Create multiple profiles (e.g., Self, Mom, Dad, Kids)

Cannot delete the last remaining profile

When a profile is deleted, its expenses auto-transfer to the remaining profile

💰 Smart Expense Tracking

Add expenses with:

Title

Amount

Profile selection

Auto-categorization based on keywords:

Grocery

Fuel

Bills

Transport

Entertainment

Health

Utilities

Others

📊 Dashboard & Charts

Expense list with filters

Category summaries

Pie charts & bar charts for insights (Recharts/Chart.js)

☁️ Cloud Storage (Firestore)

Each user's expenses stored securely under their UID

Real-time updates

Fully isolated from other users

📱 Fully Responsive UI

Works on mobile, tablet, laptop

Clean, modern components with intuitive navigation

🛠️ Tech Stack
Frontend

React + Vite

React Router

Context API (Auth Management)

CSS / Tailwind (optional)

Backend

Firebase Authentication

Firebase Firestore

Charts

Recharts / Chart.js

Deployment

GitHub Pages via gh-pages package
