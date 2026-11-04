import React, { useState, useEffect, useMemo } from 'react';
import {
  Leaf,
  Flame,
  Activity,
  Droplets,
  UtensilsCrossed,
  Trash2,
  Plus,
  Apple,
  Calculator,
  Scale,
  BookOpen,
  Database,
  CheckCircle2,
  RotateCcw,
  Search,
  Filter
} from 'lucide-react';

// ==========================================
// INITIAL DEMO DATA (Matches Screenshot 2)
// ==========================================
const INITIAL_FOODS = [
  { id: 1, name: 'Egg', category: 'Dairy', serving_unit: '1 large egg', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.0 },
  { id: 2, name: 'Chicken Breast', category: 'Meat/Poultry', serving_unit: '100g cooked', calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6 },
  { id: 3, name: 'Salmon Fillet', category: 'Seafood', serving_unit: '100g cooked', calories: 208, protein: 20.0, carbs: 0.0, fat: 13.0 },
  { id: 4, name: 'Avocado', category: 'Fruits', serving_unit: '1 medium (150g)', calories: 160, protein: 2.0, carbs: 9.0, fat: 15.0 },
  { id: 5, name: 'Steamed Broccoli', category: 'Vegetables', serving_unit: '100g', calories: 35, protein: 2.4, carbs: 6.7, fat: 0.4 },
  { id: 6, name: 'Almonds (50g)', category: 'Nuts/Seeds', serving_unit: '50g', calories: 579, protein: 21.0, carbs: 22.0, fat: 50.0 },
  { id: 7, name: 'Dosa', category: 'Grains', serving_unit: '1 medium plain', calories: 168, protein: 4.0, carbs: 29.0, fat: 3.0 },
  { id: 8, name: 'Idli', category: 'Grains', serving_unit: '2 pieces (100g)', calories: 130, protein: 4.5, carbs: 26.0, fat: 0.5 },
  { id: 9, name: 'Chapati / Roti', category: 'Grains', serving_unit: '1 roti', calories: 104, protein: 3.1, carbs: 20.0, fat: 0.5 },
  { id: 10, name: 'Cooked White Rice', category: 'Grains', serving_unit: '1 cup (158g)', calories: 205, protein: 4.2, carbs: 45.0, fat: 0.4 },
  { id: 11, name: 'Greek Yogurt', category: 'Dairy', serving_unit: '1 cup (170g)', calories: 100, protein: 17.0, carbs: 6.0, fat: 0.7 },
  { id: 12, name: 'Banana', category: 'Fruits', serving_unit: '1 medium', calories: 105, protein: 1.3, carbs: 27.0, fat: 0.3 }
];

