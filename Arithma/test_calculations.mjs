// test_calculations.mjs - Verification script for Arithma
import { FORMULAS, generateProblem, getWeightedFormula } from './formulas.js';
import { generateArithmeticProblem } from './arithmetic.js';

console.log('--- STARTING ARITHMA VERIFICATION TESTS ---');

let failures = 0;

// Test 1: Test all 113 formulas for division by zero, NaN, or non-finite results
console.log('\nRunning Test 1: Formula Database Sweep...');
let formulaSuccessCount = 0;
FORMULAS.forEach((formula) => {
  // Test both JEE Mode and SI Mode
  [true, false].forEach((jeeMode) => {
    // Generate each 100 times to get random coverage
    for (let i = 0; i < 100; i++) {
      try {
        const problem = generateProblem(formula, jeeMode);
        const ans = problem.answer;
        
        if (!Number.isFinite(ans) || Number.isNaN(ans)) {
          console.error(`FAIL: Formula "${formula.name}" (ID: ${formula.id}, JEE: ${jeeMode}) returned invalid answer: ${ans} at iteration ${i}`);
          failures++;
          return;
        }
      } catch (err) {
        console.error(`FAIL: Formula "${formula.name}" (ID: ${formula.id}) threw error:`, err);
        failures++;
        return;
      }
    }
  });
  formulaSuccessCount++;
});
console.log(`Sweep completed. Tested ${FORMULAS.length} formulas (100 runs each). Successful sweeps: ${formulaSuccessCount}/${FORMULAS.length}`);

// Test 2: Test Arithmetic AST Tree Generation (5000 runs)
console.log('\nRunning Test 2: Arithmetic AST Generator Check...');
let arithmeticSuccessCount = 0;
for (let diff = 1; diff <= 5; diff++) {
  let diffSuccessCount = 0;
  for (let i = 0; i < 1000; i++) {
    try {
      const problem = generateArithmeticProblem(diff);
      const ans = problem.answer;
      
      if (!Number.isFinite(ans) || Number.isNaN(ans)) {
        console.error(`FAIL: Arithmetic Drill Level ${diff} returned invalid answer: ${ans} at run ${i}`);
        failures++;
        continue;
      }
      if (!problem.latex || problem.latex.trim() === '') {
        console.error(`FAIL: Arithmetic Drill Level ${diff} generated empty LaTeX string at run ${i}`);
        failures++;
        continue;
      }
      diffSuccessCount++;
    } catch (err) {
      console.error(`FAIL: Arithmetic Drill Level ${diff} threw error at run ${i}:`, err);
      failures++;
    }
  }
  arithmeticSuccessCount += diffSuccessCount;
  console.log(`  - Difficulty ${diff}: Generated ${diffSuccessCount}/1000 successfully.`);
}
console.log(`Arithmetic tests completed. Total successful generations: ${arithmeticSuccessCount}/5000`);

// Test 3: Verify Weighted Picks Distribution (10,000 runs)
console.log('\nRunning Test 3: Formula Selection Weight Check...');
const frequencies = {};
for (let i = 0; i < 10000; i++) {
  const formula = getWeightedFormula();
  frequencies[formula.difficulty] = (frequencies[formula.difficulty] || 0) + 1;
}
console.log('Difficulty frequencies in 10,000 picks:');
let totalHighDifficulty = 0;
for (let diff = 1; diff <= 5; diff++) {
  const count = frequencies[diff] || 0;
  const pct = ((count / 10000) * 100).toFixed(1);
  console.log(`  - Level ${diff} (Weight ${diff * diff}): Count = ${count} (${pct}%)`);
  if (diff >= 4) {
    totalHighDifficulty += count;
  }
}
const highDiffPct = ((totalHighDifficulty / 10000) * 100).toFixed(1);
console.log(`Total high-difficulty (Levels 4-5) representation: ${highDiffPct}% (Target: ~70%)`);

console.log('\n--- VERIFICATION SUMMARY ---');
if (failures === 0) {
  console.log('STATUS: ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
  process.exit(0);
} else {
  console.error(`STATUS: VERIFICATION ENCOUNTERED ${failures} FAILURES.`);
  process.exit(1);
}
