-- ============================================================
-- NutriTrack — Smart Diet & Nutrition Tracking System
-- RDBMS Lab - Schema Design (5 Normalized Tables)
-- Amal Jyothi College of Engineering - Department of Computer Applications
-- Student: Richan Jose (AJC24MCA-I048, Roll: 46)
-- ============================================================

CREATE DATABASE IF NOT EXISTS nutritrack_db;
USE nutritrack_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    age INT DEFAULT 22,
    gender ENUM('male', 'female', 'other') DEFAULT 'male',
    height_cm DECIMAL(5,2) DEFAULT 175.00,
    current_weight_kg DECIMAL(5,2) DEFAULT 70.00,
    target_weight_kg DECIMAL(5,2) DEFAULT 68.00,
    activity_level ENUM('sedentary', 'light', 'moderate', 'active', 'very_active') DEFAULT 'moderate',
    daily_calorie_goal INT DEFAULT 2000,
    daily_water_goal_ml INT DEFAULT 2500,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. FOODS CATALOG TABLE
CREATE TABLE IF NOT EXISTS foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    category ENUM('Grains', 'Vegetables', 'Fruits', 'Dairy', 'Meat/Poultry', 'Seafood', 'Nuts/Seeds', 'Snacks', 'Other') DEFAULT 'Other',
    serving_unit VARCHAR(50) DEFAULT '1 serving',
    calories DECIMAL(6,2) NOT NULL,
    protein DECIMAL(5,2) DEFAULT 0.00,
    carbs DECIMAL(5,2) DEFAULT 0.00,
    fat DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. MEAL ENTRIES TABLE
CREATE TABLE IF NOT EXISTS meal_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL DEFAULT 1,
    food_id INT NOT NULL,
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snacks') NOT NULL,
    servings DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
);

-- 4. WATER ENTRIES TABLE
CREATE TABLE IF NOT EXISTS water_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL DEFAULT 1,
    amount_ml INT NOT NULL DEFAULT 250,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. WEIGHT PROGRESSION TABLE
CREATE TABLE IF NOT EXISTS weight_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL DEFAULT 1,
    weight_kg DECIMAL(5,2) NOT NULL,
    entry_date DATE NOT NULL,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INDEXES FOR HIGH QUERY PERFORMANCE
CREATE INDEX idx_meal_date ON meal_entries(user_id, entry_date);
CREATE INDEX idx_water_date ON water_entries(user_id, entry_date);
CREATE INDEX idx_weight_date ON weight_entries(user_id, entry_date);
CREATE INDEX idx_food_name ON foods(name);
