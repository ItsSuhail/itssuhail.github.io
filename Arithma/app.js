// app.js - Main Controller for Arithma JEE practice app

import { getWeightedFormula, generateProblem } from './formulas.js';
import { generateArithmeticProblem } from './arithmetic.js';

// Application State
const state = {
  mode: 'formula', // 'formula' | 'arithmetic'
  session: {
    score: 0,
    streak: 0,
    bestStreak: 0,
    questionsAnswered: 0,
    correctCount: 0, // < 5% error counts as correct
    totalTime: 0,
    avgTime: 0
  },
  current: {
    formula: null, // formula object (only in formula mode)
    problem: null, // problem object: { id/latex, answer, variables, unit, targetSymbol }
    startTime: null,
    timerInterval: null,
    currentTime: 0.0
  },
  history: [], // persisted in localStorage
  settings: {
    difficulty: 3,
    jeeMode: true,
    autoAdvance: true
  }
};

// Next question auto-advance timer
let autoAdvanceTimeout = null;
let autoAdvanceInterval = null;
const AUTO_ADVANCE_DURATION = 4000; // 4 seconds

// DOM elements cache
const DOM = {};

function initDOMElements() {
  DOM.modeFormula = document.getElementById('mode-formula');
  DOM.modeArithmetic = document.getElementById('mode-arithmetic');

  DOM.statScore = document.getElementById('stat-score');
  DOM.statStreak = document.getElementById('stat-streak');
  DOM.statAccuracy = document.getElementById('stat-accuracy');
  DOM.statBestStreak = document.getElementById('stat-best-streak');
  DOM.statAvgTime = document.getElementById('stat-avg-time');

  DOM.challengeCard = document.getElementById('challenge-card');
  DOM.screenQuestion = document.getElementById('screen-question');
  DOM.screenResult = document.getElementById('screen-result');
  DOM.screenStart = document.getElementById('screen-start');
  DOM.btnStartTimer = document.getElementById('btn-start-timer');

  DOM.badgeSubject = document.getElementById('badge-subject');
  DOM.topicLabel = document.getElementById('topic-label');
  DOM.difficultyDots = document.getElementById('difficulty-dots');
  DOM.mathDisplay = document.getElementById('math-display');
  DOM.variablesSection = document.getElementById('variables-section');
  DOM.variablesContainer = document.getElementById('variables-container');
  DOM.targetPrompt = document.getElementById('target-prompt');
  DOM.timerVal = document.getElementById('timer-val');

  DOM.inputMantissa = document.getElementById('input-mantissa');
  DOM.inputExponent = document.getElementById('input-exponent');
  DOM.unitLabel = document.getElementById('unit-label');
  DOM.livePreview = document.getElementById('live-preview');
  DOM.btnSubmit = document.getElementById('btn-submit');

  DOM.resultStatusHeader = document.getElementById('result-status-header');
  DOM.resultBadge = document.getElementById('result-badge');
  DOM.resultAccuracyDesc = document.getElementById('result-accuracy-desc');
  DOM.compareUser = document.getElementById('compare-user');
  DOM.compareExact = document.getElementById('compare-exact');
  DOM.resTime = document.getElementById('res-time');
  DOM.resPoints = document.getElementById('res-points');
  DOM.explanationBanner = document.getElementById('explanation-banner');
  DOM.btnNext = document.getElementById('btn-next');
  DOM.countdownBar = document.getElementById('countdown-bar');

  DOM.historyList = document.getElementById('history-list');
  DOM.btnClearHistory = document.getElementById('btn-clear-history');

  DOM.btnSettings = document.getElementById('btn-settings');
  DOM.settingsModal = document.getElementById('settings-modal');
  DOM.settingsClose = document.getElementById('settings-close');
  DOM.settingJeeMode = document.getElementById('setting-jee-mode');
  DOM.settingAutoAdvance = document.getElementById('setting-auto-advance');
  DOM.btnResetStats = document.getElementById('btn-reset-stats');

  DOM.toast = document.getElementById('toast');
}

// Format number into short scientific notation for display
function toSciNotation(num) {
  if (num === 0) return '0.00 \\times 10^0';
  const exponent = Math.floor(Math.log10(Math.abs(num)));
  const mantissa = num / Math.pow(10, exponent);
  return `${mantissa.toFixed(3)} \\times 10^{${exponent}}`;
}

