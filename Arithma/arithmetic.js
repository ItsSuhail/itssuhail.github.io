// arithmetic.js - Expression Tree Generator for Arithma Arithmetic Drill Mode

const SPECIAL_NUMS = [
  { value: 3.14159, latex: '\\pi', display: '3.14' },
  { value: 2.71828, latex: 'e', display: '2.72' },
  { value: 1.6e-19, latex: 'q_e', display: '1.6 \\times 10^{-19}' }, // elementary charge
  { value: 9.11e-31, latex: 'm_e', display: '9.11 \\times 10^{-31}' }, // mass of electron
  { value: 1.67e-27, latex: 'm_p', display: '1.67 \\times 10^{-27}' }, // mass of proton
  { value: 6.63e-34, latex: 'h', display: '6.63 \\times 10^{-34}' }, // Planck's constant
  { value: 6.02e23, latex: 'N_A', display: '6.02 \\times 10^{23}' }, // Avogadro
  { value: 8.314, latex: 'R', display: '8.314' }, // gas constant
  { value: 6.67e-11, latex: 'G', display: '6.67 \\times 10^{-11}' }, // Gravitational constant
  { value: 9e9, latex: 'k_e', display: '9 \\times 10^9' }, // electrostatic constant
  { value: 0.5, latex: '\\frac{1}{2}', display: '\\frac{1}{2}' },
  { value: 0.3333333333333333, latex: '\\frac{1}{3}', display: '\\frac{1}{3}' },
  { value: 0.6666666666666666, latex: '\\frac{2}{3}', display: '\\frac{2}{3}' },
  { value: 0.25, latex: '\\frac{1}{4}', display: '\\frac{1}{4}' },
  { value: 0.75, latex: '\\frac{3}{4}', display: '\\frac{3}{4}' },
  { value: 0.8333333333333334, latex: '\\frac{5}{6}', display: '\\frac{5}{6}' },
  { value: 1.5, latex: '\\frac{3}{2}', display: '\\frac{3}{2}' },
  { value: 2.5, latex: '\\frac{5}{2}', display: '\\frac{5}{2}' }
];

// Leaf number node generator
function makeNumNode(allowSciNotation = true) {
  // 30% chance of picking a special constant or fraction
  if (Math.random() < 0.3) {
    const spec = SPECIAL_NUMS[Math.floor(Math.random() * SPECIAL_NUMS.length)];
    return {
      type: 'Num',
      value: spec.value,
      latex: spec.latex,
      display: spec.display
    };
  }

  // General random number
  const mantissa = parseFloat((Math.random() * 8.9 + 1.0).toFixed(2)); // 1.00 to 9.90
  const exponent = allowSciNotation ? Math.floor(Math.random() * 25) - 12 : 0; // -12 to +12
  
  const value = mantissa * Math.pow(10, exponent);
  let latexStr;
  if (exponent === 0) {
    latexStr = mantissa.toString();
  } else {
    latexStr = `${mantissa} \\times 10^{${exponent}}`;
  }

  return {
    type: 'Num',
    value: value,
    latex: latexStr,
    display: latexStr
  };
}

// AST Tree builder based on difficulty level
function buildAST(difficulty) {
  switch (difficulty) {
    case 1:
      // Simple product/division: 2 or 3 numbers with no exponents
      // shape: A * B * C or (A * B) / C
      const d1_useDiv = Math.random() < 0.5;
      const n1 = makeNumNode(false);
      const n2 = makeNumNode(false);
      const n3 = makeNumNode(false);
      
      if (d1_useDiv) {
        return {
          type: 'Div',
          left: { type: 'Mul', left: n1, right: n2 },
          right: n3
        };
      } else {
        return {
          type: 'Mul',
          left: n1,
          right: { type: 'Mul', left: n2, right: n3 }
        };
      }

    case 2:
      // Scientific notation mix: 3-4 numbers, *, / with exponents
      // shape: (A * B) / C or A * B * C
      const d2_useDiv = Math.random() < 0.6;
      const n2_1 = makeNumNode(true);
      const n2_2 = makeNumNode(true);
      const n2_3 = makeNumNode(true);
      
      if (d2_useDiv) {
        return {
          type: 'Div',
          left: { type: 'Mul', left: n2_1, right: n2_2 },
          right: n2_3
        };
      } else {
        return {
          type: 'Mul',
          left: n2_1,
          right: { type: 'Mul', left: n2_2, right: n2_3 }
        };
      }

    case 3:
      // Single root wrapping multiplication/division
      // shape: sqrt(A * B / C) or cbrt(A * B * C)
      const d3_useCbrt = Math.random() < 0.4;
      const n3_1 = makeNumNode(true);
      const n3_2 = makeNumNode(true);
      const n3_3 = makeNumNode(true);
      
      const inner3 = {
        type: 'Div',
        left: { type: 'Mul', left: n3_1, right: n3_2 },
        right: n3_3
      };

      return {
        type: d3_useCbrt ? 'Cbrt' : 'Sqrt',
        inner: inner3
      };

    case 4:
      // Complex roots and exponents: e.g., (A * B / C)^(1/3) or A * sqrt(B / C)
      const d4_type = Math.random() < 0.5;
      const n4_1 = makeNumNode(true);
      const n4_2 = makeNumNode(true);
      const n4_3 = makeNumNode(true);

      if (d4_type) {
        // (A * B / C)^(1/3)
        return {
          type: 'PowThird',
          inner: {
            type: 'Div',
            left: { type: 'Mul', left: n4_1, right: n4_2 },
            right: n4_3
          }
        };
      } else {
        // A * sqrt(B / C)
        return {
          type: 'Mul',
          left: n4_1,
          right: {
            type: 'Sqrt',
            inner: {
              type: 'Div',
              left: n4_2,
              right: n4_3
            }
          }
        };
      }

    case 5:
      // Nested / Compound: e.g. A * (B * C / D)^(1/3) * sqrt(E / F)
      const n5_1 = makeNumNode(true);
      const n5_2 = makeNumNode(true);
      const n5_3 = makeNumNode(true);
      const n5_4 = makeNumNode(true);
      const n5_5 = makeNumNode(true);
      const n5_6 = makeNumNode(true);

      const part1 = {
        type: 'PowThird',
        inner: {
          type: 'Div',
          left: { type: 'Mul', left: n5_2, right: n5_3 },
          right: n5_4
        }
      };

      const part2 = {
        type: 'Sqrt',
        inner: {
          type: 'Div',
          left: n5_5,
          right: n5_6
        }
      };

      return {
        type: 'Mul',
        left: n5_1,
        right: {
          type: 'Mul',
          left: part1,
          right: part2
        }
      };

    default:
      return makeNumNode(false);
  }
}

