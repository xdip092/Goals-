import React, { useState } from 'react';
import { FitnessLog, ActiveWorkoutPlan, GroomingRoutine } from '../types';
import { Dumbbell, Salad, Heart, Droplet, Footprints, Moon, CheckCircle, Plus, Sparkles, Smile, ShoppingBag } from 'lucide-react';

interface IndianMealPlan {
  budget: string;
  meals: { name: string; items: string[]; protein: string; price: string }[];
}

export default function FitnessComponent({
  fitnessLog,
  setFitnessLog,
  workoutPlan,
  setWorkoutPlan,
  groomingRoutines,
  setGroomingRoutines,
  onXpGained
}: {
  fitnessLog: FitnessLog;
  setFitnessLog: React.Dispatch<React.SetStateAction<FitnessLog>>;
  workoutPlan: ActiveWorkoutPlan[];
  setWorkoutPlan: React.Dispatch<React.SetStateAction<ActiveWorkoutPlan[]>>;
  groomingRoutines: GroomingRoutine[];
  setGroomingRoutines: React.Dispatch<React.SetStateAction<GroomingRoutine[]>>;
  onXpGained?: (xp: number) => void;
}) {
  const [budgetTier, setBudgetTier] = useState<'budget' | 'medium' | 'premium'>('budget');
  const [workoutSchedule, setWorkoutSchedule] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // Meal presets catalog based on real Indian pricing
  const mealPlans: Record<'budget' | 'medium' | 'premium', IndianMealPlan> = {
    budget: {
      budget: 'Rs. 100 - Rs. 150 / day (BCA Hosteller friendly)',
      meals: [
        { name: 'Breakfast (8:00 AM)', items: ['4 Egg Whites (boiled) + 2 slices of whole wheat bread', 'Black coffee'], protein: '20g', price: 'Rs. 30' },
        { name: 'Lunch (1:30 PM)', items: ['1 cup dal + 1 cup soyabean chunks curry (100g soy)', '2 rotis + small cucumber slice'], protein: '45g', price: 'Rs. 45' },
        { name: 'Evening snack (5:30 PM)', items: ['1 glass of double-toned milk (200ml)', 'Roasted chana (soaked black gram - 50g)'], protein: '15g', price: 'Rs. 15' },
        { name: 'Dinner (8:30 PM)', items: ['Pressure cooker dal khichdi', 'Sautéed paneer block (50g) / boiled egg whites (3)'], protein: '20g', price: 'Rs. 35' }
      ]
    },
    medium: {
      budget: 'Rs. 200 - Rs. 250 / day',
      meals: [
        { name: 'Breakfast', items: ['Oatmeal (50g) in toned milk + 1 banana + peanut butter (1 scoop)', '3 whole boiled eggs'], protein: '30g', price: 'Rs. 50' },
        { name: 'Lunch', items: ['Sautéed chicken breast (150g) OR high-protein Paneer bhurji (150g)', '1.5 cups brown rice + steamed broccoli'], protein: '40g', price: 'Rs. 80' },
        { name: 'Evening snack', items: ['Handful of almonds & walnuts + green tea', 'Roasted chickpeas (50g)'], protein: '12g', price: 'Rs. 30' },
        { name: 'Dinner', items: ['Grilled Fish (150g) OR Tofu-veggie mix saute (150g)', '2 rotis + 1 cup curd'], protein: '35g', price: 'Rs. 70' }
      ]
    },
    premium: {
      budget: 'Rs. 350+ / day (Ultimate Muscle Building)',
      meals: [
        { name: 'Breakfast', items: ['1 scoop Whey Protein in water + almonds', 'Avocado Toast with 4 scrambler eggs'], protein: '45g', price: 'Rs. 120' },
        { name: 'Lunch', items: ['Basmati rice + grilled lean chicken thigh pieces (200g)', 'Greek yogurt bowl + spinach salad'], protein: '50g', price: 'Rs. 130' },
        { name: 'Post-Workout Shaker', items: ['Whey Protein + 1 scoop creatine + dextrose'], protein: '26g', price: 'Rs. 90' },
        { name: 'Dinner', items: ['Salmon filet (180g) OR Premium Paneer Butter Steak (180g)', 'Sweet potato roasted + Mixed greens salad'], protein: '38g', price: 'Rs. 160' }
      ]
    }
  };

  const handleRoutineToggle = (id: string) => {
    setGroomingRoutines(prev =>
      prev.map(r => {
        if (r.id === id) {
          const toggledState = !r.completed;
          if (toggledState && onXpGained) onXpGained(10); // Gain 10 XP for self-care completion
          return { ...r, completed: toggledState };
        }
        return r;
      })
    );
  };

  const handleWorkoutToggle = (idx: number) => {
    setWorkoutPlan(prev =>
      prev.map((val, i) => {
        if (i === idx) {
          const toggledState = !val.completed;
          if (toggledState && onXpGained) onXpGained(25); // Gain 25 XP for workouts finished
          return { ...val, completed: toggledState };
        }
        return val;
      })
    );
  };

  const handleGenericStatChange = (key: keyof FitnessLog, val: number) => {
    setFitnessLog(prev => ({
      ...prev,
      [key]: Math.max(0, parseFloat((prev[key] + val).toFixed(1)))
    }));
  };

  const currentMealPlan = mealPlans[budgetTier];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans" id="fitness-root">
      
      {/* 1. Quick Stats Logs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5 border-b border-gray-100 pb-3">
          <Heart className="h-4.5 w-4.5 text-rose-500" />
          Fitness Metric Analytics Tracker
        </h3>

        {/* BMI Card */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 border border-gray-150 p-3 rounded-xl text-center space-y-0.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Weight logs</span>
            <p className="text-sm font-bold text-gray-800">{fitnessLog.weight} kg</p>
            <div className="flex justify-center gap-1.5 pt-1">
              <button onClick={() => handleGenericStatChange('weight', -0.5)} className="text-[9px] font-bold bg-white border px-1 rounded-sm cursor-pointer">-</button>
              <button onClick={() => handleGenericStatChange('weight', 0.5)} className="text-[9px] font-bold bg-white border px-1 rounded-sm cursor-pointer">+</button>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-150 p-3 rounded-xl text-center space-y-0.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Body Fat %</span>
            <p className="text-sm font-bold text-gray-800">{fitnessLog.bodyFatPercentage}%</p>
            <div className="flex justify-center gap-1.5 pt-1">
              <button onClick={() => handleGenericStatChange('bodyFatPercentage', -0.1)} className="text-[9px] font-bold bg-white border px-1 rounded-sm cursor-pointer">-</button>
              <button onClick={() => handleGenericStatChange('bodyFatPercentage', 0.1)} className="text-[9px] font-bold bg-white border px-1 rounded-sm cursor-pointer">+</button>
            </div>
          </div>
          <div className="bg-rose-50/40 border border-rose-100 p-3 rounded-xl text-center space-y-0.5">
            <span className="text-[10px] text-rose-800 font-bold uppercase">Calculated BMI</span>
            <p className="text-sm font-bold text-rose-900">{(fitnessLog.weight / 1.74 / 1.74).toFixed(1)}</p>
            <p className="text-[8px] text-rose-500 italic mt-0.5">Underweight - normal</p>
          </div>
        </div>

        {/* steps, water, sleep scales */}
        <div className="space-y-3 pt-2">
          {/* Steps */}
          <div className="flex items-center justify-between p-2.5 bg-gray-50/50 rounded-xl border border-gray-150">
            <div className="flex items-center gap-2">
              <Footprints className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Daily steps walked</p>
                <p className="text-xs font-bold text-gray-800">{fitnessLog.steps} / 10,000 steps</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleGenericStatChange('steps', -1000)} className="text-xs bg-white border px-2 py-0.5 rounded-lg font-bold cursor-pointer">-1k</button>
              <button onClick={() => handleGenericStatChange('steps', 1000)} className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-0.5 rounded-lg font-bold cursor-pointer">+1k</button>
            </div>
          </div>

          {/* Water */}
          <div className="flex items-center justify-between p-2.5 bg-gray-50/50 rounded-xl border border-gray-150">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-sky-600" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Water intake hydration</p>
                <p className="text-xs font-bold text-gray-800">{fitnessLog.waterIntakeLiters} / 3.5 Liters</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleGenericStatChange('waterIntakeLiters', -0.25)} className="text-xs bg-white border px-2 py-0.5 rounded-lg font-bold cursor-pointer">-250ml</button>
              <button onClick={() => handleGenericStatChange('waterIntakeLiters', 0.25)} className="text-xs bg-sky-50 text-sky-700 hover:bg-sky-100 px-2 py-0.5 rounded-lg font-bold cursor-pointer">+250ml</button>
            </div>
          </div>

          {/* Sleep */}
          <div className="flex items-center justify-between p-2.5 bg-gray-50/50 rounded-xl border border-gray-150">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Deep Sleep Hours</p>
                <p className="text-xs font-bold text-gray-800">{fitnessLog.sleepHours} / 8.0 hr</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleGenericStatChange('sleepHours', -0.5)} className="text-xs bg-white border px-2 py-0.5 rounded-lg font-bold cursor-pointer">-30m</button>
              <button onClick={() => handleGenericStatChange('sleepHours', 0.5)} className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 px-2 py-0.5 rounded-lg font-bold cursor-pointer">+30m</button>
            </div>
          </div>
        </div>

        {/* Nutritional goals macro scale */}
        <div className="space-y-2 pt-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Macros Tracking (Estimated)</p>
          <div className="bg-gray-50 rounded-2xl p-4.5 border border-gray-150 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-600">Calories:</span>
              <span className="font-bold text-gray-900">{fitnessLog.caloriesConsumed} / 2500 kcal</span>
            </div>
            <div className="w-full bg-gray-250/30 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full" style={{ width: `${(fitnessLog.caloriesConsumed / 2500) * 100}%` }} />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
              <div>
                <span className="font-bold text-gray-400">Protein</span>
                <p className="text-gray-800 font-bold">{fitnessLog.proteinGrams}g / 130g</p>
              </div>
              <div>
                <span className="font-bold text-gray-400">Carbs</span>
                <p className="text-gray-800 font-bold">{fitnessLog.carbsGrams}g / 300g</p>
              </div>
              <div>
                <span className="font-bold text-gray-400">Fats</span>
                <p className="text-gray-800 font-bold">{fitnessLog.fatGrams}g / 75g</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Workout Workout Splits */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
            <Dumbbell className="h-4.5 w-4.5 text-indigo-600" />
            Home / Gym Workout Split Program
          </h3>

          <select
            value={workoutSchedule}
            onChange={(e: any) => setWorkoutSchedule(e.target.value)}
            className="text-[10px] font-bold bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2 rounded-lg focus:outline-hidden"
          >
            <option value="beginner">🏡 Beginner Home Split</option>
            <option value="intermediate">🏋️ Intermediate Strength</option>
            <option value="advanced">💪 Advanced Muscle Build</option>
          </select>
        </div>

        {/* Display Workout splits */}
        <div className="space-y-3.5 overflow-y-auto max-h-[380px] pr-1">
          {workoutPlan.map((wk, idx) => (
            <div key={wk.id} className={`p-3 rounded-xl border transition-all ${
              wk.completed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-gray-50/50 border-gray-150'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-indigo-950">{wk.day}</span>
                <button
                  onClick={() => handleWorkoutToggle(idx)}
                  className={`text-[9px] font-bold px-2 py-1 rounded-md transition-colors ${
                    wk.completed ? 'bg-emerald-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {wk.completed ? 'Completed ✓' : 'Mark finished'}
                </button>
              </div>

              {/* list exercises */}
              <div className="space-y-1.5">
                {wk.exercises.map((ex, i) => (
                  <div key={i} className="flex justify-between text-[11px] text-gray-600 font-semibold">
                    <span>- {ex.name}</span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {ex.sets} sets × {ex.reps} reps {ex.weightUsed > 0 ? `(${ex.weightUsed}kg)` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Budget Meals and Self Grooming checklist */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
        
        {/* Diet Selector and details */}
        <div className="pb-3 border-b border-gray-100 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
              <Salad className="h-4.5 w-4.5 text-emerald-600" />
              Budget-friendly Indian Meal presets
            </h3>
            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-150">
              {['budget', 'medium', 'premium'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setBudgetTier(tier as any)}
                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                    budgetTier === tier ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-semibold">{currentMealPlan.budget}</p>
        </div>

        {/* Display meals list */}
        <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1">
          {currentMealPlan.meals.map((meal, idx) => (
            <div key={idx} className="p-2.5 bg-gray-55/10 bg-gray-50 rounded-xl space-y-1 text-xs border border-gray-150">
              <div className="flex justify-between font-bold text-gray-700">
                <span>{meal.name}</span>
                <span className="text-emerald-700 font-mono text-[10px]">{meal.protein} Protein</span>
              </div>
              <ul className="text-[10px] text-gray-500 space-y-0.5">
                {meal.items.map((it, i) => <li key={i}>• {it}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Skincare / Grooming / posture */}
        <div className="pt-2 border-t border-gray-150 space-y-3">
          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            Social Styling &amp; Posture Care routines
          </h4>
          <div className="space-y-1.5 overflow-y-auto max-h-[120px] pr-1">
            {groomingRoutines.map((gr) => (
              <label
                key={gr.id}
                className={`flex items-start gap-2.5 p-2 rounded-lg border text-[10.5px] cursor-pointer transition-colors ${
                  gr.completed ? 'bg-indigo-50/50 border-indigo-150 text-indigo-950 font-medium' : 'bg-white border-gray-150 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={gr.completed}
                  onChange={() => handleRoutineToggle(gr.id)}
                  className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div className="flex-1">
                  <span className="font-bold border border-gray-250 text-[9px] px-1 rounded-md uppercase mr-1.5 text-gray-500">
                    {gr.category}
                  </span>
                  {gr.name}
                </div>
              </label>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