// Convert input values back into a single float
function parseUserInput() {
  const mantissa = parseFloat(DOM.inputMantissa.value);
  const exponent = parseInt(DOM.inputExponent.value) || 0;
  if (isNaN(mantissa)) return NaN;
  return mantissa * Math.pow(10, exponent);
}

// Updates the live preview text as user types
function updateLivePreview() {
  const mantissaVal = DOM.inputMantissa.value;
  const exponentVal = DOM.inputExponent.value || '0';

  if (mantissaVal === '') {
    DOM.livePreview.innerText = 'Preview: —';
    return;
  }

  const m = parseFloat(mantissaVal);
  const e = parseInt(exponentVal);

  if (isNaN(m) || isNaN(e)) {
    DOM.livePreview.innerText = 'Preview: Invalid numbers';
    return;
  }

  const val = m * Math.pow(10, e);
  const unit = state.mode === 'formula' ? state.current.problem.unit : '';
  const unitText = unit ? ` ${unit}` : '';

  if (window.katex) {
    try {
      const expStr = e === 0 ? '' : ` \\times 10^{${e}}`;
      const unitLatex = unit ? ` \\text{ }\\text{${unit}}` : '';
      const latex = `\\text{Preview: } ${m}${expStr}${unitLatex} \\approx ${toSciNotation(val)}${unitLatex}`;
      window.katex.render(latex, DOM.livePreview, {
        throwOnError: false,
        displayMode: false
      });
      return;
    } catch (err) {
      // fallback
    }
  }

  DOM.livePreview.innerText = `Preview: ${m} × 10^{${e}}${unitText} (≈ ${val.toExponential(3)}${unitText})`;
}

// Display Toast notifications
function showToast(msg) {
  DOM.toast.innerText = msg;
  DOM.toast.classList.add('show');
  setTimeout(() => {
    DOM.toast.classList.remove('show');
  }, 2500);
}

// Save data to localStorage
function saveSession() {
  localStorage.setItem('arithma_session_v1', JSON.stringify({
    session: state.session,
    settings: state.settings,
    history: state.history,
    mode: state.mode
  }));
}

// Load data from localStorage
function loadSession() {
  const data = localStorage.getItem('arithma_session_v1');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.session) state.session = parsed.session;
      if (parsed.settings) state.settings = parsed.settings;
      if (parsed.history) state.history = parsed.history;
      if (parsed.mode) state.mode = parsed.mode;
    } catch (e) {
      console.error('Error loading session from localStorage', e);
    }
  }
}

// Render Stats Header Bar
function updateStatsUI() {
  DOM.statScore.innerText = state.session.score;
  DOM.statStreak.innerText = state.session.streak;
  DOM.statBestStreak.innerText = state.session.bestStreak;
  DOM.statAvgTime.innerText = `${state.session.avgTime.toFixed(1)}s`;

  let accuracy = 0;
  if (state.session.questionsAnswered > 0) {
    accuracy = Math.round((state.session.correctCount / state.session.questionsAnswered) * 100);
  }
  DOM.statAccuracy.innerText = `${accuracy}%`;
}

// Render Difficulty Indicator dots in card
function renderDifficultyDots(diff) {
  DOM.difficultyDots.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const dot = document.createElement('span');
    dot.className = i <= diff ? 'difficulty-dot filled' : 'difficulty-dot';
    DOM.difficultyDots.appendChild(dot);
  }
}

// Start question timer
function startTimer() {
  clearInterval(state.current.timerInterval);
  state.current.currentTime = 0.0;
  DOM.timerVal.innerText = '0.0';
  state.current.startTime = Date.now();

  state.current.timerInterval = setInterval(() => {
    state.current.currentTime = (Date.now() - state.current.startTime) / 1000;
    DOM.timerVal.innerText = state.current.currentTime.toFixed(1);
  }, 100);
}

// Stop question timer
function stopTimer() {
  clearInterval(state.current.timerInterval);
  return state.current.currentTime;
}

// Clear auto-advance timers
function clearAutoAdvance() {
  clearTimeout(autoAdvanceTimeout);
  clearInterval(autoAdvanceInterval);
  DOM.countdownBar.style.transform = 'scaleX(1)';
}