// Evaluate AST value
function evaluateAST(node) {
  switch (node.type) {
    case 'Num':
      return node.value;
    case 'Mul':
      return evaluateAST(node.left) * evaluateAST(node.right);
    case 'Div':
      const denominator = evaluateAST(node.right);
      if (Math.abs(denominator) < 1e-25) {
        throw new Error('Zero denominator');
      }
      return evaluateAST(node.left) / denominator;
    case 'Sqrt':
      const valSqrt = evaluateAST(node.inner);
      if (valSqrt < 0) {
        throw new Error('Negative square root');
      }
      return Math.sqrt(valSqrt);
    case 'Cbrt':
      return Math.cbrt(evaluateAST(node.inner));
    case 'Pow2':
      return Math.pow(evaluateAST(node.inner), 2);
    case 'Pow3':
      return Math.pow(evaluateAST(node.inner), 3);
    case 'PowHalf':
      const valPowHalf = evaluateAST(node.inner);
      if (valPowHalf < 0) {
        throw new Error('Negative power base');
      }
      return Math.sqrt(valPowHalf);
    case 'PowThird':
      return Math.cbrt(evaluateAST(node.inner));
    default:
      return 0;
  }
}

// Convert AST to LaTeX
function astToLatex(node) {
  switch (node.type) {
    case 'Num':
      return node.latex;
    case 'Mul':
      // Wrap children in parentheses if they are multiplications to be clear, or just dot
      return `${astToLatex(node.left)} \\cdot ${astToLatex(node.right)}`;
    case 'Div':
      return `\\frac{${astToLatex(node.left)}}{${astToLatex(node.right)}}`;
    case 'Sqrt':
      return `\\sqrt{${astToLatex(node.inner)}}`;
    case 'Cbrt':
      return `\\sqrt[3]{${astToLatex(node.inner)}}`;
    case 'Pow2':
      return `\\left(${astToLatex(node.inner)}\\right)^{2}`;
    case 'Pow3':
      return `\\left(${astToLatex(node.inner)}\\right)^{3}`;
    case 'PowHalf':
      return `\\left(${astToLatex(node.inner)}\\right)^{1/2}`;
    case 'PowThird':
      return `\\left(${astToLatex(node.inner)}\\right)^{1/3}`;
    default:
      return '';
  }
}

// Generate valid random arithmetic problem
export function generateArithmeticProblem(difficulty) {
  let attempts = 0;
  const maxAttempts = 15;

  while (attempts < maxAttempts) {
    try {
      const tree = buildAST(difficulty);
      const val = evaluateAST(tree);

      // Validate that value is a finite number, not extremely close to zero or infinity
      const absVal = Math.abs(val);
      if (
        Number.isFinite(val) &&
        !Number.isNaN(val) &&
        (absVal === 0 || (absVal >= 1e-25 && absVal <= 1e25))
      ) {
        const latex = astToLatex(tree);
        return {
          latex: latex,
          answer: val,
          difficulty: difficulty
        };
      }
    } catch (e) {
      // Catch maths errors (div by zero, root of neg, etc) and retry
    }
    attempts++;
  }

  // Fallback to a very safe multiplication in case of consecutive failures
  const fallbackNum1 = makeNumNode(false);
  const fallbackNum2 = makeNumNode(false);
  return {
    latex: `${fallbackNum1.latex} \\cdot ${fallbackNum2.latex}`,
    answer: fallbackNum1.value * fallbackNum2.value,
    difficulty: difficulty
  };
}
