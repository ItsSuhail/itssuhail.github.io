// formulas.js - Arithma Formula Database and Problem Generator

export const CONSTANTS = {
  R:     { si: 8.314,         jee: 8.314     }, // J/(mol*K)
  g:     { si: 9.8,           jee: 10.0      }, // m/s^2
  G:     { si: 6.674e-11,     jee: 6.67e-11  }, // N*m^2/kg^2
  h:     { si: 6.626e-34,     jee: 6.6e-34   }, // J*s
  c:     { si: 2.998e8,       jee: 3e8       }, // m/s
  Na:    { si: 6.022e23,      jee: 6e23      }, // mol^-1
  k:     { si: 8.988e9,       jee: 9e9       }, // N*m^2/C^2 (Electrostatic constant 1/(4*pi*eps0))
  eps0:  { si: 8.854e-12,     jee: 8.85e-12  }, // F/m
  mu0:   { si: 1.2566e-6,     jee: 1.257e-6  }, // T*m/A (4*pi * 10^-7)
  F:     { si: 96485,         jee: 96500     }, // C/mol
  RH:    { si: 1.097e7,       jee: 1.1e7     }, // m^-1 (Rydberg)
  sigma: { si: 5.67e-8,       jee: 5.67e-8   }, // W/(m^2*K^4)
  a0:    { si: 5.29e-11,      jee: 0.529e-10 }, // m (Bohr radius)
};

