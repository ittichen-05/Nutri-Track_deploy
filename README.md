# NutriTrack — Smart Diet & Nutrition Tracking System

**Microproject for Integrated MCA (S5, 2026–2027)**  
**Department of Computer Applications, Amal Jyothi College of Engineering Autonomous, Kanjirappally**  
**Student:** Richan Jose (AJC24MCA-I048, Roll: 46)  

---

## 📋 Project Overview & Lab Integration

NutriTrack is a full-stack diet and nutrition tracking single-page web application. It integrates concepts across three labs:
1. **24INMCAL391 - RDBMS Lab**: Relational schema design with 5 normalized tables (`users`, `foods`, `meal_entries`, `water_entries`, `weight_entries`), foreign key constraints with `ON DELETE CASCADE`, multi-table SQL queries, and MySQL2 connection pooling.
2. **24INMCAL393 - User Interface & Design Lab**: React 19 component architecture, custom responsive CSS design system, SVG water cylinder animations, real-time energy calculation previews, and tab navigation.
3. **24INMCAT307 - Software Engineering**: 3-tier modular architecture, client-server decoupling, RESTful API endpoints, Bcrypt salted hashing, stateless JWT authorization, and defensive input validation.

---

## 🗂️ Project Structure

```
Nutri-Track/
├── backend/
│   ├── server.js              # Express REST API server & MySQL connection pool (Port 5000)
│   ├── package.json           # Dependencies: express, cors, dotenv, mysql2, bcryptjs, jsonwebtoken
│   └── .env                   # Database and server environment variables
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React UI: Calories, Macros, Water, Meal Log, Foods, BMR
│   │   ├── main.jsx           # React DOM entry point
│   │   └── styles/index.css   # Custom CSS design system matching Screenshot 2
│   ├── index.html             # HTML root document
│   ├── package.json           # React 19, Lucide React, Vite dependencies
│   └── vite.config.js         # Vite configuration with proxy to port 5000
├── database/
│   ├── schema.sql             # MySQL DDL for the 5 normalized tables
│   └── seed_demo_data.js      # Seed script for Indian & global foods and demo meal logs
└── README.md                  # Documentation and setup instructions
```

---

## 🚀 Quick Start Guide

### Running Frontend & Backend Manually

#### Step 1: Start the Backend (Port 5000)
```bash
cd backend
npm install
npm start
```
*Note: If MySQL 8.0 on port 3307 is active with `nutritrack_db`, the server connects to MySQL. If MySQL is not running, the backend seamlessly runs with its resilient in-memory store so all API features work without disruption.*

#### Step 2: Start the React Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

Open your browser at:  
👉 **http://localhost:3000**

---

## 🧪 Database Setup (MySQL 8.0)

1. Ensure MySQL is running on port 3307 (or update `DB_PORT` in `backend/.env`).
2. Import the schema:
```bash
mysql -u root -p -P 3307 < database/schema.sql
```
3. Seed default catalog items and demo logs:
```bash
cd database
node seed_demo_data.js
```

---

## 📊 Features Implemented

- **Daily Calorie Tracker**: Dynamic progress bar, 2000 kcal target, live remaining calculation.
- **Macronutrient Totals**: Real-time breakdown of Protein, Carbohydrates, and Fats.
- **Hydration Tracker**: Instant quick-add (+250 ml glass, +500 ml bottle), reset, and animated cylinder gauge.
- **Meal Logging**: Categorized by Breakfast, Lunch, Dinner, and Snacks, with live portion energy calculations.
- **Catalog Management**: Add custom items (Dosa, Idli, Chicken Breast, Salmon, etc.) with real-time catalog filtering.
- **BMR & TDEE Calculator**: Mifflin-St Jeor formula calculating resting metabolism, TDEE maintenance, and calorie deficit targets.
- **Body Weight Progression**: Daily weigh-in logger and BMI categorization.
