# 📊 Expense Tracker — Multi-Family Smart Expense Manager

A modern, multi-account expense tracking application built using **React (Vite)**, **Firebase**, and **Capacitor**. It supports **Voice Input**, **SMS Auto-Capture (Android)**, and **Data Export**.

Users can sign up with their **Family Name**, create multiple **profiles**, add categorized expenses, and view a clean dashboard with summaries.

🚀 **Live Demo (Web):**  
👉 https://somasreddy.github.io/expense-tracker

---

## ⭐ Features

### Core Features
- **Authentication**: Secure login with Firebase.
- **Multi-Family Support**: Manage expenses for the whole family under one account.
- **Profile Management**: Create profiles and transfer expenses when deleting a profile.
- **Smart Auto-Categorization**: Automatically categorizes expenses based on keywords.
- **Data Export**: Export expense reports as **CSV** or **PDF**.
- **Dashboard**: Visual charts and summaries of your spending.

### 📱 Mobile & Advanced Features
- **Voice Input**: Add expenses by speaking (e.g., "Spent 500 on Groceries").
- **SMS Auto-Capture (Android)**: Automatically detects transaction SMS from banks/UPI and suggests expenses.
- **Cross-Platform**: Works on Web, Android, and iOS (via Capacitor).

---

## 🛠️ Tech Stack
- **Frontend**: React + Vite, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Firebase (Auth + Firestore)
- **Mobile Runtime**: Capacitor (Android/iOS)
- **Icons**: Lucide React
- **Charts**: Recharts

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Android Studio (for Android build)

### 1. Clone & Install
```bash
git clone https://github.com/somasreddy/expense-tracker.git
cd expense-tracker
npm install --legacy-peer-deps
```

### 2. Run on Web
```bash
npm run dev
```

### 3. Build for Android
1.  **Build the web assets:**
    ```bash
    npm run build
    ```
2.  **Sync with Capacitor:**
    ```bash
    npx cap sync
    ```
3.  **Open in Android Studio:**
    ```bash
    npx cap open android
    ```
4.  Run the app on an emulator or connected device from Android Studio.

---

## 📖 Usage Guide

### 🌐 Web
1.  **Sign Up/Login**: Use your email and a unique Family Name.
2.  **Add Expense**: Click the "+" button. You can type or use the **Microphone** icon for voice input.
3.  **View Reports**: Check the dashboard for monthly breakdowns.
4.  **Export**: Use the "Export Data" button in the settings/profile menu.

### 🤖 Android
1.  **SMS Permissions**: On first launch, grant **SMS Permissions** to enable auto-capture.
2.  **Auto-Capture**: When you receive a transaction SMS (UPI/Bank), the app will detect it and suggest adding it as an expense.
3.  **Voice Input**: Works natively using the device's speech recognition.

### 🍎 iOS
- **Manual & Voice Entry**: Fully supported.
- **SMS Reading**: Not supported due to iOS privacy restrictions.

---

## 🚀 Deployment (Web)
To deploy to GitHub Pages:
```bash
npm run deploy
```

## 📜 License
MIT License