// Load a new challenge question
function loadNewQuestion() {
  clearAutoAdvance();

  // Clean inputs
  DOM.inputMantissa.value = '';
  DOM.inputExponent.value = '';
  DOM.livePreview.innerText = 'Preview: —';

  // Transition card back to question screen
  DOM.screenResult.style.display = 'none';
  DOM.screenQuestion.style.display = 'flex';
  DOM.challengeCard.className = 'card-stage question-showing';

  if (state.mode === 'formula') {
    // FORMULA MODE
    const formula = getWeightedFormula();
    const problem = generateProblem(formula, state.settings.jeeMode);

    state.current.formula = formula;
    state.current.problem = problem;

    // UI meta
    DOM.badgeSubject.innerText = formula.subject;
    DOM.badgeSubject.className = `badge-subject ${formula.subject.toLowerCase()}`;
    DOM.topicLabel.innerText = `${formula.topic}`;
    renderDifficultyDots(formula.difficulty);

    // Math display via KaTeX
    // Add display mode
    try {
      window.katex.render(formula.latex, DOM.mathDisplay, {
        throwOnError: false,
        displayMode: true
      });
    } catch (e) {
      DOM.mathDisplay.innerHTML = `\\[ ${formula.latex} \\]`;
    }

    // Render variables
    DOM.variablesSection.style.display = 'block';
    DOM.variablesContainer.innerHTML = '';

    problem.variables.forEach(v => {
      const card = document.createElement('div');
      card.className = v.isConstant ? 'variable-card constant' : 'variable-card';

      const vUnitStr = v.unit ? ` ${v.unit}` : '';
      card.innerHTML = `
        <div class="variable-info">
          <span class="variable-symbol-name"><span>${v.symbol}</span></span>
          <span class="variable-desc">${v.name}</span>
        </div>
        <div class="variable-value-unit ${v.isConstant ? 'const-val' : ''}">
          ${v.displayValue}${vUnitStr}
        </div>
      `;
      DOM.variablesContainer.appendChild(card);
    });

    // Prompt
    DOM.targetPrompt.innerHTML = `Find <span class="target-highlight">${problem.targetSymbol}</span> in:`;
    DOM.unitLabel.innerText = problem.unit || '(dimensionless)';
    DOM.unitLabel.style.display = 'inline';

  } else {
    // ARITHMETIC MODE
    const problem = generateArithmeticProblem(state.settings.difficulty);
    state.current.formula = null;
    state.current.problem = problem;

    // UI meta
    DOM.badgeSubject.innerText = 'Arithmetic';
    DOM.badgeSubject.className = 'badge-subject arithmetic';
    DOM.topicLabel.innerText = 'Arithmetic Precision Drill';
    renderDifficultyDots(problem.difficulty);

    // Math display via KaTeX
    try {
      window.katex.render(problem.latex, DOM.mathDisplay, {
        throwOnError: false,
        displayMode: true
      });
    } catch (e) {
      DOM.mathDisplay.innerHTML = `\\[ ${problem.latex} \\]`;
    }

    // Hide variables table in arithmetic mode
    DOM.variablesSection.style.display = 'none';

    // Prompt
    DOM.targetPrompt.innerHTML = 'Evaluate the expression:';
    DOM.unitLabel.innerText = '';
    DOM.unitLabel.style.display = 'none';
  }

  // Show start screen, hide question screen
  DOM.screenQuestion.style.display = 'none';
  DOM.screenStart.style.display = 'flex';
  DOM.btnStartTimer.focus();

  // Re-trigger lucide icons
  window.lucide.createIcons();
}

// Start the practice timer and reveal the question
function startPracticeTimer() {
  DOM.screenStart.style.display = 'none';
  DOM.screenQuestion.style.display = 'flex';
  startTimer();
  DOM.inputMantissa.focus();
}