export const FORMULAS = [
  // ==========================================
  // PHYSICS
  // ==========================================

  // --- KINEMATICS ---
  {
    id: 'kin_1',
    name: 'First Equation of Motion',
    topic: 'Kinematics',
    subject: 'Physics',
    latex: 'v = u + at',
    difficulty: 1,
    unit: 'm/s',
    targetSymbol: 'v',
    variables: [
      { symbol: 'u', name: 'Initial Velocity', unit: 'm/s', range: [0, 50], decimals: 1 },
      { symbol: 'a', name: 'Acceleration', unit: 'm/s²', range: [0.5, 10], decimals: 1 },
      { symbol: 't', name: 'Time', unit: 's', range: [1, 20], decimals: 1 }
    ],
    calculate: (v) => v.u + v.a * v.t
  },
  {
    id: 'kin_2',
    name: 'Second Equation of Motion',
    topic: 'Kinematics',
    subject: 'Physics',
    latex: 's = ut + \\frac{1}{2}at^2',
    difficulty: 2,
    unit: 'm',
    targetSymbol: 's',
    variables: [
      { symbol: 'u', name: 'Initial Velocity', unit: 'm/s', range: [0, 40], decimals: 1 },
      { symbol: 'a', name: 'Acceleration', unit: 'm/s²', range: [1, 8], decimals: 1 },
      { symbol: 't', name: 'Time', unit: 's', range: [1, 15], decimals: 1 }
    ],
    calculate: (v) => v.u * v.t + 0.5 * v.a * v.t * v.t
  },
  {
    id: 'kin_3',
    name: 'Third Equation of Motion',
    topic: 'Kinematics',
    subject: 'Physics',
    latex: 'v = \\sqrt{u^2 + 2as}',
    difficulty: 2,
    unit: 'm/s',
    targetSymbol: 'v',
    variables: [
      { symbol: 'u', name: 'Initial Velocity', unit: 'm/s', range: [0, 30], decimals: 1 },
      { symbol: 'a', name: 'Acceleration', unit: 'm/s²', range: [1, 10], decimals: 1 },
      { symbol: 's', name: 'Displacement', unit: 'm', range: [5, 100], decimals: 1 }
    ],
    calculate: (v) => Math.sqrt(v.u * v.u + 2 * v.a * v.s)
  },
  {
    id: 'kin_4',
    name: 'Projectile Range',
    topic: 'Kinematics',
    subject: 'Physics',
    latex: 'R = \\frac{u^2 \\sin(2\\theta)}{g}',
    difficulty: 3,
    unit: 'm',
    targetSymbol: 'R',
    variables: [
      { symbol: 'u', name: 'Velocity of Projection', unit: 'm/s', range: [10, 100], decimals: 1 },
      { symbol: 'theta', name: 'Angle of Projection', unit: 'degrees', range: [15, 75], decimals: 1, toSI: (val) => (val * Math.PI) / 180 },
      { symbol: 'g', name: 'Acceleration due to Gravity', isConstant: true }
    ],
    calculate: (v) => (v.u * v.u * Math.sin(2 * v.theta)) / v.g
  },
  {
    id: 'kin_5',
    name: 'Time of Flight',
    topic: 'Kinematics',
    subject: 'Physics',
    latex: 'T = \\frac{2u \\sin\\theta}{g}',
    difficulty: 2,
    unit: 's',
    targetSymbol: 'T',
    variables: [
      { symbol: 'u', name: 'Velocity of Projection', unit: 'm/s', range: [10, 100], decimals: 1 },
      { symbol: 'theta', name: 'Angle of Projection', unit: 'degrees', range: [15, 75], decimals: 1, toSI: (val) => (val * Math.PI) / 180 },
      { symbol: 'g', name: 'Acceleration due to Gravity', isConstant: true }
    ],
    calculate: (v) => (2 * v.u * Math.sin(v.theta)) / v.g
  },
  {
    id: 'kin_6',
    name: 'Maximum Height of Projectile',
    topic: 'Kinematics',
    subject: 'Physics',
    latex: 'H = \\frac{u^2 \\sin^2\\theta}{2g}',
    difficulty: 3,
    unit: 'm',
    targetSymbol: 'H',
    variables: [
      { symbol: 'u', name: 'Velocity of Projection', unit: 'm/s', range: [10, 100], decimals: 1 },
      { symbol: 'theta', name: 'Angle of Projection', unit: 'degrees', range: [15, 75], decimals: 1, toSI: (val) => (val * Math.PI) / 180 },
      { symbol: 'g', name: 'Acceleration due to Gravity', isConstant: true }
    ],
    calculate: (v) => {
      const s = Math.sin(v.theta);
      return (v.u * v.u * s * s) / (2 * v.g);
    }
  },
  {
    id: 'kin_7',
    name: 'Displacement in nth Second',
    topic: 'Kinematics',
    subject: 'Physics',
    latex: 's_n = u + \\frac{a}{2}(2n - 1)',
    difficulty: 2,
    unit: 'm',
    targetSymbol: 's_n',
    variables: [
      { symbol: 'u', name: 'Initial Velocity', unit: 'm/s', range: [0, 50], decimals: 1 },
      { symbol: 'a', name: 'Acceleration', unit: 'm/s²', range: [0.5, 10], decimals: 1 },
      { symbol: 'n', name: 'Second Number', unit: '', range: [1, 20], integer: true }
    ],
    calculate: (v) => v.u + (v.a / 2) * (2 * v.n - 1)
  },

  // --- DYNAMICS & GRAVITATION ---
  {
    id: 'dyn_1',
    name: "Newton's Second Law",
    topic: 'Dynamics',
    subject: 'Physics',
    latex: 'F = ma',
    difficulty: 1,
    unit: 'N',
    targetSymbol: 'F',
    variables: [
      { symbol: 'm', name: 'Mass', unit: 'kg', range: [0.1, 200], decimals: 2 },
      { symbol: 'a', name: 'Acceleration', unit: 'm/s²', range: [0.1, 20], decimals: 2 }
    ],
    calculate: (v) => v.m * v.a
  },
  {
    id: 'dyn_2',
    name: 'Work Done',
    topic: 'Dynamics',
    subject: 'Physics',
    latex: 'W = F d \\cos\\theta',
    difficulty: 2,
    unit: 'J',
    targetSymbol: 'W',
    variables: [
      { symbol: 'F', name: 'Force', unit: 'N', range: [1, 500], decimals: 1 },
      { symbol: 'd', name: 'Displacement', unit: 'm', range: [0.5, 50], decimals: 1 },
      { symbol: 'theta', name: 'Angle', unit: 'degrees', range: [0, 90], decimals: 1, toSI: (val) => (val * Math.PI) / 180 }
    ],
    calculate: (v) => v.F * v.d * Math.cos(v.theta)
  },
  {
    id: 'dyn_3',
    name: 'Kinetic Energy',
    topic: 'Dynamics',
    subject: 'Physics',
    latex: 'K.E. = \\frac{1}{2}mv^2',
    difficulty: 2,
    unit: 'J',
    targetSymbol: 'K.E.',
    variables: [
      { symbol: 'm', name: 'Mass', unit: 'kg', range: [0.01, 100], decimals: 2 },
      { symbol: 'v', name: 'Velocity', unit: 'm/s', range: [0.5, 50], decimals: 2 }
    ],
    calculate: (v) => 0.5 * v.m * v.v * v.v
  },
  {
    id: 'dyn_4',
    name: 'Gravitational Potential Energy',
    topic: 'Dynamics',
    subject: 'Physics',
    latex: 'P.E. = mgh',
    difficulty: 1,
    unit: 'J',
    targetSymbol: 'P.E.',
    variables: [
      { symbol: 'm', name: 'Mass', unit: 'kg', range: [0.1, 1000], decimals: 1 },
      { symbol: 'g', name: 'Gravity', isConstant: true },
      { symbol: 'h', name: 'Height', unit: 'm', range: [1, 500], decimals: 1 }
    ],
    calculate: (v) => v.m * v.g * v.h
  },
  {
    id: 'dyn_5',
    name: 'Spring Potential Energy',
    topic: 'Dynamics',
    subject: 'Physics',
    latex: 'U = \\frac{1}{2}kx^2',
    difficulty: 2,
    unit: 'J',
    targetSymbol: 'U',
    variables: [
      { symbol: 'k', name: 'Spring Constant', unit: 'N/m', range: [10, 1000], decimals: 1 },
      { symbol: 'x', name: 'Compression/Elongation', unit: 'cm', range: [1, 50], decimals: 1, toSI: (val) => val / 100 }
    ],
    calculate: (v) => 0.5 * v.k * v.x * v.x
  },
  {
    id: 'dyn_6',
    name: 'Power in Motion',
    topic: 'Dynamics',
    subject: 'Physics',
    latex: 'P = F v \\cos\\theta',
    difficulty: 2,
    unit: 'W',
    targetSymbol: 'P',
    variables: [
      { symbol: 'F', name: 'Force', unit: 'N', range: [1, 1000], decimals: 1 },
      { symbol: 'v', name: 'Velocity', unit: 'm/s', range: [0.5, 40], decimals: 2 },
      { symbol: 'theta', name: 'Angle between Force & Velocity', unit: 'degrees', range: [0, 60], decimals: 1, toSI: (val) => (val * Math.PI) / 180 }
    ],
    calculate: (v) => v.F * v.v * Math.cos(v.theta)
  },
  {
    id: 'dyn_7',
    name: 'Centripetal Force',
    topic: 'Dynamics',
    subject: 'Physics',
    latex: 'F_c = \\frac{mv^2}{r}',
    difficulty: 3,
    unit: 'N',
    targetSymbol: 'F_c',
    variables: [
      { symbol: 'm', name: 'Mass', unit: 'kg', range: [0.01, 50], decimals: 2 },
      { symbol: 'v', name: 'Velocity', unit: 'm/s', range: [1, 60], decimals: 1 },
      { symbol: 'r', name: 'Radius', unit: 'm', range: [0.1, 10], decimals: 2 }
    ],
    calculate: (v) => (v.m * v.v * v.v) / v.r
  },
  {
    id: 'dyn_8',
    name: "Newton's Law of Gravitation",
    topic: 'Gravitation',
    subject: 'Physics',
    latex: 'F = \\frac{G m_1 m_2}{r^2}',
    difficulty: 3,
    unit: 'N',
    targetSymbol: 'F',
    variables: [
      { symbol: 'G', name: 'Gravitational Constant', isConstant: true },
      { symbol: 'm1', name: 'Mass of Body 1', unit: 'kg', range: [1e5, 1e12], decimals: 0, scientific: true },
      { symbol: 'm2', name: 'Mass of Body 2', unit: 'kg', range: [1e5, 1e12], decimals: 0, scientific: true },
      { symbol: 'r', name: 'Distance', unit: 'km', range: [100, 5000], decimals: 0, toSI: (val) => val * 1000 }
    ],
    calculate: (v) => (v.G * v.m1 * v.m2) / (v.r * v.r)
  },
  {
    id: 'dyn_9',
    name: 'Escape Velocity',
    topic: 'Gravitation',
    subject: 'Physics',
    latex: 'v_e = \\sqrt{\\frac{2GM}{R}}',
    difficulty: 3,
    unit: 'm/s',
    targetSymbol: 'v_e',
    variables: [
      { symbol: 'G', name: 'Gravitational Constant', isConstant: true },
      { symbol: 'M', name: 'Mass of Planet', unit: 'kg', range: [1e22, 1e26], decimals: 0, scientific: true },
      { symbol: 'R', name: 'Radius of Planet', unit: 'km', range: [1000, 50000], decimals: 0, toSI: (val) => val * 1000 }
    ],
    calculate: (v) => Math.sqrt((2 * v.G * v.M) / v.R)
  },
  {
    id: 'dyn_10',
    name: 'Orbital Velocity',
    topic: 'Gravitation',
    subject: 'Physics',
    latex: 'v_o = \\sqrt{\\frac{GM}{R}}',
    difficulty: 3,
    unit: 'm/s',
    targetSymbol: 'v_o',
    variables: [
      { symbol: 'G', name: 'Gravitational Constant', isConstant: true },
      { symbol: 'M', name: 'Mass of Planet', unit: 'kg', range: [1e22, 1e26], decimals: 0, scientific: true },
      { symbol: 'R', name: 'Radius of Orbit', unit: 'km', range: [1200, 60000], decimals: 0, toSI: (val) => val * 1000 }
    ],
    calculate: (v) => Math.sqrt((v.G * v.M) / v.R)
  },

  // --- ROTATIONAL MOTION ---
  {
    id: 'rot_1',
    name: 'Torque',
    topic: 'Rotational Motion',
    subject: 'Physics',
    latex: '\\tau = r F \\sin\\theta',
    difficulty: 2,
    unit: 'N*m',
    targetSymbol: 'tau',
    variables: [
      { symbol: 'r', name: 'Position Vector Magnitude', unit: 'm', range: [0.1, 5], decimals: 2 },
      { symbol: 'F', name: 'Force', unit: 'N', range: [1, 200], decimals: 1 },
      { symbol: 'theta', name: 'Angle', unit: 'degrees', range: [10, 90], decimals: 1, toSI: (val) => (val * Math.PI) / 180 }
    ],
    calculate: (v) => v.r * v.F * Math.sin(v.theta)
  },
  {
    id: 'rot_2',
    name: 'Moment of Inertia (Ring)',
    topic: 'Rotational Motion',
    subject: 'Physics',
    latex: 'I = M R^2',
    difficulty: 2,
    unit: 'kg*m²',
    targetSymbol: 'I',
    variables: [
      { symbol: 'M', name: 'Mass of Ring', unit: 'kg', range: [0.1, 50], decimals: 2 },
      { symbol: 'R', name: 'Radius of Ring', unit: 'cm', range: [5, 200], decimals: 1, toSI: (val) => val / 100 }
    ],
    calculate: (v) => v.M * v.R * v.R
  },
  {
    id: 'rot_3',
    name: 'Moment of Inertia (Solid Disc)',
    topic: 'Rotational Motion',
    subject: 'Physics',
    latex: 'I = \\frac{1}{2} M R^2',
    difficulty: 2,
    unit: 'kg*m²',
    targetSymbol: 'I',
    variables: [
      { symbol: 'M', name: 'Mass of Disc', unit: 'kg', range: [0.1, 50], decimals: 2 },
      { symbol: 'R', name: 'Radius of Disc', unit: 'cm', range: [5, 200], decimals: 1, toSI: (val) => val / 100 }
    ],
    calculate: (v) => 0.5 * v.M * v.R * v.R
  },
  {
    id: 'rot_4',
    name: 'Moment of Inertia (Solid Sphere)',
    topic: 'Rotational Motion',
    subject: 'Physics',
    latex: 'I = \\frac{2}{5} M R^2',
    difficulty: 2,
    unit: 'kg*m²',
    targetSymbol: 'I',
    variables: [
      { symbol: 'M', name: 'Mass of Sphere', unit: 'kg', range: [0.1, 50], decimals: 2 },
      { symbol: 'R', name: 'Radius of Sphere', unit: 'cm', range: [5, 200], decimals: 1, toSI: (val) => val / 100 }
    ],
    calculate: (v) => 0.4 * v.M * v.R * v.R
  },
  {
    id: 'rot_5',
    name: 'Rotational Kinetic Energy',
    topic: 'Rotational Motion',
    subject: 'Physics',
    latex: 'K.E._{rot} = \\frac{1}{2} I \\omega^2',
    difficulty: 3,
    unit: 'J',
    targetSymbol: 'K.E._{rot}',
    variables: [
      { symbol: 'I', name: 'Moment of Inertia', unit: 'kg*m²', range: [0.01, 10], decimals: 3 },
      { symbol: 'omega', name: 'Angular Velocity', unit: 'rad/s', range: [0.5, 100], decimals: 1 }
    ],
    calculate: (v) => 0.5 * v.I * v.omega * v.omega
  },
  {
    id: 'rot_6',
    name: 'Angular Momentum',
    topic: 'Rotational Motion',
    subject: 'Physics',
    latex: 'L = I \\omega',
    difficulty: 2,
    unit: 'kg*m²/s',
    targetSymbol: 'L',
    variables: [
      { symbol: 'I', name: 'Moment of Inertia', unit: 'kg*m²', range: [0.01, 10], decimals: 3 },
      { symbol: 'omega', name: 'Angular Velocity', unit: 'rad/s', range: [0.5, 100], decimals: 1 }
    ],
    calculate: (v) => v.I * v.omega
  },

  // --- WAVES & SHM ---
  {
    id: 'wav_1',
    name: 'Wave Speed',
    topic: 'Waves',
    subject: 'Physics',
    latex: 'v = f \\lambda',
    difficulty: 2,
    unit: 'm/s',
    targetSymbol: 'v',
    variables: [
      { symbol: 'f', name: 'Frequency', unit: 'Hz', range: [20, 20000], decimals: 0 },
      { symbol: 'lambda', name: 'Wavelength', unit: 'mm', range: [0.1, 1000], decimals: 1, toSI: (val) => val / 1000 }
    ],
    calculate: (v) => v.f * v.lambda
  },
  {
    id: 'wav_2',
    name: 'SHM Time Period (Spring)',
    topic: 'SHM',
    subject: 'Physics',
    latex: 'T = 2\\pi\\sqrt{\\frac{m}{k}}',
    difficulty: 3,
    unit: 's',
    targetSymbol: 'T',
    variables: [
      { symbol: 'm', name: 'Mass of Block', unit: 'kg', range: [0.05, 10], decimals: 2 },
      { symbol: 'k', name: 'Spring Constant', unit: 'N/m', range: [5, 500], decimals: 1 }
    ],
    calculate: (v) => 2 * Math.PI * Math.sqrt(v.m / v.k)
  },
  {
    id: 'wav_3',
    name: 'SHM Time Period (Simple Pendulum)',
    topic: 'SHM',
    subject: 'Physics',
    latex: 'T = 2\\pi\\sqrt{\\frac{L}{g}}',
    difficulty: 3,
    unit: 's',
    targetSymbol: 'T',
    variables: [
      { symbol: 'L', name: 'Length of Pendulum', unit: 'm', range: [0.1, 10], decimals: 2 },
      { symbol: 'g', name: 'Gravity', isConstant: true }
    ],
    calculate: (v) => 2 * Math.PI * Math.sqrt(v.L / v.g)
  },
  {
    id: 'wav_4',
    name: 'Doppler Effect (Approaching)',
    topic: 'Waves & Sound',
    subject: 'Physics',
    latex: "f' = f \\left(\\frac{v}{v - v_s}\\right)",
    difficulty: 3,
    unit: 'Hz',
    targetSymbol: "f'",
    variables: [
      { symbol: 'f', name: 'Source Frequency', unit: 'Hz', range: [100, 1000], decimals: 0 },
      { symbol: 'v', name: 'Speed of Sound', unit: 'm/s', range: [320, 350], decimals: 1 },
      { symbol: 'vs', name: 'Speed of Source', unit: 'm/s', range: [5, 80], decimals: 1 }
    ],
    calculate: (v) => v.f * (v.v / (v.v - v.vs))
  },
  {
    id: 'wav_5',
    name: 'Doppler Effect (Receding)',
    topic: 'Waves & Sound',
    subject: 'Physics',
    latex: "f' = f \\left(\\frac{v}{v + v_s}\\right)",
    difficulty: 3,
    unit: 'Hz',
    targetSymbol: "f'",
    variables: [
      { symbol: 'f', name: 'Source Frequency', unit: 'Hz', range: [100, 1000], decimals: 0 },
      { symbol: 'v', name: 'Speed of Sound', unit: 'm/s', range: [320, 350], decimals: 1 },
      { symbol: 'vs', name: 'Speed of Source', unit: 'm/s', range: [5, 80], decimals: 1 }
    ],
    calculate: (v) => v.f * (v.v / (v.v + v.vs))
  },
  {
    id: 'wav_6',
    name: 'Total Energy in SHM',
    topic: 'SHM',
    subject: 'Physics',
    latex: 'E = \\frac{1}{2} k A^2',
    difficulty: 2,
    unit: 'J',
    targetSymbol: 'E',
    variables: [
      { symbol: 'k', name: 'Force Constant', unit: 'N/m', range: [1, 1000], decimals: 1 },
      { symbol: 'A', name: 'Amplitude', unit: 'cm', range: [0.5, 50], decimals: 1, toSI: (val) => val / 100 }
    ],
    calculate: (v) => 0.5 * v.k * v.A * v.A
  },
  {
    id: 'wav_7',
    name: 'Open Pipe Harmonics',
    topic: 'Waves & Sound',
    subject: 'Physics',
    latex: 'f_n = \\frac{nv}{2L}',
    difficulty: 3,
    unit: 'Hz',
    targetSymbol: 'f_n',
    variables: [
      { symbol: 'n', name: 'Harmonic Number', unit: '', range: [1, 5], integer: true },
      { symbol: 'v', name: 'Velocity of Sound', unit: 'm/s', range: [320, 355], decimals: 1 },
      { symbol: 'L', name: 'Length of Pipe', unit: 'cm', range: [10, 150], decimals: 1, toSI: (val) => val / 100 }
    ],
    calculate: (v) => (v.n * v.v) / (2 * v.L)
  },
  {
    id: 'wav_8',
    name: 'Closed Pipe Harmonics',
    topic: 'Waves & Sound',
    subject: 'Physics',
    latex: 'f_n = \\frac{(2n - 1)v}{4L}',
    difficulty: 3,
    unit: 'Hz',
    targetSymbol: 'f_n',
    variables: [
      { symbol: 'n', name: 'Nth Harmonic Index', unit: '', range: [1, 5], integer: true },
      { symbol: 'v', name: 'Velocity of Sound', unit: 'm/s', range: [320, 355], decimals: 1 },
      { symbol: 'L', name: 'Length of Pipe', unit: 'cm', range: [10, 150], decimals: 1, toSI: (val) => val / 100 }
    ],
    calculate: (v) => ((2 * v.n - 1) * v.v) / (4 * v.L)
  },
  {
    id: 'wav_9',
    name: 'Beat Frequency',
    topic: 'Waves & Sound',
    subject: 'Physics',
    latex: 'f_{beat} = |f_1 - f_2|',
    difficulty: 1,
    unit: 'Hz',
    targetSymbol: 'f_{beat}',
    variables: [
      { symbol: 'f1', name: 'Frequency 1', unit: 'Hz', range: [200, 1000], decimals: 1 },
      { symbol: 'f2', name: 'Frequency 2', unit: 'Hz', range: [200, 1000], decimals: 1 }
    ],
    calculate: (v) => Math.abs(v.f1 - v.f2)
  },

  // --- THERMODYNAMICS & KINETIC THEORY ---
  {
    id: 'thm_1',
    name: 'Ideal Gas Law (Volume)',
    topic: 'Thermodynamics',
    subject: 'Physics',
    latex: 'V = \\frac{nRT}{P}',
    difficulty: 2,
    unit: 'm³',
    targetSymbol: 'V',
    variables: [
      { symbol: 'n', name: 'Moles', unit: 'mol', range: [0.1, 10], decimals: 2 },
      { symbol: 'R', name: 'Gas Constant', isConstant: true },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [100, 800], decimals: 1 },
      { symbol: 'P', name: 'Pressure', unit: 'kPa', range: [50, 1000], decimals: 1, toSI: (val) => val * 1000 }
    ],
    calculate: (v) => (v.n * v.R * v.T) / v.P
  },
  {
    id: 'thm_2',
    name: 'RMS Speed of Gas Molecules',
    topic: 'Kinetic Theory',
    subject: 'Physics',
    latex: 'v_{rms} = \\sqrt{\\frac{3RT}{M}}',
    difficulty: 4,
    unit: 'm/s',
    targetSymbol: 'v_{rms}',
    variables: [
      { symbol: 'R', name: 'Gas Constant', isConstant: true },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [100, 1200], decimals: 1 },
      { symbol: 'M', name: 'Molar Mass', unit: 'g/mol', range: [2, 100], decimals: 1, toSI: (val) => val / 1000 }
    ],
    calculate: (v) => Math.sqrt((3 * v.R * v.T) / v.M)
  },
  {
    id: 'thm_3',
    name: 'Mean Speed of Gas Molecules',
    topic: 'Kinetic Theory',
    subject: 'Physics',
    latex: 'v_{mean} = \\sqrt{\\frac{8RT}{\\pi M}}',
    difficulty: 4,
    unit: 'm/s',
    targetSymbol: 'v_{mean}',
    variables: [
      { symbol: 'R', name: 'Gas Constant', isConstant: true },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [100, 1200], decimals: 1 },
      { symbol: 'M', name: 'Molar Mass', unit: 'g/mol', range: [2, 100], decimals: 1, toSI: (val) => val / 1000 }
    ],
    calculate: (v) => Math.sqrt((8 * v.R * v.T) / (Math.PI * v.M))
  },
  {
    id: 'thm_4',
    name: 'Most Probable Speed of Gas Molecules',
    topic: 'Kinetic Theory',
    subject: 'Physics',
    latex: 'v_{mp} = \\sqrt{\\frac{2RT}{M}}',
    difficulty: 4,
    unit: 'm/s',
    targetSymbol: 'v_{mp}',
    variables: [
      { symbol: 'R', name: 'Gas Constant', isConstant: true },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [100, 1200], decimals: 1 },
      { symbol: 'M', name: 'Molar Mass', unit: 'g/mol', range: [2, 100], decimals: 1, toSI: (val) => val / 1000 }
    ],
    calculate: (v) => Math.sqrt((2 * v.R * v.T) / v.M)
  },
  {
    id: 'thm_5',
    name: 'Internal Energy (Monoatomic Gas)',
    topic: 'Kinetic Theory',
    subject: 'Physics',
    latex: 'U = \\frac{3}{2}nRT',
    difficulty: 2,
    unit: 'J',
    targetSymbol: 'U',
    variables: [
      { symbol: 'n', name: 'Number of Moles', unit: 'mol', range: [0.1, 10], decimals: 2 },
      { symbol: 'R', name: 'Gas Constant', isConstant: true },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [100, 800], decimals: 1 }
    ],
    calculate: (v) => 1.5 * v.n * v.R * v.T
  },
  {
    id: 'thm_6',
    name: 'Internal Energy (Diatomic Gas)',
    topic: 'Kinetic Theory',
    subject: 'Physics',
    latex: 'U = \\frac{5}{2}nRT',
    difficulty: 2,
    unit: 'J',
    targetSymbol: 'U',
    variables: [
      { symbol: 'n', name: 'Number of Moles', unit: 'mol', range: [0.1, 10], decimals: 2 },
      { symbol: 'R', name: 'Gas Constant', isConstant: true },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [100, 800], decimals: 1 }
    ],
    calculate: (v) => 2.5 * v.n * v.R * v.T
  },
  {
    id: 'thm_7',
    name: 'Isothermal Work Done by Gas',
    topic: 'Thermodynamics',
    subject: 'Physics',
    latex: 'W = nRT \\ln\\left(\\frac{V_2}{V_1}\\right)',
    difficulty: 4,
    unit: 'J',
    targetSymbol: 'W',
    variables: [
      { symbol: 'n', name: 'Moles', unit: 'mol', range: [0.1, 5], decimals: 2 },
      { symbol: 'R', name: 'Gas Constant', isConstant: true },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [200, 600], decimals: 1 },
      { symbol: 'V1', name: 'Initial Volume', unit: 'L', range: [1, 20], decimals: 1 },
      { symbol: 'V2', name: 'Final Volume', unit: 'L', range: [21, 100], decimals: 1 }
    ],
    calculate: (v) => v.n * v.R * v.T * Math.log(v.V2 / v.V1)
  },
  {
    id: 'thm_8',
    name: 'Adiabatic Work Done by Gas',
    topic: 'Thermodynamics',
    subject: 'Physics',
    latex: 'W = \\frac{P_1V_1 - P_2V_2}{\\gamma - 1}',
    difficulty: 4,
    unit: 'J',
    targetSymbol: 'W',
    variables: [
      { symbol: 'P1', name: 'Initial Pressure', unit: 'kPa', range: [100, 500], decimals: 1, toSI: (val) => val * 1000 },
      { symbol: 'V1', name: 'Initial Volume', unit: 'L', range: [1, 10], decimals: 2, toSI: (val) => val / 1000 },
      { symbol: 'P2', name: 'Final Pressure', unit: 'kPa', range: [10, 99], decimals: 1, toSI: (val) => val * 1000 },
      { symbol: 'V2', name: 'Final Volume', unit: 'L', range: [11, 40], decimals: 2, toSI: (val) => val / 1000 },
      { symbol: 'gamma', name: 'Adiabatic Index (Cp/Cv)', unit: '', range: [1.3, 1.7], decimals: 2 }
    ],
    calculate: (v) => (v.P1 * v.V1 - v.P2 * v.V2) / (v.gamma - 1)
  },
  {
    id: 'thm_9',
    name: 'Carnot Engine Efficiency',
    topic: 'Thermodynamics',
    subject: 'Physics',
    latex: '\\eta = 1 - \\frac{T_C}{T_H}',
    difficulty: 2,
    unit: '',
    targetSymbol: 'eta',
    variables: [
      { symbol: 'TC', name: 'Sink Temperature', unit: 'K', range: [100, 350], decimals: 1 },
      { symbol: 'TH', name: 'Source Temperature', unit: 'K', range: [400, 1000], decimals: 1 }
    ],
    calculate: (v) => 1 - v.TC / v.TH
  },
  {
    id: 'thm_10',
    name: 'Stefan-Boltzmann Law (Radiation Power)',
    topic: 'Thermodynamics',
    subject: 'Physics',
    latex: 'P = \\sigma A T^4',
    difficulty: 4,
    unit: 'W',
    targetSymbol: 'P',
    variables: [
      { symbol: 'sigma', name: 'Stefan Constant', isConstant: true },
      { symbol: 'A', name: 'Surface Area', unit: 'cm²', range: [1, 200], decimals: 1, toSI: (val) => val / 10000 },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [500, 3000], decimals: 0 }
    ],
    calculate: (v) => v.sigma * v.A * Math.pow(v.T, 4)
  },
  {
    id: 'thm_11',
    name: "Wien's Displacement Law",
    topic: 'Thermodynamics',
    subject: 'Physics',
    latex: '\\lambda_{max} = \\frac{b}{T}',
    difficulty: 3,
    unit: 'm',
    targetSymbol: 'lambda_{max}',
    variables: [
      { symbol: 'b', name: 'Wien\'s Constant', isConstant: false, staticValue: 2.898e-3 }, // explicitly given
      { symbol: 'T', name: 'Blackbody Temperature', unit: 'K', range: [1000, 20000], decimals: 0 }
    ],
    calculate: (v) => v.b / v.T
  },

  // --- OPTICS ---
  {
    id: 'opt_1',
    name: 'Mirror Formula (Image Distance)',
    topic: 'Optics',
    subject: 'Physics',
    latex: '\\frac{1}{v} = \\frac{1}{f} - \\frac{1}{u}',
    difficulty: 3,
    unit: 'cm',
    targetSymbol: 'v',
    variables: [
      { symbol: 'f', name: 'Focal Length (negative for concave)', unit: 'cm', range: [-40, -10], decimals: 1 },
      { symbol: 'u', name: 'Object Distance (typically negative)', unit: 'cm', range: [-100, -41], decimals: 1 }
    ],
    calculate: (v) => 1 / (1 / v.f - 1 / v.u)
  },
  {
    id: 'opt_2',
    name: 'Mirror Magnification',
    topic: 'Optics',
    subject: 'Physics',
    latex: 'm = -\\frac{v}{u}',
    difficulty: 2,
    unit: '',
    targetSymbol: 'm',
    variables: [
      { symbol: 'v', name: 'Image Distance', unit: 'cm', range: [-100, 100], decimals: 1 },
      { symbol: 'u', name: 'Object Distance', unit: 'cm', range: [-100, -1], decimals: 1 }
    ],
    calculate: (v) => -v.v / v.u
  },
  {
    id: 'opt_3',
    name: 'Lens Formula (Image Distance)',
    topic: 'Optics',
    subject: 'Physics',
    latex: '\\frac{1}{v} = \\frac{1}{f} + \\frac{1}{u}',
    difficulty: 3,
    unit: 'cm',
    targetSymbol: 'v',
    variables: [
      { symbol: 'f', name: 'Focal Length (positive for convex)', unit: 'cm', range: [10, 39], decimals: 1 },
      { symbol: 'u', name: 'Object Distance (typically negative)', unit: 'cm', range: [-100, -40], decimals: 1 }
    ],
    calculate: (v) => 1 / (1 / v.f + 1 / v.u)
  },
  {
    id: 'opt_4',
    name: 'Lens Magnification',
    topic: 'Optics',
    subject: 'Physics',
    latex: 'm = \\frac{v}{u}',
    difficulty: 2,
    unit: '',
    targetSymbol: 'm',
    variables: [
      { symbol: 'v', name: 'Image Distance', unit: 'cm', range: [-100, 100], decimals: 1 },
      { symbol: 'u', name: 'Object Distance', unit: 'cm', range: [-100, -1], decimals: 1 }
    ],
    calculate: (v) => v.v / v.u
  },
  {
    id: 'opt_5',
    name: "Lens Maker's Equation",
    topic: 'Optics',
    subject: 'Physics',
    latex: '\\frac{1}{f} = (n - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)',
    difficulty: 4,
    unit: 'cm',
    targetSymbol: 'f',
    variables: [
      { symbol: 'n', name: 'Refractive Index', unit: '', range: [1.3, 1.9], decimals: 2 },
      { symbol: 'R1', name: 'Radius of Curvature 1', unit: 'cm', range: [10, 80], decimals: 1 },
      { symbol: 'R2', name: 'Radius of Curvature 2', unit: 'cm', range: [-80, -10], decimals: 1 }
    ],
    calculate: (v) => 1 / ((v.n - 1) * (1 / v.R1 - 1 / v.R2))
  },
  {
    id: 'opt_6',
    name: "Snell's Law (Refracted Angle)",
    topic: 'Optics',
    subject: 'Physics',
    latex: '\\theta_2 = \\arcsin\\left(\\frac{n_1 \\sin\\theta_1}{n_2}\\right)',
    difficulty: 3,
    unit: 'degrees',
    targetSymbol: 'theta_2',
    variables: [
      { symbol: 'n1', name: 'Incident Refractive Index', unit: '', range: [1.0, 1.2], decimals: 2 },
      { symbol: 'theta1', name: 'Incident Angle', unit: 'degrees', range: [10, 45], decimals: 1, toSI: (val) => (val * Math.PI) / 180 },
      { symbol: 'n2', name: 'Refracting Refractive Index', unit: '', range: [1.3, 1.8], decimals: 2 }
    ],
    calculate: (v) => (Math.asin((v.n1 * Math.sin(v.theta1)) / v.n2) * 180) / Math.PI
  },
  {
    id: 'opt_7',
    name: 'Refractive Index via Speed',
    topic: 'Optics',
    subject: 'Physics',
    latex: 'n = \\frac{c}{v}',
    difficulty: 2,
    unit: '',
    targetSymbol: 'n',
    variables: [
      { symbol: 'c', name: 'Speed of Light', isConstant: true },
      { symbol: 'v', name: 'Velocity of Light in Medium', unit: 'm/s', range: [1.5e8, 2.5e8], decimals: 0, scientific: true }
    ],
    calculate: (v) => v.c / v.v
  },

  // --- FLUID MECHANICS ---
  {
    id: 'flu_1',
    name: 'Equation of Continuity',
    topic: 'Fluid Mechanics',
    subject: 'Physics',
    latex: 'v_2 = \\frac{A_1 v_1}{A_2}',
    difficulty: 2,
    unit: 'm/s',
    targetSymbol: 'v_2',
    variables: [
      { symbol: 'A1', name: 'Inlet Area', unit: 'cm²', range: [10, 100], decimals: 1 },
      { symbol: 'v1', name: 'Inlet Velocity', unit: 'm/s', range: [0.1, 5.0], decimals: 2 },
      { symbol: 'A2', name: 'Outlet Area', unit: 'cm²', range: [1, 9], decimals: 1 }
    ],
    calculate: (v) => (v.A1 * v.v1) / v.A2
  },
  {
    id: 'flu_2',
    name: 'Bernoulli\'s Velocity (Torricelli\'s Law)',
    topic: 'Fluid Mechanics',
    subject: 'Physics',
    latex: 'v = \\sqrt{2gh}',
    difficulty: 2,
    unit: 'm/s',
    targetSymbol: 'v',
    variables: [
      { symbol: 'g', name: 'Gravity', isConstant: true },
      { symbol: 'h', name: 'Depth of Liquid', unit: 'm', range: [0.1, 20.0], decimals: 2 }
    ],
    calculate: (v) => Math.sqrt(2 * v.g * v.h)
  },
  {
    id: 'flu_3',
    name: "Stoke's Law (Viscous Drag)",
    topic: 'Fluid Mechanics',
    subject: 'Physics',
    latex: 'F = 6 \\pi \\eta r v',
    difficulty: 3,
    unit: 'N',
    targetSymbol: 'F',
    variables: [
      { symbol: 'eta', name: 'Coefficient of Viscosity', unit: 'Pa*s', range: [0.001, 1.5], decimals: 3 },
      { symbol: 'r', name: 'Radius of Sphere', unit: 'mm', range: [0.1, 10.0], decimals: 2, toSI: (val) => val / 1000 },
      { symbol: 'v', name: 'Velocity', unit: 'm/s', range: [0.01, 2.0], decimals: 2 }
    ],
    calculate: (v) => 6 * Math.PI * v.eta * v.r * v.v
  },
  {
    id: 'flu_4',
    name: 'Terminal Velocity',
    topic: 'Fluid Mechanics',
    subject: 'Physics',
    latex: 'v_t = \\frac{2 r^2 (\\rho_s - \\rho_f) g}{9 \\eta}',
    difficulty: 4,
    unit: 'm/s',
    targetSymbol: 'v_t',
    variables: [
      { symbol: 'r', name: 'Radius of Sphere', unit: 'mm', range: [0.5, 5.0], decimals: 2, toSI: (val) => val / 1000 },
      { symbol: 'rhos', name: 'Density of Sphere', unit: 'g/cm³', range: [2.5, 9.0], decimals: 2, toSI: (val) => val * 1000 },
      { symbol: 'rhof', name: 'Density of Fluid', unit: 'g/cm³', range: [0.8, 1.5], decimals: 2, toSI: (val) => val * 1000 },
      { symbol: 'g', name: 'Gravity', isConstant: true },
      { symbol: 'eta', name: 'Viscosity of Fluid', unit: 'Pa*s', range: [0.01, 1.0], decimals: 2 }
    ],
    calculate: (v) => (2 * v.r * v.r * (v.rhos - v.rhof) * v.g) / (9 * v.eta)
  },

  // --- ELECTROSTATICS & CURRENT ELECTRICITY ---
  {
    id: 'elec_1',
    name: "Coulomb's Law",
    topic: 'Electrostatics',
    subject: 'Physics',
    latex: 'F = \\frac{k q_1 q_2}{r^2}',
    difficulty: 3,
    unit: 'N',
    targetSymbol: 'F',
    variables: [
      { symbol: 'k', name: 'Coulomb Constant', isConstant: true },
      { symbol: 'q1', name: 'Charge 1', unit: 'μC', range: [0.1, 50], decimals: 2, toSI: (val) => val * 1e-6 },
      { symbol: 'q2', name: 'Charge 2', unit: 'μC', range: [0.1, 50], decimals: 2, toSI: (val) => val * 1e-6 },
      { symbol: 'r', name: 'Distance', unit: 'cm', range: [1, 200], decimals: 1, toSI: (val) => val / 100 }
    ],
    calculate: (v) => (v.k * v.q1 * v.q2) / (v.r * v.r)
  },
  {
    id: 'elec_2',
    name: 'Electric Field of Point Charge',
    topic: 'Electrostatics',
    subject: 'Physics',
    latex: 'E = \\frac{k q}{r^2}',
    difficulty: 3,
    unit: 'N/C',
    targetSymbol: 'E',
    variables: [
      { symbol: 'k', name: 'Coulomb Constant', isConstant: true },
      { symbol: 'q', name: 'Charge', unit: 'μC', range: [0.01, 10], decimals: 2, toSI: (val) => val * 1e-6 },
      { symbol: 'r', name: 'Distance', unit: 'cm', range: [1, 150], decimals: 1, toSI: (val) => val / 100 }
    ],
    calculate: (v) => (v.k * v.q) / (v.r * v.r)
  },
  {
    id: 'elec_3',
    name: 'Electric Potential of Point Charge',
    topic: 'Electrostatics',
    subject: 'Physics',
    latex: 'V = \\frac{k q}{r}',
    difficulty: 2,
    unit: 'V',
    targetSymbol: 'V',
    variables: [
      { symbol: 'k', name: 'Coulomb Constant', isConstant: true },
      { symbol: 'q', name: 'Charge', unit: 'μC', range: [0.01, 10], decimals: 2, toSI: (val) => val * 1e-6 },
      { symbol: 'r', name: 'Distance', unit: 'cm', range: [1, 150], decimals: 1, toSI: (val) => val / 100 }
    ],
    calculate: (v) => (v.k * v.q) / v.r
  },
  {
    id: 'elec_4',
    name: 'Parallel Plate Capacitance',
    topic: 'Electrostatics',
    subject: 'Physics',
    latex: 'C = \\frac{\\varepsilon_0 A}{d}',
    difficulty: 3,
    unit: 'F',
    targetSymbol: 'C',
    variables: [
      { symbol: 'eps0', name: 'Permittivity of Free Space', isConstant: true },
      { symbol: 'A', name: 'Area of Plates', unit: 'cm²', range: [10, 500], decimals: 1, toSI: (val) => val / 10000 },
      { symbol: 'd', name: 'Distance between Plates', unit: 'mm', range: [0.05, 5], decimals: 2, toSI: (val) => val / 1000 }
    ],
    calculate: (v) => (v.eps0 * v.A) / v.d
  },
  {
    id: 'elec_5',
    name: 'Energy Stored in Capacitor',
    topic: 'Electrostatics',
    subject: 'Physics',
    latex: 'U = \\frac{1}{2} C V^2',
    difficulty: 2,
    unit: 'J',
    targetSymbol: 'U',
    variables: [
      { symbol: 'C', name: 'Capacitance', unit: 'μF', range: [0.1, 100], decimals: 2, toSI: (val) => val * 1e-6 },
      { symbol: 'V', name: 'Voltage Difference', unit: 'V', range: [1, 500], decimals: 1 }
    ],
    calculate: (v) => 0.5 * v.C * v.V * v.V
  },
  {
    id: 'elec_6',
    name: 'Electrical Power',
    topic: 'Current Electricity',
    subject: 'Physics',
    latex: 'P = \\frac{V^2}{R}',
    difficulty: 2,
    unit: 'W',
    targetSymbol: 'P',
    variables: [
      { symbol: 'V', name: 'Voltage', unit: 'V', range: [5, 240], decimals: 1 },
      { symbol: 'R', name: 'Resistance', unit: 'Ω', range: [1, 1000], decimals: 1 }
    ],
    calculate: (v) => (v.V * v.V) / v.R
  },
  {
    id: 'elec_7',
    name: 'Drift Velocity',
    topic: 'Current Electricity',
    subject: 'Physics',
    latex: 'v_d = \\frac{I}{n A e}',
    difficulty: 3,
    unit: 'm/s',
    targetSymbol: 'v_d',
    variables: [
      { symbol: 'I', name: 'Current', unit: 'A', range: [0.1, 10.0], decimals: 2 },
      { symbol: 'n', name: 'Free Electron Density', unit: 'm⁻³', range: [1e28, 1e29], decimals: 0, scientific: true },
      { symbol: 'A', name: 'Cross-section Area', unit: 'mm²', range: [0.1, 5.0], decimals: 2, toSI: (val) => val * 1e-6 },
      { symbol: 'e', name: 'Elementary Charge', isConstant: false, staticValue: 1.602e-19 }
    ],
    calculate: (v) => v.I / (v.n * v.A * v.e)
  },
  {
    id: 'elec_8',
    name: 'Resistivity of a Wire',
    topic: 'Current Electricity',
    subject: 'Physics',
    latex: 'R = \\frac{\\rho L}{A}',
    difficulty: 2,
    unit: 'Ω',
    targetSymbol: 'R',
    variables: [
      { symbol: 'rho', name: 'Resistivity of Material', unit: 'Ω*m', range: [1e-8, 1e-5], decimals: 0, scientific: true },
      { symbol: 'L', name: 'Length of Wire', unit: 'm', range: [0.5, 50.0], decimals: 1 },
      { symbol: 'A', name: 'Cross Section Area', unit: 'mm²', range: [0.01, 10.0], decimals: 2, toSI: (val) => val * 1e-6 }
    ],
    calculate: (v) => (v.rho * v.L) / v.A
  },
  {
    id: 'elec_9',
    name: 'Wheatstone Bridge Balance Resistance',
    topic: 'Current Electricity',
    subject: 'Physics',
    latex: 'S = \\frac{R \\cdot Q}{P}',
    difficulty: 2,
    unit: 'Ω',
    targetSymbol: 'S',
    variables: [
      { symbol: 'P', name: 'Bridge Arm P', unit: 'Ω', range: [10, 1000], decimals: 1 },
      { symbol: 'Q', name: 'Bridge Arm Q', unit: 'Ω', range: [10, 1000], decimals: 1 },
      { symbol: 'R', name: 'Known Resistance R', unit: 'Ω', range: [1, 500], decimals: 1 }
    ],
    calculate: (v) => (v.R * v.Q) / v.P
  },

  // --- MAGNETISM & EMI ---
  {
    id: 'mag_1',
    name: 'Biot-Savart Law (Infinite Straight Wire)',
    topic: 'Magnetism',
    subject: 'Physics',
    latex: 'B = \\frac{\\mu_0 I}{2\\pi r}',
    difficulty: 4,
    unit: 'T',
    targetSymbol: 'B',
    variables: [
      { symbol: 'mu0', name: 'Permeability of Free Space', isConstant: true },
      { symbol: 'I', name: 'Current', unit: 'A', range: [0.5, 50], decimals: 1 },
      { symbol: 'r', name: 'Distance from Wire', unit: 'cm', range: [0.5, 50], decimals: 1, toSI: (val) => val / 100 }
    ],
    calculate: (v) => (v.mu0 * v.I) / (2 * Math.PI * v.r)
  },
  {
    id: 'mag_2',
    name: 'Magnetic Field at Centre of Loop',
    topic: 'Magnetism',
    subject: 'Physics',
    latex: 'B = \\frac{\\mu_0 I}{2R}',
    difficulty: 3,
    unit: 'T',
    targetSymbol: 'B',
    variables: [
      { symbol: 'mu0', name: 'Permeability of Free Space', isConstant: true },
      { symbol: 'I', name: 'Current', unit: 'A', range: [0.5, 50], decimals: 1 },
      { symbol: 'R', name: 'Radius of Circular Loop', unit: 'cm', range: [1, 100], decimals: 1, toSI: (val) => val / 100 }
    ],
    calculate: (v) => (v.mu0 * v.I) / (2 * v.R)
  },
  {
    id: 'mag_3',
    name: 'Magnetic Field inside Solenoid',
    topic: 'Magnetism',
    subject: 'Physics',
    latex: 'B = \\mu_0 n I',
    difficulty: 3,
    unit: 'T',
    targetSymbol: 'B',
    variables: [
      { symbol: 'mu0', name: 'Permeability of Free Space', isConstant: true },
      { symbol: 'n', name: 'Turns per unit length', unit: 'turns/m', range: [100, 5000], decimals: 0 },
      { symbol: 'I', name: 'Current', unit: 'A', range: [0.1, 10], decimals: 2 }
    ],
    calculate: (v) => v.mu0 * v.n * v.I
  },
  {
    id: 'mag_4',
    name: 'Lorentz Force on Charge',
    topic: 'Magnetism',
    subject: 'Physics',
    latex: 'F = q v B \\sin\\theta',
    difficulty: 3,
    unit: 'N',
    targetSymbol: 'F',
    variables: [
      { symbol: 'q', name: 'Charge', unit: 'μC', range: [0.01, 100], decimals: 2, toSI: (val) => val * 1e-6 },
      { symbol: 'v', name: 'Velocity', unit: 'm/s', range: [100, 100000], decimals: 1 },
      { symbol: 'B', name: 'Magnetic Field Strength', unit: 'T', range: [0.01, 5], decimals: 2 },
      { symbol: 'theta', name: 'Angle', unit: 'degrees', range: [10, 90], decimals: 1, toSI: (val) => (val * Math.PI) / 180 }
    ],
    calculate: (v) => v.q * v.v * v.B * Math.sin(v.theta)
  },
  {
    id: 'mag_5',
    name: 'Magnetic Force on Wire',
    topic: 'Magnetism',
    subject: 'Physics',
    latex: 'F = B I L \\sin\\theta',
    difficulty: 3,
    unit: 'N',
    targetSymbol: 'F',
    variables: [
      { symbol: 'B', name: 'Magnetic Field Strength', unit: 'T', range: [0.01, 3], decimals: 2 },
      { symbol: 'I', name: 'Current', unit: 'A', range: [0.5, 20], decimals: 1 },
      { symbol: 'L', name: 'Length of Wire', unit: 'm', range: [0.1, 5], decimals: 2 },
      { symbol: 'theta', name: 'Angle', unit: 'degrees', range: [10, 90], decimals: 1, toSI: (val) => (val * Math.PI) / 180 }
    ],
    calculate: (v) => v.B * v.I * v.L * Math.sin(v.theta)
  },
  {
    id: 'mag_6',
    name: 'Magnetic Flux',
    topic: 'EMI',
    subject: 'Physics',
    latex: '\\Phi = B A \\cos\\theta',
    difficulty: 2,
    unit: 'Wb',
    targetSymbol: 'Phi',
    variables: [
      { symbol: 'B', name: 'Magnetic Field', unit: 'T', range: [0.01, 2], decimals: 2 },
      { symbol: 'A', name: 'Area', unit: 'cm²', range: [5, 500], decimals: 1, toSI: (val) => val / 10000 },
      { symbol: 'theta', name: 'Angle with Normal', unit: 'degrees', range: [0, 90], decimals: 1, toSI: (val) => (val * Math.PI) / 180 }
    ],
    calculate: (v) => v.B * v.A * Math.cos(v.theta)
  },
  {
    id: 'mag_7',
    name: 'Peak EMF of AC Generator',
    topic: 'EMI',
    subject: 'Physics',
    latex: '\\varepsilon_0 = N B A \\omega',
    difficulty: 3,
    unit: 'V',
    targetSymbol: 'eps0_emf',
    variables: [
      { symbol: 'N', name: 'Number of Turns', unit: '', range: [10, 500], integer: true },
      { symbol: 'B', name: 'Magnetic Field', unit: 'T', range: [0.01, 2], decimals: 2 },
      { symbol: 'A', name: 'Loop Area', unit: 'cm²', range: [5, 200], decimals: 1, toSI: (val) => val / 10000 },
      { symbol: 'omega', name: 'Angular Frequency', unit: 'rad/s', range: [10, 314], decimals: 1 }
    ],
    calculate: (v) => v.N * v.B * v.A * v.omega
  },
  {
    id: 'mag_8',
    name: 'Energy Stored in Inductor',
    topic: 'EMI',
    subject: 'Physics',
    latex: 'U = \\frac{1}{2} L I^2',
    difficulty: 3,
    unit: 'J',
    targetSymbol: 'U',
    variables: [
      { symbol: 'L', name: 'Inductance', unit: 'mH', range: [1, 200], decimals: 1, toSI: (val) => val / 1000 },
      { symbol: 'I', name: 'Current', unit: 'A', range: [0.1, 15], decimals: 2 }
    ],
    calculate: (v) => 0.5 * v.L * v.I * v.I
  },
  {
    id: 'mag_9',
    name: 'LC Oscillation Resonance Frequency',
    topic: 'EMI',
    subject: 'Physics',
    latex: 'f = \\frac{1}{2\\pi \\sqrt{LC}}',
    difficulty: 4,
    unit: 'Hz',
    targetSymbol: 'f',
    variables: [
      { symbol: 'L', name: 'Inductance', unit: 'mH', range: [0.1, 100], decimals: 2, toSI: (val) => val / 1000 },
      { symbol: 'C', name: 'Capacitance', unit: 'μF', range: [0.01, 10], decimals: 3, toSI: (val) => val * 1e-6 }
    ],
    calculate: (v) => 1 / (2 * Math.PI * Math.sqrt(v.L * v.C))
  },

  // --- MODERN PHYSICS ---
  {
    id: 'mod_1',
    name: 'Photoelectric Effect (Max K.E.)',
    topic: 'Modern Physics',
    subject: 'Physics',
    latex: 'K.E._{max} = hf - \\phi',
    difficulty: 3,
    unit: 'eV',
    targetSymbol: 'K.E._{max}',
    variables: [
      { symbol: 'h', name: 'Planck Constant', isConstant: true },
      { symbol: 'f', name: 'Photon Frequency', unit: '10¹⁴ Hz', range: [5, 20], decimals: 2, toSI: (val) => val * 1e14 },
      { symbol: 'phi', name: 'Work Function', unit: 'eV', range: [1.5, 4.5], decimals: 2, toSI: (val) => val * 1.602e-19 }
    ],
    // Calculate SI Joules first, then convert back to display unit (eV)
    calculate: (v) => (v.h * v.f - v.phi) / 1.602e-19
  },
  {
    id: 'mod_2',
    name: 'de Broglie Wavelength',
    topic: 'Modern Physics',
    subject: 'Physics',
    latex: '\\lambda = \\frac{h}{mv}',
    difficulty: 3,
    unit: 'nm',
    targetSymbol: 'lambda',
    variables: [
      { symbol: 'h', name: 'Planck Constant', isConstant: true },
      { symbol: 'm', name: 'Mass of Particle', unit: 'kg', range: [1e-31, 1e-26], decimals: 0, scientific: true },
      { symbol: 'v', name: 'Velocity', unit: 'm/s', range: [1000, 1e7], decimals: 0, scientific: true }
    ],
    // Calculate SI meters, then convert to nm
    calculate: (v) => (v.h / (v.m * v.v)) * 1e9
  },
  {
    id: 'mod_3',
    name: 'Mass-Energy Equivalence',
    topic: 'Modern Physics',
    subject: 'Physics',
    latex: 'E = m c^2',
    difficulty: 2,
    unit: 'J',
    targetSymbol: 'E',
    variables: [
      { symbol: 'm', name: 'Mass Defect', unit: 'mg', range: [0.01, 100], decimals: 3, toSI: (val) => val / 1e6 },
      { symbol: 'c', name: 'Speed of Light', isConstant: true }
    ],
    calculate: (v) => v.m * v.c * v.c
  },
  {
    id: 'mod_4',
    name: 'Binding Energy (from mass defect in amu)',
    topic: 'Modern Physics',
    subject: 'Physics',
    latex: 'B.E. = \\Delta m \\cdot 931.5',
    difficulty: 2,
    unit: 'MeV',
    targetSymbol: 'B.E.',
    variables: [
      { symbol: 'deltam', name: 'Mass Defect', unit: 'amu', range: [0.001, 0.5], decimals: 4 }
    ],
    calculate: (v) => v.deltam * 931.5
  },
  {
    id: 'mod_5',
    name: 'Radioactive Decay (Number of Nuclei)',
    topic: 'Modern Physics',
    subject: 'Physics',
    latex: 'N = N_0 e^{-\\lambda t}',
    difficulty: 4,
    unit: 'nuclei',
    targetSymbol: 'N',
    variables: [
      { symbol: 'N0', name: 'Initial Nuclei', unit: 'nuclei', range: [1e15, 1e20], decimals: 0, scientific: true },
      { symbol: 'lambda', name: 'Decay Constant', unit: 's⁻¹', range: [1e-5, 0.1], decimals: 0, scientific: true },
      { symbol: 't', name: 'Decay Time', unit: 's', range: [1, 1000], decimals: 1 }
    ],
    calculate: (v) => v.N0 * Math.exp(-v.lambda * v.t)
  },
  {
    id: 'mod_6',
    name: 'Radioactive Decay Activity',
    topic: 'Modern Physics',
    subject: 'Physics',
    latex: 'A = \\lambda N_0 e^{-\\lambda t}',
    difficulty: 4,
    unit: 'Bq',
    targetSymbol: 'A',
    variables: [
      { symbol: 'lambda', name: 'Decay Constant', unit: 's⁻¹', range: [1e-5, 0.1], decimals: 0, scientific: true },
      { symbol: 'N0', name: 'Initial Nuclei', unit: 'nuclei', range: [1e15, 1e20], decimals: 0, scientific: true },
      { symbol: 't', name: 'Time elapsed', unit: 's', range: [1, 1000], decimals: 1 }
    ],
    calculate: (v) => v.lambda * v.N0 * Math.exp(-v.lambda * v.t)
  },
  {
    id: 'mod_7',
    name: 'Bohr Orbit Radius (General)',
    topic: 'Modern Physics',
    subject: 'Physics',
    latex: 'r_n = \\frac{n^2 a_0}{Z}',
    difficulty: 3,
    unit: 'm',
    targetSymbol: 'r_n',
    variables: [
      { symbol: 'a0', name: 'Bohr Radius Constant', isConstant: true },
      { symbol: 'n', name: 'Principal Quantum Number', unit: '', range: [1, 6], integer: true },
      { symbol: 'Z', name: 'Atomic Number', unit: '', range: [1, 4], integer: true }
    ],
    calculate: (v) => (v.n * v.n * v.a0) / v.Z
  },
  {
    id: 'mod_8',
    name: 'Hydrogen-like Energy Level',
    topic: 'Modern Physics',
    subject: 'Physics',
    latex: 'E_n = -13.6 \\frac{Z^2}{n^2}',
    difficulty: 3,
    unit: 'eV',
    targetSymbol: 'E_n',
    variables: [
      { symbol: 'Z', name: 'Atomic Number', unit: '', range: [1, 4], integer: true },
      { symbol: 'n', name: 'Orbit Index', unit: '', range: [1, 6], integer: true }
    ],
    calculate: (v) => -13.6 * (v.Z * v.Z) / (v.n * v.n)
  },
  {
    id: 'mod_9',
    name: 'Rydberg Formula Wavenumber',
    topic: 'Modern Physics',
    subject: 'Physics',
    latex: '\\bar{\\nu} = R_H Z^2 \\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)',
    difficulty: 4,
    unit: 'm⁻¹',
    targetSymbol: '\\bar{\\nu}',
    variables: [
      { symbol: 'RH', name: 'Rydberg Constant', isConstant: true },
      { symbol: 'Z', name: 'Atomic Number', unit: '', range: [1, 3], integer: true },
      { symbol: 'n1', name: 'Lower State (n1)', unit: '', range: [1, 3], integer: true },
      { symbol: 'n2', name: 'Upper State (n2)', unit: '', range: [4, 6], integer: true }
    ],
    calculate: (v) => v.RH * v.Z * v.Z * (1 / (v.n1 * v.n1) - 1 / (v.n2 * v.n2))
  },


  // ==========================================
  // CHEMISTRY
  // ==========================================

  // --- GASEOUS STATE ---
  {
    id: 'gas_1',
    name: 'Ideal Gas Law (Pressure)',
    topic: 'Gaseous State',
    subject: 'Chemistry',
    latex: 'P = \\frac{nRT}{V}',
    difficulty: 2,
    unit: 'atm',
    targetSymbol: 'P',
    variables: [
      { symbol: 'n', name: 'Moles', unit: 'mol', range: [0.1, 5], decimals: 2 },
      { symbol: 'R', name: 'Gas Constant', isConstant: false, staticValue: 0.0821 }, // standard chem value in L*atm/(mol*K)
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [150, 600], decimals: 1 },
      { symbol: 'V', name: 'Volume', unit: 'L', range: [0.5, 50], decimals: 1 }
    ],
    calculate: (v) => (v.n * v.R * v.T) / v.V
  },
  {
    id: 'gas_2',
    name: 'Van der Waals Equation (Pressure)',
    topic: 'Gaseous State',
    subject: 'Chemistry',
    latex: 'P = \\frac{RT}{V_m - b} - \\frac{a}{V_m^2}',
    difficulty: 5,
    unit: 'atm',
    targetSymbol: 'P',
    variables: [
      { symbol: 'R', name: 'Gas Constant', isConstant: false, staticValue: 0.0821 },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [200, 700], decimals: 1 },
      { symbol: 'Vm', name: 'Molar Volume', unit: 'L/mol', range: [2.0, 10.0], decimals: 2 },
      { symbol: 'a', name: 'a constant', unit: 'L²*atm/mol²', range: [1.0, 6.0], decimals: 2 },
      { symbol: 'b', name: 'b constant', unit: 'L/mol', range: [0.03, 0.1], decimals: 3 }
    ],
    calculate: (v) => (v.R * v.T) / (v.Vm - v.b) - v.a / (v.Vm * v.Vm)
  },
  {
    id: 'gas_3',
    name: 'Graham\'s Law of Diffusion Rate Ratio',
    topic: 'Gaseous State',
    subject: 'Chemistry',
    latex: '\\frac{r_1}{r_2} = \\sqrt{\\frac{M_2}{M_1}}',
    difficulty: 3,
    unit: '',
    targetSymbol: 'r_1/r_2',
    variables: [
      { symbol: 'M1', name: 'Molar Mass of Gas 1', unit: 'g/mol', range: [2, 80], decimals: 1 },
      { symbol: 'M2', name: 'Molar Mass of Gas 2', unit: 'g/mol', range: [20, 160], decimals: 1 }
    ],
    calculate: (v) => Math.sqrt(v.M2 / v.M1)
  },
  {
    id: 'gas_4',
    name: 'Partial Pressure of Component',
    topic: 'Gaseous State',
    subject: 'Chemistry',
    latex: 'P_A = X_A P_{total}',
    difficulty: 2,
    unit: 'atm',
    targetSymbol: 'P_A',
    variables: [
      { symbol: 'XA', name: 'Mole Fraction of A', unit: '', range: [0.05, 0.95], decimals: 2 },
      { symbol: 'Ptotal', name: 'Total Pressure', unit: 'atm', range: [0.5, 15], decimals: 2 }
    ],
    calculate: (v) => v.XA * v.Ptotal
  },
  {
    id: 'gas_5',
    name: 'Compressibility Factor',
    topic: 'Gaseous State',
    subject: 'Chemistry',
    latex: 'Z = \\frac{PV}{nRT}',
    difficulty: 2,
    unit: '',
    targetSymbol: 'Z',
    variables: [
      { symbol: 'P', name: 'Pressure', unit: 'atm', range: [1, 200], decimals: 1 },
      { symbol: 'V', name: 'Volume', unit: 'L', range: [0.1, 10], decimals: 2 },
      { symbol: 'n', name: 'Moles', unit: 'mol', range: [0.5, 5.0], decimals: 2 },
      { symbol: 'R', name: 'Gas Constant', isConstant: false, staticValue: 0.0821 },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [200, 600], decimals: 1 }
    ],
    calculate: (v) => (v.P * v.V) / (v.n * v.R * v.T)
  },

  // --- SOLID STATE ---
  {
    id: 'sol_1',
    name: 'Density of Unit Cell',
    topic: 'Solid State',
    subject: 'Chemistry',
    latex: '\\rho = \\frac{z M}{N_A a^3}',
    difficulty: 4,
    unit: 'g/cm³',
    targetSymbol: 'rho',
    variables: [
      { symbol: 'z', name: 'Atoms per Unit Cell', unit: '', range: [1, 4], choices: [1, 2, 4] },
      { symbol: 'M', name: 'Molar Mass', unit: 'g/mol', range: [20, 200], decimals: 1 },
      { symbol: 'Na', name: 'Avogadro Number', isConstant: true },
      { symbol: 'a', name: 'Unit Cell Edge Length', unit: 'pm', range: [200, 600], decimals: 0, toSI: (val) => val * 1e-10 } // pm -> cm for direct density in g/cm^3
    ],
    // Calculate direct g/cm^3 by converting 'a' to cm: a_cm = a_pm * 1e-10. Na = atoms/mol, z = atoms, M = g/mol.
    // rho = (z * M) / (Na * a_cm^3)
    calculate: (v) => (v.z * v.M) / (v.Na * Math.pow(v.a, 3))
  },
  {
    id: 'sol_2',
    name: 'FCC Atomic Radius-Edge Relation',
    topic: 'Solid State',
    subject: 'Chemistry',
    latex: 'r = \\frac{a \\sqrt{2}}{4}',
    difficulty: 2,
    unit: 'pm',
    targetSymbol: 'r',
    variables: [
      { symbol: 'a', name: 'Edge Length', unit: 'pm', range: [200, 600], decimals: 1 }
    ],
    calculate: (v) => (v.a * Math.sqrt(2)) / 4
  },
  {
    id: 'sol_3',
    name: 'BCC Atomic Radius-Edge Relation',
    topic: 'Solid State',
    subject: 'Chemistry',
    latex: 'r = \\frac{a \\sqrt{3}}{4}',
    difficulty: 2,
    unit: 'pm',
    targetSymbol: 'r',
    variables: [
      { symbol: 'a', name: 'Edge Length', unit: 'pm', range: [200, 600], decimals: 1 }
    ],
    calculate: (v) => (v.a * Math.sqrt(3)) / 4
  },
  {
    id: 'sol_4',
    name: 'Simple Cubic Radius-Edge Relation',
    topic: 'Solid State',
    subject: 'Chemistry',
    latex: 'r = \\frac{a}{2}',
    difficulty: 1,
    unit: 'pm',
    targetSymbol: 'r',
    variables: [
      { symbol: 'a', name: 'Edge Length', unit: 'pm', range: [200, 600], decimals: 1 }
    ],
    calculate: (v) => v.a / 2
  },

  // --- ATOMIC STRUCTURE ---
  {
    id: 'atm_1',
    name: 'Bohr Orbit Radius (Ångstroms)',
    topic: 'Atomic Structure',
    subject: 'Chemistry',
    latex: 'r_n = 0.529 \\frac{n^2}{Z}',
    difficulty: 3,
    unit: 'Å',
    targetSymbol: 'r_n',
    variables: [
      { symbol: 'n', name: 'Shell Index (n)', unit: '', range: [1, 6], integer: true },
      { symbol: 'Z', name: 'Atomic Number (Z)', unit: '', range: [1, 4], integer: true }
    ],
    calculate: (v) => (0.529 * v.n * v.n) / v.Z
  },
  {
    id: 'atm_2',
    name: 'Energy of Level (Hydrogen-like)',
    topic: 'Atomic Structure',
    subject: 'Chemistry',
    latex: 'E_n = -13.6 \\frac{Z^2}{n^2}',
    difficulty: 3,
    unit: 'eV',
    targetSymbol: 'E_n',
    variables: [
      { symbol: 'Z', name: 'Atomic Number (Z)', unit: '', range: [1, 4], integer: true },
      { symbol: 'n', name: 'Shell Index (n)', unit: '', range: [1, 6], integer: true }
    ],
    calculate: (v) => -13.6 * (v.Z * v.Z) / (v.n * v.n)
  },
  {
    id: 'atm_3',
    name: 'Rydberg Wavelength (Hydrogen Emission)',
    topic: 'Atomic Structure',
    subject: 'Chemistry',
    latex: '\\frac{1}{\\lambda} = R_H Z^2 \\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)',
    difficulty: 4,
    unit: 'nm',
    targetSymbol: 'lambda',
    variables: [
      { symbol: 'RH', name: 'Rydberg Constant', isConstant: true },
      { symbol: 'Z', name: 'Atomic Number', unit: '', range: [1, 2], integer: true },
      { symbol: 'n1', name: 'Initial Level', unit: '', range: [1, 2], integer: true },
      { symbol: 'n2', name: 'Final Level', unit: '', range: [3, 5], integer: true }
    ],
    // Calculate wavelength in nm
    calculate: (v) => 1e9 / (v.RH * v.Z * v.Z * (1 / (v.n1 * v.n1) - 1 / (v.n2 * v.n2)))
  },

  // --- CHEMICAL KINETICS ---
  {
    id: 'kinc_1',
    name: 'Rate Law Value',
    topic: 'Chemical Kinetics',
    subject: 'Chemistry',
    latex: 'Rate = k [A]^m [B]^n',
    difficulty: 4,
    unit: 'M/s',
    targetSymbol: 'Rate',
    variables: [
      { symbol: 'k', name: 'Rate Constant', unit: 'M^(1-m-n)/s', range: [1e-4, 5.0], decimals: 4 },
      { symbol: 'A', name: 'Concentration of A', unit: 'M', range: [0.01, 2.0], decimals: 2 },
      { symbol: 'B', name: 'Concentration of B', unit: 'M', range: [0.01, 2.0], decimals: 2 },
      { symbol: 'm', name: 'Order with respect to A', unit: '', range: [1, 2], integer: true },
      { symbol: 'n', name: 'Order with respect to B', unit: '', range: [0, 2], integer: true }
    ],
    calculate: (v) => v.k * Math.pow(v.A, v.m) * Math.pow(v.B, v.n)
  },
  {
    id: 'kinc_2',
    name: 'First-Order Rate Constant',
    topic: 'Chemical Kinetics',
    subject: 'Chemistry',
    latex: 'k = \\frac{2.303}{t} \\log_{10}\\left(\\frac{[A]_0}{[A]_t}\\right)',
    difficulty: 4,
    unit: 's⁻¹',
    targetSymbol: 'k',
    variables: [
      { symbol: 't', name: 'Time elapsed', unit: 's', range: [10, 5000], decimals: 1 },
      { symbol: 'A0', name: 'Initial Concentration', unit: 'M', range: [0.5, 2.0], decimals: 2 },
      { symbol: 'At', name: 'Concentration at time t', unit: 'M', range: [0.01, 0.49], decimals: 2 }
    ],
    calculate: (v) => (2.303 / v.t) * Math.log10(v.A0 / v.At)
  },
  {
    id: 'kinc_3',
    name: 'First-Order Half-Life',
    topic: 'Chemical Kinetics',
    subject: 'Chemistry',
    latex: 't_{1/2} = \\frac{0.693}{k}',
    difficulty: 2,
    unit: 's',
    targetSymbol: 't_{1/2}',
    variables: [
      { symbol: 'k', name: 'Rate Constant', unit: 's⁻¹', range: [1e-5, 0.1], decimals: 0, scientific: true }
    ],
    calculate: (v) => 0.693 / v.k
  },
  {
    id: 'kinc_4',
    name: 'Second-Order Integrated Rate (Time)',
    topic: 'Chemical Kinetics',
    subject: 'Chemistry',
    latex: 't = \\frac{1}{k}\\left(\\frac{1}{[A]_t} - \\frac{1}{[A]_0}\\right)',
    difficulty: 3,
    unit: 's',
    targetSymbol: 't',
    variables: [
      { symbol: 'k', name: 'Rate Constant', unit: 'M⁻¹s⁻¹', range: [0.01, 5.0], decimals: 2 },
      { symbol: 'A0', name: 'Initial Concentration', unit: 'M', range: [0.5, 2.0], decimals: 2 },
      { symbol: 'At', name: 'Concentration at time t', unit: 'M', range: [0.05, 0.45], decimals: 2 }
    ],
    calculate: (v) => (1 / v.k) * (1 / v.At - 1 / v.A0)
  },
  {
    id: 'kinc_5',
    name: 'Second-Order Half-Life',
    topic: 'Chemical Kinetics',
    subject: 'Chemistry',
    latex: 't_{1/2} = \\frac{1}{k [A]_0}',
    difficulty: 3,
    unit: 's',
    targetSymbol: 't_{1/2}',
    variables: [
      { symbol: 'k', name: 'Rate Constant', unit: 'M⁻¹*s⁻¹', range: [0.001, 2.0], decimals: 3 },
      { symbol: 'A0', name: 'Initial Concentration', unit: 'M', range: [0.05, 5.0], decimals: 2 }
    ],
    calculate: (v) => 1 / (v.k * v.A0)
  },
  {
    id: 'kinc_6',
    name: 'Arrhenius Rate Constant',
    topic: 'Chemical Kinetics',
    subject: 'Chemistry',
    latex: 'k = A e^{-\\frac{E_a}{RT}}',
    difficulty: 5,
    unit: 's⁻¹',
    targetSymbol: 'k',
    variables: [
      { symbol: 'A', name: 'Frequency Factor', unit: 's⁻¹', range: [1e10, 1e12], decimals: 0, scientific: true },
      { symbol: 'Ea', name: 'Activation Energy', unit: 'kJ/mol', range: [40, 150], decimals: 1, toSI: (val) => val * 1000 },
      { symbol: 'R', name: 'Gas Constant', isConstant: true },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [250, 800], decimals: 1 }
    ],
    calculate: (v) => v.A * Math.exp(-v.Ea / (v.R * v.T))
  },
  {
    id: 'kinc_7',
    name: 'Arrhenius Two-Temperature Ratio',
    topic: 'Chemical Kinetics',
    subject: 'Chemistry',
    latex: '\\log_{10}\\left(\\frac{k_2}{k_1}\\right) = \\frac{E_a}{2.303 R}\\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)',
    difficulty: 5,
    unit: '',
    targetSymbol: '\\log_{10}(k_2/k_1)',
    variables: [
      { symbol: 'Ea', name: 'Activation Energy', unit: 'kJ/mol', range: [30, 150], decimals: 1, toSI: (val) => val * 1000 },
      { symbol: 'R', name: 'Gas Constant', isConstant: true },
      { symbol: 'T1', name: 'Temperature 1', unit: 'K', range: [280, 320], decimals: 1 },
      { symbol: 'T2', name: 'Temperature 2', unit: 'K', range: [340, 420], decimals: 1 }
    ],
    calculate: (v) => (v.Ea / (2.303 * v.R)) * (1 / v.T1 - 1 / v.T2)
  },

  // --- ELECTROCHEMISTRY ---
  {
    id: 'echem_1',
    name: 'Nernst Equation (General)',
    topic: 'Electrochemistry',
    subject: 'Chemistry',
    latex: 'E = E^0 - \\frac{RT}{nF} \\ln(Q)',
    difficulty: 5,
    unit: 'V',
    targetSymbol: 'E',
    variables: [
      { symbol: 'E0', name: 'Standard EMF of Cell', unit: 'V', range: [0.1, 2.5], decimals: 3 },
      { symbol: 'R', name: 'Gas Constant', isConstant: true },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [200, 400], decimals: 1 },
      { symbol: 'n', name: 'Electrons Transferred', unit: '', range: [1, 3], integer: true },
      { symbol: 'F', name: 'Faraday Constant', isConstant: true },
      { symbol: 'Q', name: 'Reaction Quotient', unit: '', range: [1e-3, 1000], decimals: 4 }
    ],
    calculate: (v) => v.E0 - (v.R * v.T * Math.log(v.Q)) / (v.n * v.F)
  },
  {
    id: 'echem_2',
    name: 'Nernst Equation (at 298 K)',
    topic: 'Electrochemistry',
    subject: 'Chemistry',
    latex: 'E = E^0 - \\frac{0.0592}{n} \\log_{10}(Q)',
    difficulty: 4,
    unit: 'V',
    targetSymbol: 'E',
    variables: [
      { symbol: 'E0', name: 'Standard EMF of Cell', unit: 'V', range: [0.1, 2.5], decimals: 3 },
      { symbol: 'n', name: 'Electrons Transferred', unit: '', range: [1, 3], integer: true },
      { symbol: 'Q', name: 'Reaction Quotient', unit: '', range: [1e-3, 1000], decimals: 4 }
    ],
    calculate: (v) => v.E0 - (0.0592 / v.n) * Math.log10(v.Q)
  },
  {
    id: 'echem_3',
    name: 'Gibbs Energy from Cell EMF',
    topic: 'Electrochemistry',
    subject: 'Chemistry',
    latex: '\\Delta G^0 = -n F E^0',
    difficulty: 3,
    unit: 'kJ/mol',
    targetSymbol: '\\Delta G^0',
    variables: [
      { symbol: 'n', name: 'Electrons Transferred', unit: '', range: [1, 6], integer: true },
      { symbol: 'F', name: 'Faraday Constant', isConstant: true },
      { symbol: 'E0', name: 'Standard Cell EMF', unit: 'V', range: [0.01, 2.0], decimals: 3 }
    ],
    // Calculate SI Joules, return in kJ/mol
    calculate: (v) => (-v.n * v.F * v.E0) / 1000
  },
  {
    id: 'echem_4',
    name: 'Faraday\'s First Law of Electrolysis',
    topic: 'Electrochemistry',
    subject: 'Chemistry',
    latex: 'm = \\frac{M I t}{n F}',
    difficulty: 4,
    unit: 'g',
    targetSymbol: 'm',
    variables: [
      { symbol: 'M', name: 'Molar Mass of Metal', unit: 'g/mol', range: [20, 200], decimals: 1 },
      { symbol: 'I', name: 'Current', unit: 'A', range: [0.1, 10], decimals: 2 },
      { symbol: 't', name: 'Electrolysis Time', unit: 's', range: [60, 7200], decimals: 0 },
      { symbol: 'n', name: 'Valency of Cation', unit: '', range: [1, 3], integer: true },
      { symbol: 'F', name: 'Faraday Constant', isConstant: true }
    ],
    calculate: (v) => (v.M * v.I * v.t) / (v.n * v.F)
  },
  {
    id: 'echem_5',
    name: 'Molar Conductance',
    topic: 'Electrochemistry',
    subject: 'Chemistry',
    latex: '\\Lambda_m = \\frac{1000 \\cdot \\kappa}{C}',
    difficulty: 3,
    unit: 'S*cm²/mol',
    targetSymbol: '\\Lambda_m',
    variables: [
      { symbol: 'kappa', name: 'Specific Conductance', unit: 'S/cm', range: [1e-4, 0.1], decimals: 5 },
      { symbol: 'C', name: 'Molar Concentration', unit: 'M', range: [0.001, 2.0], decimals: 3 }
    ],
    calculate: (v) => (1000 * v.kappa) / v.C
  },

  // --- CHEMICAL THERMODYNAMICS & EQUILIBRIUM ---
  {
    id: 'thchem_1',
    name: 'Standard Enthalpy of Reaction',
    topic: 'Thermodynamics',
    subject: 'Chemistry',
    latex: '\\Delta H^0_{rxn} = 2 \\Delta H_f^0(P_1) + 3 \\Delta H_f^0(P_2) - \\Delta H_f^0(R_1) - 2 \\Delta H_f^0(R_2)',
    difficulty: 3,
    unit: 'kJ/mol',
    targetSymbol: '\\Delta H^0_{rxn}',
    variables: [
      { symbol: 'HP1', name: 'Hf of Product 1', unit: 'kJ/mol', range: [-400, 100], decimals: 1 },
      { symbol: 'HP2', name: 'Hf of Product 2', unit: 'kJ/mol', range: [-400, 100], decimals: 1 },
      { symbol: 'HR1', name: 'Hf of Reactant 1', unit: 'kJ/mol', range: [-400, 100], decimals: 1 },
      { symbol: 'HR2', name: 'Hf of Reactant 2', unit: 'kJ/mol', range: [-400, 100], decimals: 1 }
    ],
    calculate: (v) => 2 * v.HP1 + 3 * v.HP2 - v.HR1 - 2 * v.HR2
  },
  {
    id: 'thchem_2',
    name: 'Gibbs Free Energy Equation',
    topic: 'Thermodynamics',
    subject: 'Chemistry',
    latex: '\\Delta G = \\Delta H - T \\Delta S',
    difficulty: 2,
    unit: 'kJ/mol',
    targetSymbol: '\\Delta G',
    variables: [
      { symbol: 'dH', name: 'Enthalpy Change', unit: 'kJ/mol', range: [-200, 200], decimals: 1 },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [100, 1000], decimals: 1 },
      { symbol: 'dS', name: 'Entropy Change', unit: 'J/(mol*K)', range: [-300, 300], decimals: 1, toSI: (val) => val / 1000 } // J -> kJ
    ],
    calculate: (v) => v.dH - v.T * v.dS
  },
  {
    id: 'thchem_3',
    name: 'Standard Gibbs Free Energy vs Keq',
    topic: 'Equilibrium',
    subject: 'Chemistry',
    latex: '\\Delta G^0 = -R T \\ln(K)',
    difficulty: 4,
    unit: 'kJ/mol',
    targetSymbol: '\\Delta G^0',
    variables: [
      { symbol: 'R', name: 'Gas Constant', isConstant: true },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [200, 800], decimals: 1 },
      { symbol: 'K', name: 'Equilibrium Constant', unit: '', range: [1e-5, 1e5], decimals: 5 }
    ],
    // Calculate SI Joules, return in kJ/mol
    calculate: (v) => (-v.R * v.T * Math.log(v.K)) / 1000
  },
  {
    id: 'thchem_4',
    name: 'Kp-Kc Equilibrium Relation',
    topic: 'Equilibrium',
    subject: 'Chemistry',
    latex: 'K_p = K_c (R T)^{\\Delta n}',
    difficulty: 4,
    unit: '',
    targetSymbol: 'K_p',
    variables: [
      { symbol: 'Kc', name: 'Concentration Keq', unit: '', range: [0.01, 100], decimals: 3 },
      { symbol: 'R', name: 'Gas Constant', isConstant: false, staticValue: 0.0821 }, // L*atm/(mol*K)
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [250, 900], decimals: 1 },
      { symbol: 'dn', name: 'Delta n (gas moles change)', unit: '', range: [-2, 2], integer: true }
    ],
    calculate: (v) => v.Kc * Math.pow(v.R * v.T, v.dn)
  },
  {
    id: 'thchem_5',
    name: 'Clausius-Clapeyron (Vapour Pressure ratio)',
    topic: 'Thermodynamics',
    subject: 'Chemistry',
    latex: '\\ln\\left(\\frac{P_2}{P_1}\\right) = \\frac{\\Delta H_{vap}}{R} \\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)',
    difficulty: 5,
    unit: '',
    targetSymbol: '\\ln(P_2/P_1)',
    variables: [
      { symbol: 'dHvap', name: 'Enthalpy of Vaporization', unit: 'kJ/mol', range: [20, 60], decimals: 1, toSI: (val) => val * 1000 },
      { symbol: 'R', name: 'Gas Constant', isConstant: true },
      { symbol: 'T1', name: 'Boiling Point T1', unit: 'K', range: [250, 350], decimals: 1 },
      { symbol: 'T2', name: 'Temperature T2', unit: 'K', range: [360, 500], decimals: 1 }
    ],
    calculate: (v) => (v.dHvap / v.R) * (1 / v.T1 - 1 / v.T2)
  },
  {
    id: 'thchem_6',
    name: 'Bond Enthalpy Reaction Estimation',
    topic: 'Thermodynamics',
    subject: 'Chemistry',
    latex: '\\Delta H_{rxn} = \\Sigma B.E._{reactants} - \\Sigma B.E._{products}',
    difficulty: 3,
    unit: 'kJ/mol',
    targetSymbol: '\\Delta H_{rxn}',
    variables: [
      { symbol: 'BE_re1', name: '1× B.E. Reactant Bond 1', unit: 'kJ/mol', range: [200, 600], decimals: 0 },
      { symbol: 'BE_re2', name: '2× B.E. Reactant Bond 2', unit: 'kJ/mol', range: [200, 600], decimals: 0 },
      { symbol: 'BE_pr1', name: '2× B.E. Product Bond 1', unit: 'kJ/mol', range: [200, 600], decimals: 0 },
      { symbol: 'BE_pr2', name: '1× B.E. Product Bond 2', unit: 'kJ/mol', range: [200, 600], decimals: 0 }
    ],
    calculate: (v) => (v.BE_re1 + 2 * v.BE_re2) - (2 * v.BE_pr1 + v.BE_pr2)
  },
  {
    id: 'thchem_7',
    name: 'Entropy Change (Reversible)',
    topic: 'Thermodynamics',
    subject: 'Chemistry',
    latex: '\\Delta S = \\frac{q_{rev}}{T}',
    difficulty: 2,
    unit: 'J/(mol*K)',
    targetSymbol: '\\Delta S',
    variables: [
      { symbol: 'qrev', name: 'Heat Added Reversibly', unit: 'kJ/mol', range: [1.0, 150.0], decimals: 1, toSI: (val) => val * 1000 },
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [100, 800], decimals: 1 }
    ],
    calculate: (v) => v.qrev / v.T
  },

  // --- SOLUTIONS ---
  {
    id: 'col_1',
    name: "Raoult's Law Vapour Pressure",
    topic: 'Solutions',
    subject: 'Chemistry',
    latex: 'P_{solvent} = X_{solvent} P^0_{solvent}',
    difficulty: 2,
    unit: 'torr',
    targetSymbol: 'P_{solvent}',
    variables: [
      { symbol: 'Xsolv', name: 'Mole Fraction Solvent', unit: '', range: [0.5, 0.99], decimals: 3 },
      { symbol: 'P0solv', name: 'Pure Vapour Pressure', unit: 'torr', range: [10, 300], decimals: 1 }
    ],
    calculate: (v) => v.Xsolv * v.P0solv
  },
  {
    id: 'col_2',
    name: 'Relative Lowering of Vapour Pressure',
    topic: 'Solutions',
    subject: 'Chemistry',
    latex: '\\frac{P^0 - P}{P^0} = X_{solute}',
    difficulty: 2,
    unit: '',
    targetSymbol: 'X_{solute}',
    variables: [
      { symbol: 'P0', name: 'Pure Vapour Pressure', unit: 'torr', range: [50, 250], decimals: 1 },
      { symbol: 'P', name: 'Solution Vapour Pressure', unit: 'torr', range: [10, 49], decimals: 1 }
    ],
    calculate: (v) => (v.P0 - v.P) / v.P0
  },
  {
    id: 'col_3',
    name: 'Boiling Point Elevation',
    topic: 'Solutions',
    subject: 'Chemistry',
    latex: '\\Delta T_b = i K_b m',
    difficulty: 3,
    unit: 'K',
    targetSymbol: '\\Delta T_b',
    variables: [
      { symbol: 'i', name: 'van \'t Hoff Factor', unit: '', range: [1, 4], choices: [1, 2, 3, 4] },
      { symbol: 'Kb', name: 'Ebullioscopic Constant', unit: 'K*kg/mol', range: [0.5, 3.5], decimals: 2 },
      { symbol: 'm', name: 'Molality', unit: 'mol/kg', range: [0.01, 5.0], decimals: 3 }
    ],
    calculate: (v) => v.i * v.Kb * v.m
  },
  {
    id: 'col_4',
    name: 'Freezing Point Depression',
    topic: 'Solutions',
    subject: 'Chemistry',
    latex: '\\Delta T_f = i K_f m',
    difficulty: 3,
    unit: 'K',
    targetSymbol: '\\Delta T_f',
    variables: [
      { symbol: 'i', name: 'van \'t Hoff Factor', unit: '', range: [1, 4], choices: [1, 2, 3, 4] },
      { symbol: 'Kf', name: 'Cryoscopic Constant', unit: 'K*kg/mol', range: [1.5, 7.5], decimals: 2 },
      { symbol: 'm', name: 'Molality', unit: 'mol/kg', range: [0.01, 5.0], decimals: 3 }
    ],
    calculate: (v) => v.i * v.Kf * v.m
  },
  {
    id: 'col_5',
    name: 'Osmotic Pressure',
    topic: 'Solutions',
    subject: 'Chemistry',
    latex: '\\pi = i C R T',
    difficulty: 3,
    unit: 'atm',
    targetSymbol: 'pi',
    variables: [
      { symbol: 'i', name: 'van \'t Hoff Factor', unit: '', range: [1, 4], choices: [1, 2, 3, 4] },
      { symbol: 'C', name: 'Molarity', unit: 'M', range: [0.001, 2.0], decimals: 3 },
      { symbol: 'R', name: 'Gas Constant', isConstant: false, staticValue: 0.0821 }, // L*atm/(mol*K)
      { symbol: 'T', name: 'Temperature', unit: 'K', range: [273, 373], decimals: 1 }
    ],
    calculate: (v) => v.i * v.C * v.R * v.T
  },

  // --- NUCLEAR & RADIOCHEMISTRY ---
  {
    id: 'nuc_1',
    name: 'First-Order Radioactive Remaining Amount',
    topic: 'Radiochemistry',
    subject: 'Chemistry',
    latex: 'N = N_0 e^{-\\lambda t}',
    difficulty: 4,
    unit: 'g',
    targetSymbol: 'N',
    variables: [
      { symbol: 'N0', name: 'Initial Mass', unit: 'g', range: [0.1, 50.0], decimals: 2 },
      { symbol: 'lambda', name: 'Decay Constant', unit: 'yr⁻¹', range: [1e-4, 0.1], decimals: 0, scientific: true },
      { symbol: 't', name: 'Time elapsed', unit: 'yr', range: [1, 1000], decimals: 1 }
    ],
    calculate: (v) => v.N0 * Math.exp(-v.lambda * v.t)
  },
  {
    id: 'nuc_2',
    name: 'Radioactive Half-Life',
    topic: 'Radiochemistry',
    subject: 'Chemistry',
    latex: 't_{1/2} = \\frac{0.693}{\\lambda}',
    difficulty: 2,
    unit: 's',
    targetSymbol: 't_{1/2}',
    variables: [
      { symbol: 'lambda', name: 'Decay Constant', unit: 's⁻¹', range: [1e-6, 0.5], decimals: 0, scientific: true }
    ],
    calculate: (v) => 0.693 / v.lambda
  },
  {
    id: 'nuc_3',
    name: 'Binding Energy (from Mass Defect)',
    topic: 'Radiochemistry',
    subject: 'Chemistry',
    latex: 'E = \\Delta m \\cdot 931.5',
    difficulty: 2,
    unit: 'MeV',
    targetSymbol: 'E',
    variables: [
      { symbol: 'deltam', name: 'Mass Defect', unit: 'amu', range: [0.005, 0.9], decimals: 4 }
    ],
    calculate: (v) => v.deltam * 931.5
  },
  {
    id: 'nuc_4',
    name: 'Binding Energy per Nucleon',
    topic: 'Radiochemistry',
    subject: 'Chemistry',
    latex: 'E_{nucleon} = \\frac{\\Delta m \\cdot 931.5}{A}',
    difficulty: 3,
    unit: 'MeV/nucleon',
    targetSymbol: 'E_{nucleon}',
    variables: [
      { symbol: 'deltam', name: 'Mass Defect', unit: 'amu', range: [0.05, 1.8], decimals: 4 },
      { symbol: 'A', name: 'Mass Number (Nucleons)', unit: '', range: [4, 238], integer: true }
    ],
    calculate: (v) => (v.deltam * 931.5) / v.A
  },
  {
    id: 'nuc_5',
    name: 'Nuclear Radius Calculation',
    topic: 'Radiochemistry',
    subject: 'Chemistry',
    latex: 'R = R_0 A^{1/3}',
    difficulty: 3,
    unit: 'fm',
    targetSymbol: 'R',
    variables: [
      { symbol: 'R0', name: 'Radius Constant', unit: 'fm', isConstant: false, staticValue: 1.2 }, // 1.2 fm
      { symbol: 'A', name: 'Mass Number', unit: '', range: [8, 240], integer: true }
    ],
    calculate: (v) => v.R0 * Math.cbrt(v.A)
  },

  // --- BUFFER & ACID-BASE ---
  {
    id: 'buf_1',
    name: 'Henderson-Hasselbalch (Acidic Buffer pH)',
    topic: 'Buffer Solutions',
    subject: 'Chemistry',
    latex: 'pH = pK_a + \\log_{10}\\left(\\frac{[Salt]}{[Acid]}\\right)',
    difficulty: 4,
    unit: '',
    targetSymbol: 'pH',
    variables: [
      { symbol: 'pKa', name: 'pK_a of Weak Acid', unit: '', range: [2.5, 6.5], decimals: 2 },
      { symbol: 'salt', name: 'Salt Concentration', unit: 'M', range: [0.01, 1.0], decimals: 3 },
      { symbol: 'acid', name: 'Acid Concentration', unit: 'M', range: [0.01, 1.0], decimals: 3 }
    ],
    calculate: (v) => v.pKa + Math.log10(v.salt / v.acid)
  },
  {
    id: 'buf_2',
    name: 'Degree of Dissociation (Ostwald Dilution)',
    topic: 'Acid-Base Equilibrium',
    subject: 'Chemistry',
    latex: '\\alpha = \\sqrt{\\frac{K_a}{C}}',
    difficulty: 4,
    unit: '',
    targetSymbol: 'alpha',
    variables: [
      { symbol: 'Ka', name: 'Dissociation Constant', unit: 'M', range: [1e-6, 1e-3], decimals: 0, scientific: true },
      { symbol: 'C', name: 'Concentration', unit: 'M', range: [0.01, 0.5], decimals: 3 }
    ],
    calculate: (v) => Math.sqrt(v.Ka / v.C)
  },
  {
    id: 'buf_3',
    name: 'pH of Strong Acid',
    topic: 'Acid-Base Equilibrium',
    subject: 'Chemistry',
    latex: 'pH = -\\log_{10}[H^+]',
    difficulty: 2,
    unit: '',
    targetSymbol: 'pH',
    variables: [
      { symbol: 'H', name: 'Hydrogen Ion Concentration', unit: 'M', range: [1e-5, 0.1], decimals: 0, scientific: true }
    ],
    calculate: (v) => -Math.log10(v.H)
  },
  {
    id: 'buf_4',
    name: 'pH of Weak Monoprotic Acid',
    topic: 'Acid-Base Equilibrium',
    subject: 'Chemistry',
    latex: 'pH = \\frac{1}{2}(pK_a - \\log_{10}(C))',
    difficulty: 4,
    unit: '',
    targetSymbol: 'pH',
    variables: [
      { symbol: 'pKa', name: 'pK_a of Weak Acid', unit: '', range: [3.0, 7.0], decimals: 2 },
      { symbol: 'C', name: 'Concentration of Acid', unit: 'M', range: [0.001, 0.5], decimals: 3 }
    ],
    calculate: (v) => 0.5 * (v.pKa - Math.log10(v.C))
  },
  {
    id: 'buf_5',
    name: 'Hydroxide Concentration from pH',
    topic: 'Acid-Base Equilibrium',
    subject: 'Chemistry',
    latex: '[OH^-] = 10^{-(14 - pH)}',
    difficulty: 2,
    unit: 'M',
    targetSymbol: '[OH^-]',
    variables: [
      { symbol: 'pH', name: 'pH Value', unit: '', range: [1.0, 13.0], decimals: 1 }
    ],
    calculate: (v) => Math.pow(10, -(14 - v.pH))
  }
];

