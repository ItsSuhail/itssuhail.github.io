# Arithma — JEE Arithmetic & Precision Practice

Arithma is a premium, high-fidelity single-page web application designed for JEE (Joint Entrance Examination) aspirants. It aims to sharpen calculation speeds and improve precision when solving messy physics and chemistry equations.


## ✨ Features

- **Dual Practice Modes**:
  1. **🔬 Formula Drill**: Sweeps through a database of **127 Physics & Chemistry formulas** (Kinematics, Thermodynamics, Solid State, Kinetics, Electrochemistry, Bohr models, etc.). It displays the formula and all independent variables, prompting you to compute the target quantity.
  2. **🔢 Arithmetic Drill**: Generates random algebraic expressions using an AST tree (multiplications, divisions, square/cube roots, fraction constants). It mimics textbook physics calculations (e.g. evaluating $(6.67 \times 10^{-11} \times 5.97 \times 10^{24}) / (6.4 \times 10^6)^2$).
- **Ugly Number Generator**: Generates numbers with 3 significant figures and varying exponents, making it representative of real JEE numerical value questions.
- **Difficulty Scaling (Levels 1–5)**:
  - Level 1: Simple integers and operations.
  - Level 5: Highly nested operations, multi-step roots, and extreme exponents.
- **Complexity-Weighted Randomizer**: Formulas with multiplication, division, and powers are mathematically weighted to appear far more frequently than simple addition/subtraction formulas.
- **Scientific Notation Inputs**: Restricts inputs to mantissa ($x$) and exponent ($y$) fields, eliminating syntax typos or free-text parser errors. Shows a live output preview as you type.
- **JEE Approximations Switch**: Switch between precise physical constants (e.g., $g = 9.8$ m/s², $R = 8.314$ J/(mol·K)) and friendly JEE approximations ($g = 10$, $R = 8.3$, $N_A = 6 \times 10^{23}$).
- **Performance Analytics Dashboard**: Track your current score, streak multiplier bonuses, best streak, average response times, and precision statistics. Saves your history locally in the browser (`localStorage`).
- **Gamified Feedback System**: Celebrates exact precision answers with confetti. Provides error-margin tiers:
  - 🎯 **Exact** (under $0.5\%$ error)
  - ✅ **Precise** (under $2.0\%$ error)
  - 🟡 **Close** (under $5.0\%$ error)
  - ❌ **Miss** (streak break)

---

## 🛠️ Tech Stack & Libraries

No builders, package managers, or frameworks are required. The codebase uses plain static files:
1. **Core**: HTML5, Vanilla ES6 JavaScript, and Vanilla CSS (Glassmorphism design, glowing animations, responsive design).
2. **CDN Integrations**:
   - **KaTeX** (Fast LaTeX equation rendering)
   - **Lucide Icons** (Clean utility UI icons)
   - **canvas-confetti** (Celebrations)

---

## 📂 File Directory

```
Arithma/
├── index.html           # App Shell and structures
├── style.css            # Glassmorphism design system & animations
├── formulas.js          # 127 Physics/Chemistry formula models and picker
├── arithmetic.js        # AST expression generator and parser
├── app.js               # Game loop controller, event listeners, and timers
└── README.md            # Documentation
```

---

## 🧪 Local Testing

You can run verification tests locally using Node.js to verify mathematical stability:
```bash
node test_calculations.mjs
```
This runs 12,700 formula iterations and 5,000 arithmetic drills, checking for any possible `NaN`, `Infinity`, or division-by-zero outputs.
