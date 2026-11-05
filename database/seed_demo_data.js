/**
 * NutriTrack — Smart Diet & Nutrition Tracking System
 * Database Seed Script - Initial foods catalog and demo entries
 * Student: Richan Jose (AJC24MCA-I048)
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || (process.env.NODE_ENV === 'production' ? 3306 : 3307),
  database: process.env.DB_NAME || 'nutritrack_db',
  multipleStatements: true
};

export const demoFoods = [
  { name: 'Egg', category: 'Dairy', serving_unit: '1 large egg', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.0 },
  { name: 'Chicken Breast', category: 'Meat/Poultry', serving_unit: '100g cooked', calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6 },
  { name: 'Salmon Fillet', category: 'Seafood', serving_unit: '100g cooked', calories: 208, protein: 20.0, carbs: 0.0, fat: 13.0 },
  { name: 'Avocado', category: 'Fruits', serving_unit: '1 medium (150g)', calories: 160, protein: 2.0, carbs: 9.0, fat: 15.0 },
  { name: 'Steamed Broccoli', category: 'Vegetables', serving_unit: '100g', calories: 35, protein: 2.4, carbs: 6.7, fat: 0.4 },
  { name: 'Almonds (50g)', category: 'Nuts/Seeds', serving_unit: '50g (approx 40 nuts)', calories: 579, protein: 21.0, carbs: 22.0, fat: 50.0 },
  { name: 'Dosa', category: 'Grains', serving_unit: '1 medium plain dosa', calories: 168, protein: 4.0, carbs: 29.0, fat: 3.0 },
  { name: 'Idli', category: 'Grains', serving_unit: '2 pieces (100g)', calories: 130, protein: 4.5, carbs: 26.0, fat: 0.5 },
  { name: 'Chapati / Roti', category: 'Grains', serving_unit: '1 whole wheat roti', calories: 104, protein: 3.1, carbs: 20.0, fat: 0.5 },
  { name: 'Cooked White Rice', category: 'Grains', serving_unit: '1 cup (158g)', calories: 205, protein: 4.2, carbs: 45.0, fat: 0.4 },
  { name: 'Dal Tadka (Lentil Soup)', category: 'Grains', serving_unit: '1 bowl (150g)', calories: 180, protein: 9.0, carbs: 25.0, fat: 4.5 },
  { name: 'Paneer Butter Masala', category: 'Dairy', serving_unit: '1 bowl (150g)', calories: 340, protein: 14.0, carbs: 12.0, fat: 26.0 },
  { name: 'Greek Yogurt', category: 'Dairy', serving_unit: '1 cup (170g)', calories: 100, protein: 17.0, carbs: 6.0, fat: 0.7 },
  { name: 'Banana', category: 'Fruits', serving_unit: '1 medium (118g)', calories: 105, protein: 1.3, carbs: 27.0, fat: 0.3 },
  { name: 'Apple', category: 'Fruits', serving_unit: '1 medium (182g)', calories: 95, protein: 0.5, carbs: 25.0, fat: 0.3 },
  { name: 'Rolled Oats', category: 'Grains', serving_unit: '1/2 cup dry (40g)', calories: 150, protein: 5.0, carbs: 27.0, fat: 2.5 },
  { name: 'Peanut Butter', category: 'Nuts/Seeds', serving_unit: '2 tbsp (32g)', calories: 188, protein: 8.0, carbs: 7.0, fat: 16.0 },
  { name: 'Olive Oil', category: 'Other', serving_unit: '1 tbsp (14g)', calories: 119, protein: 0.0, carbs: 0.0, fat: 13.5 },
  { name: 'Boiled Chickpeas (Chana)', category: 'Vegetables', serving_unit: '1 cup (164g)', calories: 269, protein: 14.5, carbs: 45.0, fat: 4.2 }
];

export async function seedDatabase() {
  let connection;
  try {
    console.log('Connecting to MySQL on port', dbConfig.port, '...');
    connection = await mysql.createConnection(dbConfig);

    console.log('Connected! Verifying database tables...');
    
    // Create demo user
    const hashedPwd = await bcrypt.hash('richan123', 10);
    const [userResult] = await connection.execute(
      `INSERT INTO users (id, name, email, password, age, gender, height_cm, current_weight_kg, target_weight_kg, activity_level, daily_calorie_goal, daily_water_goal_ml)
       VALUES (1, 'Richan Jose', 'richan@nutritrack.app', ?, 22, 'male', 175.0, 70.0, 68.0, 'moderate', 2000, 2500)
       ON DUPLICATE KEY UPDATE name='Richan Jose', daily_calorie_goal=2000, daily_water_goal_ml=2500`,
      [hashedPwd]
    );

    console.log('Inserting catalog foods...');
    for (const food of demoFoods) {
      await connection.execute(
        `INSERT INTO foods (name, category, serving_unit, calories, protein, carbs, fat)
         SELECT ?, ?, ?, ?, ?, ?, ?
         WHERE NOT EXISTS (SELECT 1 FROM foods WHERE name = ?)`,
        [food.name, food.category, food.serving_unit, food.calories, food.protein, food.carbs, food.fat, food.name]
      );
    }

    // Insert sample meal logs for today matching the report screenshot
    console.log('Inserting sample meal entries matching screenshot...');
    const today = new Date().toISOString().slice(0, 10);
    
    // Clean old entries for today
    await connection.execute(`DELETE FROM meal_entries WHERE entry_date = ?`, [today]);

    const sampleMeals = [
      { foodName: 'Avocado', meal_type: 'Dinner', servings: 1.0 },
      { foodName: 'Steamed Broccoli', meal_type: 'Dinner', servings: 1.0 },
      { foodName: 'Chicken Breast', meal_type: 'Lunch', servings: 1.0 },
      { foodName: 'Salmon Fillet', meal_type: 'Lunch', servings: 1.0 },
      { foodName: 'Egg', meal_type: 'Breakfast', servings: 3.0 }
    ];

    for (const sm of sampleMeals) {
      const [foods] = await connection.execute(`SELECT id FROM foods WHERE name = ? LIMIT 1`, [sm.foodName]);
      if (foods.length > 0) {
        await connection.execute(
          `INSERT INTO meal_entries (user_id, food_id, meal_type, servings, entry_date) VALUES (1, ?, ?, ?, ?)`,
          [foods[0].id, sm.meal_type, sm.servings, today]
        );
      }
    }

    console.log('✅ NutriTrack demo data seeded successfully!');
  } catch (err) {
    console.error('Error during database seed:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed_demo_data.js')) {
  seedDatabase();
}