// Evaluate correctness and render Result Panel
function submitAnswer() {
  const timeTaken = stopTimer();
  const userAns = parseUserInput();
  const exactAns = state.current.problem.answer;

  if (isNaN(userAns)) {
    showToast('Please enter a valid mantissa value.');
    startTimer(); // resume timer
    return;
  }

  // Calculate relative error percentage
  let errorPct = 0;
  if (exactAns === 0) {
    errorPct = userAns === 0 ? 0 : 100;
  } else {
    errorPct = Math.abs((userAns - exactAns) / exactAns) * 100;
  }

  // Evaluate precision tier based on Mode
  let tier = '';
  let statusClass = '';
  let feedbackMessage = '';

  if (state.mode === 'arithmetic') {
    // Pure arithmetic tolerances
    if (errorPct < 0.2) {
      tier = 'exact';
      statusClass = 'status-exact';
      feedbackMessage = '🎯 Perfect! (Exact)';
    } else if (errorPct < 1.0) {
      tier = 'precise';
      statusClass = 'status-precise';
      feedbackMessage = '✅ Highly Precise';
    } else if (errorPct < 3.0) {
      tier = 'close';
      statusClass = 'status-close';
      feedbackMessage = '🟡 Close Enough';
    } else if (errorPct < 10.0) {
      tier = 'off';
      statusClass = 'status-off';
      feedbackMessage = '🟠 Slightly Off';
    } else {
      tier = 'miss';
      statusClass = 'status-miss';
      feedbackMessage = '❌ Calculation Miss';
    }
  } else {
    // Formula tolerances
    if (errorPct < 0.5) {
      tier = 'exact';
      statusClass = 'status-exact';
      feedbackMessage = '🎯 Perfect! (Exact)';
    } else if (errorPct < 2.0) {
      tier = 'precise';
      statusClass = 'status-precise';
      feedbackMessage = '✅ Highly Precise';
    } else if (errorPct < 5.0) {
      tier = 'close';
      statusClass = 'status-close';
      feedbackMessage = '🟡 Acceptable Precision';
    } else if (errorPct < 15.0) {
      tier = 'off';
      statusClass = 'status-off';
      feedbackMessage = '🟠 Out of Range';
    } else {
      tier = 'miss';
      statusClass = 'status-miss';
      feedbackMessage = '❌ Precision Miss';
    }
  }

  // Scoring parameters
  const isCorrect = errorPct < 5.0; // counts as correct if under 5% error
  const difficulty = state.mode === 'formula' ? state.current.formula.difficulty : state.current.problem.difficulty;

  let pointsGained = 0;
  if (isCorrect) {
    // Base score + time speed bonus * error multiplier * streak multiplier
    const basePoints = difficulty * 100;
    const timeBonus = Math.max(0, 30 - timeTaken) * difficulty * 5;
    const errorMult = Math.max(0, 1 - errorPct / 5); // 0% error -> 1x, 5% error -> 0x
    const streakMult = 1 + Math.min(state.session.streak, 10) * 0.1; // up to 2.0x

    pointsGained = Math.round((basePoints + timeBonus) * errorMult * streakMult);
  }

  // Update state stats
  state.session.questionsAnswered++;
  state.session.totalTime += timeTaken;
  state.session.avgTime = state.session.totalTime / state.session.questionsAnswered;

  if (isCorrect) {
    state.session.correctCount++;
    state.session.streak++;
    state.session.score += pointsGained;
    if (state.session.streak > state.session.bestStreak) {
      state.session.bestStreak = state.session.streak;
    }

    // Confetti effect for exact/perfect scores
    if (tier === 'exact') {
      window.confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  } else {
    state.session.streak = 0; // break streak
  }

  // Render results panel
  DOM.resultStatusHeader.className = `result-status-header ${statusClass}`;
  DOM.resultBadge.innerText = feedbackMessage;
  DOM.resultAccuracyDesc.innerText = errorPct === 0 ? '0.00% error' : `${errorPct.toFixed(3)}% error`;

  // Scientific comparisons
  DOM.compareUser.innerHTML = `\\[ ${toSciNotation(userAns)} \\]`;
  DOM.compareExact.innerHTML = `\\[ ${toSciNotation(exactAns)} \\]`;

  // Render LaTeX in results compare container
  if (window.katex) {
    window.katex.render(toSciNotation(userAns), DOM.compareUser, { throwOnError: false });
    window.katex.render(toSciNotation(exactAns), DOM.compareExact, { throwOnError: false });
  }

  DOM.resTime.innerText = `${timeTaken.toFixed(1)}s`;
  DOM.resPoints.innerText = isCorrect ? `+${pointsGained} pts` : '+0 pts';
  DOM.resPoints.className = isCorrect ? 'res-stat-value points-positive' : 'res-stat-value';

  // Formula explanation
  if (state.mode === 'formula') {
    DOM.explanationBanner.style.display = 'block';
    DOM.explanationBanner.innerText = `Topic: ${state.current.formula.topic}. This formula determines ${state.current.formula.name} in ${state.current.problem.unit}.`;
  } else {
    DOM.explanationBanner.style.display = 'none';
  }

  // Swap screens
  DOM.screenQuestion.style.display = 'none';
  DOM.screenResult.style.display = 'flex';
  DOM.challengeCard.className = 'card-stage';

  // Log attempt to history list
  const historyItem = {
    title: state.mode === 'formula' ? state.current.formula.name : `Arithmetic Drill (L${difficulty})`,
    error: errorPct,
    tier: tier,
    time: timeTaken,
    mode: state.mode,
    timestamp: Date.now()
  };
  state.history.unshift(historyItem);
  if (state.history.length > 50) state.history.pop(); // keep last 50

  renderHistoryUI();
  updateStatsUI();
  saveSession();

  // Auto-advance logic
  if (state.settings.autoAdvance) {
    clearAutoAdvance();

    let timeLeft = AUTO_ADVANCE_DURATION;
    DOM.countdownBar.style.transform = 'scaleX(1)';

    autoAdvanceInterval = setInterval(() => {
      timeLeft -= 50;
      const progress = timeLeft / AUTO_ADVANCE_DURATION;
      DOM.countdownBar.style.transform = `scaleX(${progress})`;
    }, 50);

    autoAdvanceTimeout = setTimeout(() => {
      loadNewQuestion();
    }, AUTO_ADVANCE_DURATION);
  }

  // Trigger icons update
  window.lucide.createIcons();
}

// Render attempt history list in sidebar
function renderHistoryUI() {
  if (state.history.length === 0) {
    DOM.historyList.innerHTML = '<div class="history-empty">No attempts yet. Start practicing!</div>';
    return;
  }

  DOM.historyList.innerHTML = '';
  state.history.forEach(item => {
    const card = document.createElement('div');
    card.className = `history-item tier-${item.tier}`;

    let tierText = '';
    let tierClass = '';

    switch (item.tier) {
      case 'exact':
        tierText = 'Exact';
        tierClass = 'err-exact';
        break;
      case 'precise':
        tierText = 'Precise';
        tierClass = 'err-precise';
        break;
      case 'close':
        tierText = 'Close';
        tierClass = 'err-close';
        break;
      case 'off':
        tierText = 'Off';
        tierClass = 'err-off';
        break;
      case 'miss':
        tierText = 'Miss';
        tierClass = 'err-miss';
        break;
    }

    const timeFormatted = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    card.innerHTML = `
      <div class="history-top">
        <span class="history-title" title="${item.title}">${item.title}</span>
        <span class="history-time-badge">${timeFormatted}</span>
      </div>
      <div class="history-mid">
        <span class="history-ans"><i data-lucide="clock" size="10"></i> ${item.time.toFixed(1)}s</span>
        <span class="history-err ${tierClass}">${tierText} (${item.error.toFixed(2)}%)</span>
      </div>
    `;
    DOM.historyList.appendChild(card);
  });

  window.lucide.createIcons();
}

// Clear attempts history log
function clearHistory() {
  state.history = [];
  renderHistoryUI();
  saveSession();
  showToast('History cleared.');
}

// Reset stats back to zero
function resetStats() {
  state.session = {
    score: 0,
    streak: 0,
    bestStreak: 0,
    questionsAnswered: 0,
    correctCount: 0,
    totalTime: 0,
    avgTime: 0
  };
  updateStatsUI();
  saveSession();
  showToast('Statistics reset.');
}

// Setup Event Listeners
function setupEvents() {
  // Mode Selection
  DOM.modeFormula.addEventListener('click', () => {
    if (state.mode !== 'formula') {
      DOM.modeFormula.classList.add('active');
      DOM.modeArithmetic.classList.remove('active');
      state.mode = 'formula';
      saveSession();
      loadNewQuestion();
    }
  });

  DOM.modeArithmetic.addEventListener('click', () => {
    if (state.mode !== 'arithmetic') {
      DOM.modeArithmetic.classList.add('active');
      DOM.modeFormula.classList.remove('active');
      state.mode = 'arithmetic';
      saveSession();
      loadNewQuestion();
    }
  });

  // Submit and next buttons
  DOM.btnSubmit.addEventListener('click', submitAnswer);
  DOM.btnNext.addEventListener('click', loadNewQuestion);
  DOM.btnStartTimer.addEventListener('click', startPracticeTimer);

  // Form input interactions
  const triggerSubmitOnEnter = (e) => {
    if (e.key === 'Enter') {
      if (DOM.screenQuestion.style.display === 'flex') {
        submitAnswer();
      } else if (DOM.screenStart.style.display === 'flex') {
        startPracticeTimer();
      } else {
        loadNewQuestion();
      }
    }
  };

  DOM.inputMantissa.addEventListener('keydown', triggerSubmitOnEnter);
  DOM.inputExponent.addEventListener('keydown', triggerSubmitOnEnter);

  DOM.inputMantissa.addEventListener('input', updateLivePreview);
  DOM.inputExponent.addEventListener('input', updateLivePreview);

  // Global keydown handler for Enter key navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      // If focused element is a button, let the default click event handle it
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
        return;
      }
      if (DOM.screenStart.style.display === 'flex') {
        startPracticeTimer();
        e.preventDefault();
      } else if (DOM.screenResult.style.display === 'flex') {
        loadNewQuestion();
        e.preventDefault();
      }
    }
  });

  // Sidebar Clear History button
  DOM.btnClearHistory.addEventListener('click', clearHistory);

  // Settings modal open/close
  DOM.btnSettings.addEventListener('click', () => {
    // Populate settings UI from state
    DOM.settingJeeMode.checked = state.settings.jeeMode;
    DOM.settingAutoAdvance.checked = state.settings.autoAdvance;

    // Highlight active difficulty button
    document.querySelectorAll('.btn-diff').forEach(btn => {
      const d = parseInt(btn.innerText);
      btn.className = d === state.settings.difficulty ? 'btn-diff active' : 'btn-diff';
    });

    DOM.settingsModal.classList.add('open');
  });

  DOM.settingsClose.addEventListener('click', () => {
    DOM.settingsModal.classList.remove('open');
  });

  // Close settings when clicking outside modal
  DOM.settingsModal.addEventListener('click', (e) => {
    if (e.target === DOM.settingsModal) {
      DOM.settingsModal.classList.remove('open');
    }
  });

  // Difficulty buttons
  document.querySelectorAll('.btn-diff').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const diff = parseInt(e.target.innerText);
      state.settings.difficulty = diff;

      // Update UI
      document.querySelectorAll('.btn-diff').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      saveSession();
      showToast(`Difficulty set to Level ${diff}`);
      loadNewQuestion(); // refresh question with new difficulty
    });
  });

  // Setting triggers
  DOM.settingJeeMode.addEventListener('change', (e) => {
    state.settings.jeeMode = e.target.checked;
    saveSession();
    showToast(`JEE Approximations: ${state.settings.jeeMode ? 'Enabled' : 'Disabled'}`);
    loadNewQuestion(); // Reload question with new approximation mode
  });

  DOM.settingAutoAdvance.addEventListener('change', (e) => {
    state.settings.autoAdvance = e.target.checked;
    saveSession();
    clearAutoAdvance();
  });

  // Reset Stats button
  DOM.btnResetStats.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all score and accuracy statistics? This cannot be undone.')) {
      resetStats();
      DOM.settingsModal.classList.remove('open');
    }
  });
}

// Initialise App
function init() {
  initDOMElements();
  loadSession();
  setupEvents();

  // Active state mode toggles
  if (state.mode === 'arithmetic') {
    DOM.modeArithmetic.classList.add('active');
    DOM.modeFormula.classList.remove('active');
  } else {
    DOM.modeFormula.classList.add('active');
    DOM.modeArithmetic.classList.remove('active');
  }

  updateStatsUI();
  renderHistoryUI();

  // Initialize Lucide Icons
  window.lucide.createIcons();

  // Load first challenge question
  loadNewQuestion();
}

// Launch on page load
window.addEventListener('DOMContentLoaded', init);
