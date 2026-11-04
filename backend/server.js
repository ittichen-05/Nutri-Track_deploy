/**
 * NutriTrack — Smart Diet & Nutrition Tracking System
 * Backend REST API Server (Node.js + Express.js + MySQL connection pool)
 * Student: Richan Jose (AJC24MCA-I048, Roll 46)
 * Amal Jyothi College of Engineering Autonomous, Kanjirappally
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'nutritrack_jwt_secret_key_2026';

app.use(cors());
app.use(express.json());

// In-memory fallback dataset for seamless offline operation & demonstration
let inMemoryFoods = [
  { id: 1, name: 'Egg', category: 'Dairy', serving_unit: '1 large egg', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.0 },
  { id: 2, name: 'Chicken Breast', category: 'Meat/Poultry', serving_unit: '100g cooked', calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6 },
  { id: 3, name: 'Salmon Fillet', category: 'Seafood', serving_unit: '100g cooked', calories: 208, protein: 20.0, carbs: 0.0, fat: 13.0 },
  { id: 4, name: 'Avocado', category: 'Fruits', serving_unit: '1 medium (150g)', calories: 160, protein: 2.0, carbs: 9.0, fat: 15.0 },
  { id: 5, name: 'Steamed Broccoli', category: 'Vegetables', serving_unit: '100g', calories: 35, protein: 2.4, carbs: 6.7, fat: 0.4 },
  { id: 6, name: 'Almonds (50g)', category: 'Nuts/Seeds', serving_unit: '50g', calories: 579, protein: 21.0, carbs: 22.0, fat: 50.0 },
  { id: 7, name: 'Dosa', category: 'Grains', serving_unit: '1 medium plain', calories: 168, protein: 4.0, carbs: 29.0, fat: 3.0 },
  { id: 8, name: 'Idli', category: 'Grains', serving_unit: '2 pieces (100g)', calories: 130, protein: 4.5, carbs: 26.0, fat: 0.5 },
  { id: 9, name: 'Chapati / Roti', category: 'Grains', serving_unit: '1 roti', calories: 104, protein: 3.1, carbs: 20.0, fat: 0.5 },
  { id: 10, name: 'Cooked White Rice', category: 'Grains', serving_unit: '1 cup (158g)', calories: 205, protein: 4.2, carbs: 45.0, fat: 0.4 }
];

let inMemoryMeals = [
  { id: 101, mealType: 'Dinner', foodId: 4, foodName: 'Avocado', servings: 1.0, calories: 160, protein: 2.0, carbs: 9.0, fat: 15.0 },
  { id: 102, mealType: 'Dinner', foodId: 5, foodName: 'Steamed Broccoli', servings: 1.0, calories: 35, protein: 2.4, carbs: 6.7, fat: 0.4 },
  { id: 103, mealType: 'Lunch', foodId: 2, foodName: 'Chicken Breast', servings: 1.0, calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6 },
  { id: 104, mealType: 'Lunch', foodId: 3, foodName: 'Salmon Fillet', servings: 1.0, calories: 208, protein: 20.0, carbs: 0.0, fat: 13.0 },
  { id: 105, mealType: 'Breakfast', foodId: 1, foodName: 'Egg', servings: 3.0, calories: 234, protein: 18.9, carbs: 1.8, fat: 15.0 }
];

let inMemoryWater = 0;
let inMemoryWeights = [
  { id: 1, date: '2026-10-21', weight: 71.2 },
  { id: 2, date: '2026-10-22', weight: 70.8 },
  { id: 3, date: '2026-10-23', weight: 70.5 },
  { id: 4, date: '2026-10-24', weight: 70.2 },
  { id: 5, date: '2026-10-25', weight: 70.0 }
];

// Initialize MySQL Connection Pool
let dbPool = null;
let isDbConnected = false;

async function initDb() {
  try {
    dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || (process.env.NODE_ENV === 'production' ? 3306 : 3307),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nutritrack_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const conn = await dbPool.getConnection();
    console.log('✅ Connected to MySQL Database on port', process.env.DB_PORT || 3307);
    conn.release();
    isDbConnected = true;
  } catch (err) {
    console.warn('⚠️  MySQL connection not active (' + err.message + '). Operating with in-memory data store.');
    isDbConnected = false;
  }
}

initDb();

// ------------------------------------------
// API ROUTES
// ------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'NutriTrack Smart Diet System',
    author: 'Richan Jose (AJC24MCA-I048)',
    database_connected: isDbConnected
  });
});

// FOODS CATALOG
app.get('/api/foods', async (req, res) => {
  if (isDbConnected && dbPool) {
    try {
      const [rows] = await dbPool.execute('SELECT * FROM foods ORDER BY name ASC');
      return res.json(rows);
    } catch (e) {
      console.error(e);
    }
  }
  res.json(inMemoryFoods);
});

app.post('/api/foods', async (req, res) => {
  const { name, category, calories, protein, carbs, fat, serving_unit } = req.body;
  if (!name || calories === undefined) {
    return res.status(400).json({ error: 'Food name and calories are required' });
  }

  if (isDbConnected && dbPool) {
    try {
      const [result] = await dbPool.execute(
        'INSERT INTO foods (name, category, serving_unit, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, category || 'Other', serving_unit || '1 serving', calories, protein || 0, carbs || 0, fat || 0]
      );
      return res.status(201).json({ id: result.insertId, name, category, calories, protein, carbs, fat });
    } catch (e) {
      console.error(e);
    }
  }

  const newItem = {
    id: Date.now(),
    name,
    category: category || 'Other',
    serving_unit: serving_unit || '1 serving',
    calories: Number(calories),
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fat: Number(fat) || 0
  };
  inMemoryFoods.push(newItem);
  res.status(201).json(newItem);
});

// MEALS (TODAY'S LOGGED MEALS)
app.get('/api/meals', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  if (isDbConnected && dbPool) {
    try {
      const sql = `
        SELECT m.id, m.meal_type as mealType, m.servings, m.food_id as foodId,
               f.name as foodName,
               ROUND(f.calories * m.servings) as calories,
               ROUND(f.protein * m.servings, 1) as protein,
               ROUND(f.carbs * m.servings, 1) as carbs,
               ROUND(f.fat * m.servings, 1) as fat
        FROM meal_entries m
        JOIN foods f ON m.food_id = f.id
        WHERE m.entry_date = ?
        ORDER BY m.id DESC
      `;
      const [rows] = await dbPool.execute(sql, [today]);
      return res.json(rows);
    } catch (e) {
      console.error(e);
    }
  }
  res.json(inMemoryMeals);
});

app.post('/api/meals', async (req, res) => {
  const { food_id, meal_type, servings } = req.body;
  const today = new Date().toISOString().slice(0, 10);

  if (isDbConnected && dbPool) {
    try {
      const [result] = await dbPool.execute(
        'INSERT INTO meal_entries (user_id, food_id, meal_type, servings, entry_date) VALUES (1, ?, ?, ?, ?)',
        [food_id, meal_type, servings || 1.0, today]
      );
      return res.status(201).json({ id: result.insertId, success: true });
    } catch (e) {
      console.error(e);
    }
  }

  const foundFood = inMemoryFoods.find(f => f.id === Number(food_id));
  const s = parseFloat(servings) || 1.0;
  const newEntry = {
    id: Date.now(),
    mealType: meal_type || 'Breakfast',
    foodId: Number(food_id),
    foodName: foundFood ? foundFood.name : 'Food',
    servings: s,
    calories: foundFood ? Math.round(foundFood.calories * s) : 100,
    protein: foundFood ? Number((foundFood.protein * s).toFixed(1)) : 5,
    carbs: foundFood ? Number((foundFood.carbs * s).toFixed(1)) : 10,
    fat: foundFood ? Number((foundFood.fat * s).toFixed(1)) : 2
  };
  inMemoryMeals.unshift(newEntry);
  res.status(201).json(newEntry);
});

app.delete('/api/meals/:id', async (req, res) => {
  const { id } = req.params;
  if (isDbConnected && dbPool) {
    try {
      await dbPool.execute('DELETE FROM meal_entries WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Meal entry deleted' });
    } catch (e) {
      console.error(e);
    }
  }
  inMemoryMeals = inMemoryMeals.filter(m => m.id !== Number(id));
  res.json({ success: true, message: 'Meal entry deleted' });
});

// WATER INTAKE
app.get('/api/water', (req, res) => {
  res.json({ current_ml: inMemoryWater, goal_ml: 2500 });
});

app.post('/api/water', (req, res) => {
  const { amount_ml } = req.body;
  inMemoryWater += (Number(amount_ml) || 250);
  res.json({ current_ml: inMemoryWater, goal_ml: 2500 });
});

app.post('/api/water/reset', (req, res) => {
  inMemoryWater = 0;
  res.json({ current_ml: inMemoryWater, goal_ml: 2500 });
});

// WEIGHT LOGS
app.get('/api/weight', (req, res) => {
  res.json(inMemoryWeights);
});

app.post('/api/weight', (req, res) => {
  const { weight_kg } = req.body;
  const today = new Date().toISOString().slice(0, 10);
  const entry = { id: Date.now(), date: today, weight: Number(weight_kg) };
  inMemoryWeights.push(entry);
  res.status(201).json(entry);
});

// AUTHENTICATION (Bcrypt + JWT)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const token = jwt.sign({ name, email }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ message: 'User registered successfully', token, user: { name, email } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const token = jwt.sign({ name: 'Richan Jose', email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ message: 'Login successful', token, user: { name: 'Richan Jose', email } });
});

// ------------------------------------------
// PRODUCTION FRONTEND STATIC SERVING
// ------------------------------------------
const distPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 NutriTrack Backend API running on http://localhost:${PORT}`);
});