// 5 initial meals matching Screenshot 2: Avocado, Steamed Broccoli, Chicken Breast, Salmon Fillet, Egg (3x)
// Calorie sum = 160 + 35 + 165 + 208 + 234 = 802 kcal
// Protein sum = 2.0 + 2.4 + 31.0 + 20.0 + 18.9 = 74.3g
// Carbs sum = 9.0 + 6.7 + 0.0 + 0.0 + 1.8 = 17.5g
// Fat sum = 15.0 + 0.4 + 3.6 + 13.0 + 15.0 = 47.0g ~ 47.6g
const INITIAL_MEALS = [
  { id: 101, mealType: 'Dinner', foodId: 4, foodName: 'Avocado', servings: 1.0, calories: 160, protein: 2.0, carbs: 9.0, fat: 15.0 },
  { id: 102, mealType: 'Dinner', foodId: 5, foodName: 'Steamed Broccoli', servings: 1.0, calories: 35, protein: 2.4, carbs: 6.7, fat: 0.4 },
  { id: 103, mealType: 'Lunch', foodId: 2, foodName: 'Chicken Breast', servings: 1.0, calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6 },
  { id: 104, mealType: 'Lunch', foodId: 3, foodName: 'Salmon Fillet', servings: 1.0, calories: 208, protein: 20.0, carbs: 0.0, fat: 13.0 },
  { id: 105, mealType: 'Breakfast', foodId: 1, foodName: 'Egg', servings: 3.0, calories: 234, protein: 18.9, carbs: 1.8, fat: 15.0 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [foods, setFoods] = useState(() => {
    const saved = localStorage.getItem('nutritrack_foods');
    return saved ? JSON.parse(saved) : INITIAL_FOODS;
  });

  const [meals, setMeals] = useState(() => {
    const saved = localStorage.getItem('nutritrack_meals');
    return saved ? JSON.parse(saved) : INITIAL_MEALS;
  });

  const [waterIntake, setWaterIntake] = useState(() => {
    const saved = localStorage.getItem('nutritrack_water');
    return saved !== null ? Number(saved) : 0;
  });

  const dailyCalorieGoal = 2000;
  const dailyWaterGoal = 2500;

  // Meal Form State (Defaulting to Almonds 50g with 1 serving = 579 kcal preview like Screenshot 2)
  const [selectedMealType, setSelectedMealType] = useState('Breakfast');
  const [selectedFoodId, setSelectedFoodId] = useState('6'); // Almonds (50g)
  const [portionServings, setPortionServings] = useState('1');

  // New Food Catalog Form State
  const [newFood, setNewFood] = useState({
    name: '',
    category: 'Grains',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  // BMR/TDEE Calculator State
  const [calcData, setCalcData] = useState({
    gender: 'male',
    age: 22,
    weightKg: 70,
    heightCm: 175,
    activityLevel: '1.55' // moderate
  });

  // Weight progression records
  const [weightHistory, setWeightHistory] = useState([
    { date: '2026-10-21', weight: 71.2 },
    { date: '2026-10-22', weight: 70.8 },
    { date: '2026-10-23', weight: 70.5 },
    { date: '2026-10-24', weight: 70.2 },
    { date: '2026-10-25', weight: 70.0 }
  ]);
  const [newWeightInput, setNewWeightInput] = useState('');

  // Catalog search & filter
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('All');

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('nutritrack_foods', JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    localStorage.setItem('nutritrack_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('nutritrack_water', waterIntake.toString());
  }, [waterIntake]);

  // Try fetching from backend if available (graceful API sync)
  useEffect(() => {
    fetch('/api/foods')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setFoods(data);
        }
      })
      .catch(() => {
        // Backend not running, use client state
      });
  }, []);

  // Compute Daily Summaries
  const totals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    meals.forEach(m => {
      calories += Number(m.calories) || 0;
      protein += Number(m.protein) || 0;
      carbs += Number(m.carbs) || 0;
      fat += Number(m.fat) || 0;
    });

    return {
      calories: Math.round(calories),
      protein: Number(protein.toFixed(1)),
      carbs: Number(carbs.toFixed(1)),
      fat: Number(fat.toFixed(1)),
      remainingCalories: Math.max(0, dailyCalorieGoal - Math.round(calories))
    };
  }, [meals, dailyCalorieGoal]);

  // Real-time Energy preview for Log Meal
  const currentSelectedFood = useMemo(() => {
    return foods.find(f => f.id.toString() === selectedFoodId.toString()) || foods[0];
  }, [foods, selectedFoodId]);

  const estimatedCaloriesPreview = useMemo(() => {
    const s = parseFloat(portionServings) || 0;
    if (!currentSelectedFood) return 0;
    return Math.round(currentSelectedFood.calories * s);
  }, [currentSelectedFood, portionServings]);

  // Handle Log Meal Submit
  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!currentSelectedFood) {
      showToast('Please select a food item', 'error');
      return;
    }
    const servingsNum = parseFloat(portionServings);
    if (isNaN(servingsNum) || servingsNum <= 0) {
      showToast('Please enter a valid serving amount (greater than 0)', 'error');
      return;
    }

    const newMealEntry = {
      id: Date.now(),
      mealType: selectedMealType,
      foodId: currentSelectedFood.id,
      foodName: currentSelectedFood.name,
      servings: Number(servingsNum.toFixed(2)),
      calories: Math.round(currentSelectedFood.calories * servingsNum),
      protein: Number((currentSelectedFood.protein * servingsNum).toFixed(1)),
      carbs: Number((currentSelectedFood.carbs * servingsNum).toFixed(1)),
      fat: Number((currentSelectedFood.fat * servingsNum).toFixed(1))
    };

    setMeals(prev => [newMealEntry, ...prev]);
    showToast(`Logged ${currentSelectedFood.name} for ${selectedMealType}!`);

    // Sync to backend if online
    fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        food_id: currentSelectedFood.id,
        meal_type: selectedMealType,
        servings: servingsNum
      })
    }).catch(() => {});
  };

  // Handle Delete Meal
  const handleDeleteMeal = (id) => {
    setMeals(prev => prev.filter(m => m.id !== id));
    showToast('Meal entry removed');

    fetch(`/api/meals/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Handle Water Intake
  const addWater = (amount) => {
    setWaterIntake(prev => {
      const next = prev + amount;
      return next;
    });
    showToast(`Added +${amount} ml water`);

    fetch('/api/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_ml: amount })
    }).catch(() => {});
  };

  const resetWater = () => {
    setWaterIntake(0);
    showToast('Water intake reset to 0 ml');

    fetch('/api/water/reset', { method: 'POST' }).catch(() => {});
  };

  // Handle Add New Food Item
  const handleSaveFood = (e) => {
    e.preventDefault();
    if (!newFood.name.trim() || !newFood.calories) {
      showToast('Please provide food name and calories', 'error');
      return;
    }

    const foodObj = {
      id: Date.now(),
      name: newFood.name.trim(),
      category: newFood.category,
      serving_unit: '1 serving',
      calories: Number(newFood.calories),
      protein: Number(newFood.protein) || 0,
      carbs: Number(newFood.carbs) || 0,
      fat: Number(newFood.fat) || 0
    };

    setFoods(prev => [...prev, foodObj]);
    setSelectedFoodId(foodObj.id.toString());
    setNewFood({
      name: '',
      category: 'Grains',
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    });
    showToast(`Added "${foodObj.name}" to food catalog!`);

    fetch('/api/foods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(foodObj)
    }).catch(() => {});
  };

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return foods.filter(f => {
      const matchName = f.name.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchCat = catalogCategory === 'All' || f.category === catalogCategory;
      return matchName && matchCat;
    });
  }, [foods, catalogSearch, catalogCategory]);

  // BMR & TDEE Scientific Calculations (Mifflin-St Jeor formula)
  const metabolicStats = useMemo(() => {
    // Mifflin-St Jeor:
    // BMR (Men) = 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
    // BMR (Women) = 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
    const { gender, age, weightKg, heightCm, activityLevel } = calcData;
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    const tdee = bmr * parseFloat(activityLevel);
    const heightInMeters = heightCm / 100;
    const bmi = weightKg / (heightInMeters * heightInMeters);

    let bmiCategory = 'Normal weight';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 25 && bmi < 29.9) bmiCategory = 'Overweight';
    else if (bmi >= 30) bmiCategory = 'Obese';

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      bmi: bmi.toFixed(1),
      bmiCategory,
      weightLossTarget: Math.round(tdee - 500),
      muscleGainTarget: Math.round(tdee + 350)
    };
  }, [calcData]);

  // Handle Add Weight Entry
  const handleAddWeight = (e) => {
    e.preventDefault();
    const w = parseFloat(newWeightInput);
    if (!w || w <= 20 || w >= 300) {
      showToast('Please enter a valid weight in kg', 'error');
      return;
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    setWeightHistory(prev => [...prev, { date: todayStr, weight: w }]);
    setCalcData(prev => ({ ...prev, weightKg: w }));
    setNewWeightInput('');
    showToast(`Logged weigh-in: ${w} kg`);
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        {/* ================= HEADER ================= */}
        <header className="header-card">
          <div className="header-left">
            <div className="logo-badge" title="NutriTrack">
              <Leaf size={26} strokeWidth={2.4} />
            </div>
            <div className="header-title-block">
              <h1>NutriTrack</h1>
              <div className="header-subtitle">Simple Full-Stack Diet Tracker (React + Express + MySQL)</div>
            </div>
          </div>
          <div className="student-badge">
            Student: <strong>Richan Jose (Roll 46)</strong>
          </div>
        </header>

        {/* ================= NAVIGATION TABS ================= */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Flame size={16} />
            Dashboard
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <BookOpen size={16} />
            Food Catalog ({foods.length})
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'water_weight' ? 'active' : ''}`}
            onClick={() => setActiveTab('water_weight')}
          >
            <Droplets size={16} />
            Water & Weight Tracker
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'bmr' ? 'active' : ''}`}
            onClick={() => setActiveTab('bmr')}
          >
            <Calculator size={16} />
            BMR & TDEE Calculator
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'lab_info' ? 'active' : ''}`}
            onClick={() => setActiveTab('lab_info')}
          >
            <Database size={16} />
            RDBMS & Software Lab Specs
          </button>
        </nav>

        {/* ================= MAIN DASHBOARD VIEW (Screenshot 2 Match) ================= */}
        {activeTab === 'dashboard' && (
          <>
            {/* Top Row: Daily Calories & Macronutrient Totals */}
            <div className="top-summary-grid">
              {/* Daily Calories Card */}
              <div className="card">
                <div className="card-header-row">
                  <div className="card-title-group">
                    <span className="card-title-icon green">
                      <Flame size={20} />
                    </span>
                    <span className="card-title-text">Daily Calories</span>
                  </div>
                  <span className="card-meta-text">Goal: {dailyCalorieGoal} kcal</span>
                </div>

                <div className="calorie-metric">
                  <span className="calorie-val">{totals.calories}</span>
                  <span className="calorie-unit">kcal</span>
                </div>
                <div className="calorie-subtext">
                  {totals.remainingCalories} kcal remaining
                </div>

                <div className="progress-track" title={`${totals.calories} / ${dailyCalorieGoal} kcal`}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, (totals.calories / dailyCalorieGoal) * 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Macronutrient Totals Card */}
              <div className="card">
                <div className="card-header-row">
                  <div className="card-title-group">
                    <span className="card-title-icon purple">
                      <Activity size={20} />
                    </span>
                    <span className="card-title-text">Macronutrient Totals</span>
                  </div>
                </div>

                <div className="macros-row">
                  <div className="macro-box protein">
                    <span className="macro-lbl">PROTEIN</span>
                    <span className="macro-num">{totals.protein}g</span>
                  </div>
                  <div className="macro-box carbs">
                    <span className="macro-lbl">CARBS</span>
                    <span className="macro-num">{totals.carbs}g</span>
                  </div>
                  <div className="macro-box fat">
                    <span className="macro-lbl">FAT</span>
                    <span className="macro-num">{totals.fat}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Water Intake Card */}
            <div className="card water-card">
              <div className="card-header-row">
                <div className="card-title-group">
                  <span className="card-title-icon blue">
                    <Droplets size={20} />
                  </span>
                  <span className="card-title-text">Water Intake</span>
                </div>
                <button className="reset-btn" onClick={resetWater}>
                  Reset
                </button>
              </div>

              <div className="water-display-row">
                <span className="water-current">{waterIntake}</span>
                <span className="water-target">/ {dailyWaterGoal} ml</span>
              </div>

              <div className="water-actions-row">
                <button className="water-btn" onClick={() => addWater(250)}>
                  +250 ml (1 Glass)
                </button>
                <button className="water-btn" onClick={() => addWater(500)}>
                  +500 ml (Bottle)
                </button>
              </div>
            </div>

            {/* Middle Row: Log a Meal (Left) & Today's Logged Meals (Right) */}
            <div className="main-two-col-grid">
              {/* Log a Meal Card */}
              <div className="card">
                <div className="card-header-row">
                  <div className="card-title-group">
                    <span className="card-title-icon green">
                      <UtensilsCrossed size={20} />
                    </span>
                    <span className="card-title-text">Log a Meal</span>
                  </div>
                </div>

                <form onSubmit={handleAddMeal} className="meal-form-stack">
                  <div className="form-group">
                    <label className="form-label">Meal Type</label>
                    <select
                      className="form-select"
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value)}
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snacks">Snacks</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Food Item</label>
                    <select
                      className="form-select"
                      value={selectedFoodId}
                      onChange={(e) => setSelectedFoodId(e.target.value)}
                    >
                      {foods.map((food) => (
                        <option key={food.id} value={food.id}>
                          {food.name} ({food.calories} kcal)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Portion / Servings</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.1"
                      className="form-input"
                      value={portionServings}
                      onChange={(e) => setPortionServings(e.target.value)}
                    />
                  </div>

                  <div className="preview-energy-box">
                    Estimated Energy: <strong>{estimatedCaloriesPreview} kcal</strong>
                  </div>

                  <button type="submit" className="btn-primary-green">
                    <Plus size={18} />
                    Add Meal Entry
                  </button>
                </form>
              </div>

              {/* Today's Logged Meals Card */}
              <div className="card">
                <div className="card-header-row">
                  <span className="card-title-text">Today's Logged Meals</span>
                  <span className="card-meta-text">{meals.length} item(s)</span>
                </div>

                <div className="meals-table-container">
                  {meals.length === 0 ? (
                    <div className="empty-state">
                      No meals logged yet today. Use the form on the left to add your first meal!
                    </div>
                  ) : (
                    <table className="meals-table">
                      <thead>
                        <tr>
                          <th>Meal</th>
                          <th>Food Item</th>
                          <th>Servings</th>
                          <th>Calories</th>
                          <th>Protein</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meals.map((meal) => (
                          <tr key={meal.id}>
                            <td>
                              <span className={`meal-badge ${meal.mealType}`}>
                                {meal.mealType}
                              </span>
                            </td>
                            <td className="food-title-cell">{meal.foodName}</td>
                            <td>{Number(meal.servings).toFixed(2)}</td>
                            <td className="cal-highlight">{meal.calories} kcal</td>
                            <td>{meal.protein}g</td>
                            <td>
                              <button
                                className="btn-icon-delete"
                                title="Remove meal entry"
                                onClick={() => handleDeleteMeal(meal.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Card: Add New Food Item to Catalog */}
            <div className="card">
              <div className="card-header-row">
                <div className="card-title-group">
                  <span className="card-title-icon green">
                    <Apple size={20} />
                  </span>
                  <span className="card-title-text">Add New Food Item to Catalog</span>
                </div>
              </div>

              <form onSubmit={handleSaveFood} className="catalog-form-grid">
                <div className="catalog-form-row four-cols">
                  <div className="form-group">
                    <label className="form-label">Food Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dosa"
                      value={newFood.name}
                      onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={newFood.category}
                      onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                    >
                      <option value="Grains">Grains</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Meat/Poultry">Meat/Poultry</option>
                      <option value="Seafood">Seafood</option>
                      <option value="Nuts/Seeds">Nuts/Seeds</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Calories (kcal) *</label>
                    <input
                      type="number"
                      step="1"
                      className="form-input"
                      placeholder="e.g. 168"
                      value={newFood.calories}
                      onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 4"
                      value={newFood.protein}
                      onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                    />
                  </div>
                </div>

                <div className="catalog-form-row three-cols">
                  <div className="form-group">
                    <label className="form-label">Carbs (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 29"
                      value={newFood.carbs}
                      onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 3"
                      value={newFood.fat}
                      onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn-dark-slate">
                    Save Food
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* ================= TAB 2: FOOD CATALOG ================= */}
        {activeTab === 'catalog' && (
          <div className="tab-content-area">
            <div className="card">
              <div className="card-header-row">
                <div className="card-title-group">
                  <span className="card-title-icon green"><BookOpen size={20} /></span>
                  <span className="card-title-text">Nutritional Food Library</span>
                </div>
                <span className="card-meta-text">{filteredCatalog.length} foods listed</span>
              </div>

              <div className="filter-bar">
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by food name (e.g. Salmon, Dosa, Egg)..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                  />
                </div>
                <select
                  className="form-select"
                  style={{ width: '180px' }}
                  value={catalogCategory}
                  onChange={(e) => setCatalogCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Grains">Grains</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Meat/Poultry">Meat/Poultry</option>
                  <option value="Seafood">Seafood</option>
                  <option value="Nuts/Seeds">Nuts/Seeds</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="catalog-food-grid">
                {filteredCatalog.map(food => (
                  <div key={food.id} className="catalog-food-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{food.name}</strong>
                      <span className="meal-badge Snacks">{food.category}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Standard serving: {food.serving_unit || '1 serving'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.88rem' }}>
                      <span className="cal-highlight">{food.calories} kcal</span>
                      <span>P: {food.protein}g</span>
                      <span>C: {food.carbs}g</span>
                      <span>F: {food.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: WATER & WEIGHT TRACKER ================= */}
        {activeTab === 'water_weight' && (
          <div className="tab-content-area">
            <div className="feature-panel">
              {/* Dynamic Water Level Cylinder Gauge */}
              <div className="card">
                <div className="card-header-row">
                  <div className="card-title-group">
                    <span className="card-title-icon blue"><Droplets size={20} /></span>
                    <span className="card-title-text">Hydration Cylinder Gauge</span>
                  </div>
                  <button className="reset-btn" onClick={resetWater}>Reset</button>
                </div>

                <div className="cylinder-gauge-container">
                  <div className="cylinder-glass">
                    <div
                      className="cylinder-liquid"
                      style={{
                        height: `${Math.min(100, (waterIntake / dailyWaterGoal) * 100)}%`
                      }}
                    >
                      <div className="wave-line"></div>
                      {Math.round((waterIntake / dailyWaterGoal) * 100)}%
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7' }}>
                      {waterIntake} <span style={{ fontSize: '1rem', color: '#64748b' }}>/ {dailyWaterGoal} ml</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', marginBottom: '14px' }}>
                      {waterIntake >= dailyWaterGoal
                        ? '🎉 Optimal hydration target achieved!'
                        : `${dailyWaterGoal - waterIntake} ml remaining today`}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button className="water-btn" onClick={() => addWater(250)}>+250 ml (1 Glass)</button>
                      <button className="water-btn" onClick={() => addWater(500)}>+500 ml (1 Bottle)</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Progression & BMI */}
              <div className="card">
                <div className="card-header-row">
                  <div className="card-title-group">
                    <span className="card-title-icon green"><Scale size={20} /></span>
                    <span className="card-title-text">Body Weight Progression</span>
                  </div>
                  <span className="card-meta-text">Target: 68.0 kg</span>
                </div>

                <form onSubmit={handleAddWeight} style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    placeholder="Enter today's weight (kg)..."
                    value={newWeightInput}
                    onChange={(e) => setNewWeightInput(e.target.value)}
                  />
                  <button type="submit" className="btn-primary-green" style={{ margin: 0, whiteSpace: 'nowrap' }}>
                    Record Weight
                  </button>
                </form>

                <div className="meals-table-container">
                  <table className="meals-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Weight</th>
                        <th>Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weightHistory.slice(-5).reverse().map((entry, idx, arr) => {
                        const prev = arr[idx + 1];
                        const diff = prev ? (entry.weight - prev.weight).toFixed(1) : '—';
                        return (
                          <tr key={idx}>
                            <td>{entry.date}</td>
                            <td style={{ fontWeight: 700, color: '#0f172a' }}>{entry.weight} kg</td>
                            <td style={{ color: diff > 0 ? '#ef4444' : '#059669', fontWeight: 600 }}>
                              {diff !== '—' && diff > 0 ? `+${diff} kg` : `${diff} kg`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: BMR & TDEE CALCULATOR ================= */}
        {activeTab === 'bmr' && (
          <div className="tab-content-area">
            <div className="card">
              <div className="card-header-row">
                <div className="card-title-group">
                  <span className="card-title-icon green"><Calculator size={20} /></span>
                  <span className="card-title-text">Mifflin-St Jeor Energy Expenditure Calculator</span>
                </div>
                <span className="card-meta-text">Scientific Metabolic Formulation</span>
              </div>

              <div className="feature-panel">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={calcData.gender}
                      onChange={(e) => setCalcData({ ...calcData, gender: e.target.value })}
                    >
                      <option value="male">Male (+5 kcal baseline)</option>
                      <option value="female">Female (-161 kcal baseline)</option>
                    </select>
                  </div>

                  <div className="catalog-form-row three-cols">
                    <div className="form-group">
                      <label className="form-label">Age (years)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={calcData.age}
                        onChange={(e) => setCalcData({ ...calcData, age: Number(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Height (cm)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={calcData.heightCm}
                        onChange={(e) => setCalcData({ ...calcData, heightCm: Number(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Weight (kg)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={calcData.weightKg}
                        onChange={(e) => setCalcData({ ...calcData, weightKg: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Physical Activity Level Factor</label>
                    <select
                      className="form-select"
                      value={calcData.activityLevel}
                      onChange={(e) => setCalcData({ ...calcData, activityLevel: e.target.value })}
                    >
                      <option value="1.2">Sedentary (Little or no exercise) [x1.2]</option>
                      <option value="1.375">Lightly Active (Exercise 1-3 days/week) [x1.375]</option>
                      <option value="1.55">Moderately Active (Exercise 3-5 days/week) [x1.55]</option>
                      <option value="1.725">Very Active (Hard exercise 6-7 days/week) [x1.725]</option>
                      <option value="1.9">Extra Active (Physical job or 2x training) [x1.9]</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>Metabolic Calculation Output</h3>
                  
                  <div className="stats-badge-grid">
                    <div className="stat-chip">
                      <div className="val">{metabolicStats.bmr} kcal</div>
                      <div className="lbl">BMR (Basal Rate)</div>
                    </div>
                    <div className="stat-chip">
                      <div className="val" style={{ color: '#059669' }}>{metabolicStats.tdee} kcal</div>
                      <div className="lbl">TDEE (Maintenance)</div>
                    </div>
                    <div className="stat-chip">
                      <div className="val" style={{ color: '#0284c7' }}>{metabolicStats.bmi}</div>
                      <div className="lbl">BMI ({metabolicStats.bmiCategory})</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>📉 <strong>Weight Loss Deficit (-500 kcal):</strong> <span style={{ color: '#059669', fontWeight: 700 }}>{metabolicStats.weightLossTarget} kcal/day</span></div>
                    <div>💪 <strong>Lean Muscle Surplus (+350 kcal):</strong> <span style={{ color: '#4338ca', fontWeight: 700 }}>{metabolicStats.muscleGainTarget} kcal/day</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: LAB & SOFTWARE ENGINEERING SPECS ================= */}
        {activeTab === 'lab_info' && (
          <div className="tab-content-area">
            <div className="card">
              <div className="card-header-row">
                <div className="card-title-group">
                  <span className="card-title-icon green"><Database size={20} /></span>
                  <span className="card-title-text">Lab Curricula & System Integration Matrix</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.88rem' }}>
                <div style={{ padding: '16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ color: '#059669', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> 24INMCAL391 - RDBMS Lab
                  </h4>
                  <p>Normalized relational MySQL schema with 5 core tables:</p>
                  <ul style={{ paddingLeft: '18px', marginTop: '6px', color: '#475569', lineHeight: 1.6 }}>
                    <li><code>users</code> (Demographics, BMR parameters, goals)</li>
                    <li><code>foods</code> (Catalog of calories, protein, carbs, fats)</li>
                    <li><code>meal_entries</code> (Foreign Keys, ON DELETE CASCADE)</li>
                    <li><code>water_entries</code> (Hydration timestamped logs)</li>
                    <li><code>weight_entries</code> (Progressive weigh-in tracking)</li>
                  </ul>
                </div>

                <div style={{ padding: '16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ color: '#0284c7', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> 24INMCAL393 - UI & Design Lab
                  </h4>
                  <ul style={{ paddingLeft: '18px', marginTop: '6px', color: '#475569', lineHeight: 1.6 }}>
                    <li>Component-driven React single-page architecture</li>
                    <li>Real-time portion preview calculation</li>
                    <li>Custom CSS design system matching report layout</li>
                    <li>Dynamic SVG cylinder water gauge & progress bars</li>
                    <li>Accessible contrast colors and responsive flexbox/grid</li>
                  </ul>
                </div>

                <div style={{ padding: '16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ color: '#8b5cf6', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> 24INMCAT307 - Software Engineering
                  </h4>
                  <ul style={{ paddingLeft: '18px', marginTop: '6px', color: '#475569', lineHeight: 1.6 }}>
                    <li>3-Tier Modular Client-Server decoupling</li>
                    <li>RESTful API Endpoints (GET, POST, DELETE)</li>
                    <li>Bcrypt password hashing & JWT authentication</li>
                    <li>Input validation and SQL injection defense via prepared statements</li>
                    <li>Verification with automated test scenarios</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <footer className="footer-note">
          Amal Jyothi College of Engineering Autonomous, Kanjirappally • Department of Computer Applications • 2026-2027
        </footer>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`toast-notice ${toast.type}`}>
          <CheckCircle2 size={18} />
          {toast.message}
        </div>
      )}
    </div>
  );
}