// Returns a random formula, using weighted distribution proportional to difficulty^2
export function getWeightedFormula() {
  const weighted = [];
  for (const formula of FORMULAS) {
    const weight = formula.difficulty * formula.difficulty; // difficulty^2 weightage
    for (let i = 0; i < weight; i++) {
      weighted.push(formula);
    }
  }
  const randomIndex = Math.floor(Math.random() * weighted.length);
  return weighted[randomIndex];
}

// Formats a float to a specific number of decimals or scientific notation
function formatValueForDisplay(val, variable) {
  if (variable.choices) {
    return val.toString();
  }
  if (variable.integer) {
    return Math.round(val).toString();
  }
  if (variable.scientific) {
    return val.toExponential(1); // Standard short sci notation format like 1.2e+5
  }
  return val.toFixed(variable.decimals !== undefined ? variable.decimals : 2);
}

// Generate values for variables in a formula
export function generateProblem(formula, jeeMode = true) {
  const givenVariables = [];
  const calculationInputs = {};

  for (const variable of formula.variables) {
    let rawVal;
    
    if (variable.isConstant) {
      // Look up in global constants
      const constantEntry = CONSTANTS[variable.symbol];
      rawVal = jeeMode ? constantEntry.jee : constantEntry.si;
      calculationInputs[variable.symbol] = rawVal;
      
      // Constants are displayed as scientific if extremely small/large
      const displayValStr = (rawVal < 1e-3 || rawVal > 1e4) ? rawVal.toExponential(3) : rawVal.toString();
      givenVariables.push({
        symbol: variable.symbol,
        name: variable.name,
        unit: variable.unit || '',
        displayValue: displayValStr,
        isConstant: true
      });
    } else if (variable.staticValue !== undefined) {
      rawVal = variable.staticValue;
      calculationInputs[variable.symbol] = rawVal;
      givenVariables.push({
        symbol: variable.symbol,
        name: variable.name,
        unit: variable.unit || '',
        displayValue: rawVal.toString(),
        isConstant: false
      });
    } else {
      // Randomly generate within range
      if (variable.choices) {
        const idx = Math.floor(Math.random() * variable.choices.length);
        rawVal = variable.choices[idx];
      } else if (variable.integer) {
        rawVal = Math.floor(Math.random() * (variable.range[1] - variable.range[0] + 1)) + variable.range[0];
      } else {
        rawVal = Math.random() * (variable.range[1] - variable.range[0]) + variable.range[0];
      }

      // Format to a readable string (mimicking textbook rounding)
      const displayValueStr = formatValueForDisplay(rawVal, variable);
      const parsedDisplayVal = parseFloat(displayValueStr); // Use EXACT displayed value for calculation inputs

      // Convert to SI for calculation inputs if needed
      let siVal = parsedDisplayVal;
      if (variable.toSI) {
        siVal = variable.toSI(parsedDisplayVal);
      }
      calculationInputs[variable.symbol] = siVal;

      givenVariables.push({
        symbol: variable.symbol,
        name: variable.name,
        unit: variable.unit || '',
        displayValue: displayValueStr,
        isConstant: false
      });
    }
  }

  // Calculate the exact target value
  let answerVal;
  try {
    answerVal = formula.calculate(calculationInputs);
  } catch (err) {
    answerVal = NaN;
  }

  // Handle display units conversion or special formatting for target if specified
  let finalAnswer = answerVal;

  return {
    id: formula.id,
    name: formula.name,
    topic: formula.topic,
    subject: formula.subject,
    latex: formula.latex,
    difficulty: formula.difficulty,
    unit: formula.unit || '',
    targetSymbol: formula.targetSymbol,
    variables: givenVariables,
    answer: finalAnswer
  };
}
