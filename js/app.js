/* ==========================================================================
   QuizSystem - Main Application Engine
   Manages UI, Quiz State, Timer, Navigation, Question Palette, & Events
   ========================================================================== */

// Global State Object
const QuizState = {
    playerName: "",
    categoryKey: "java",
    categoryName: "Java",
    difficulty: "Easy",
    questionLimit: 10,
    timeLimitSeconds: 300, // default 5 mins
    remainingSeconds: 300,
    timerInterval: null,
    startTime: null,
    
    questions: [],        // Active randomized questions
    currentIndex: 0,      // Active question index (0..N-1)
    userAnswers: {},      // Map of { questionId: selectedOptionIndex }
    isSubmitted: false
};

// Category Display Names Mapping
const CATEGORY_NAMES = {
    java: "Java",
    html_css: "HTML & CSS",
    javascript: "JavaScript",
    dbms: "DBMS",
    oop: "OOP",
    cs: "Computer Science"
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Theme
    StorageEngine.initTheme();

    // 2. Load Saved Player Name into setup form
    const savedName = StorageEngine.getLastPlayerName();
    const nameInput = document.getElementById("setupPlayerName");
    if (nameInput && savedName) {
        nameInput.value = savedName;
    }

    // 3. Render Views
    renderLeaderboard();
    renderHistory();
    renderUserDashboard();

    // 4. Setup Event Listeners
    setupEventListeners();
});

/**
 * Event Listeners & Navigation Setup
 */
function setupEventListeners() {
    // Theme Toggle
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const currentTheme = StorageEngine.getTheme();
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            StorageEngine.setTheme(newTheme);
            updateThemeIcon(newTheme);
        });
        updateThemeIcon(StorageEngine.getTheme());
    }

    // Mobile Hamburger Navigation Toggle
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");
    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });

        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
            });
        });
    }

    // FAQ Expandable Accordion
    document.querySelectorAll(".faq-question").forEach(q => {
        q.addEventListener("click", () => {
            const item = q.parentElement;
            item.classList.toggle("active");
        });
    });
}

function updateThemeIcon(theme) {
    const iconSpan = document.getElementById("themeIcon");
    if (iconSpan) {
        iconSpan.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

/**
 * Pre-select Category from Category Cards & Scroll to Setup
 */
function selectCategoryAndSetup(catKey) {
    const catSelect = document.getElementById("setupCategory");
    if (catSelect) {
        catSelect.value = catKey;
    }

    const setupSection = document.getElementById("quizSetupSection");
    if (setupSection) {
        setupSection.style.display = "block";
        setupSection.scrollIntoView({ behavior: "smooth" });
    }
}

/**
 * Open Quiz Setup Modal / Section directly
 */
function openQuizSetup() {
    const setupSection = document.getElementById("quizSetupSection");
    if (setupSection) {
        setupSection.style.display = "block";
        setupSection.scrollIntoView({ behavior: "smooth" });
    }
}

/**
 * Utility: Fisher-Yates Shuffle Algorithm for Randomization
 */
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Start Quiz Execution
 */
function startQuiz(event) {
    if (event) event.preventDefault();

    // 1. Validate Form Inputs
    const nameInput = document.getElementById("setupPlayerName");
    const catSelect = document.getElementById("setupCategory");
    const diffSelect = document.getElementById("setupDifficulty");
    const countSelect = document.getElementById("setupCount");
    const timerSelect = document.getElementById("setupTimer");

    const playerName = nameInput ? nameInput.value.trim() : "";
    if (!playerName) {
        alert("Please enter your name to start the quiz.");
        if (nameInput) nameInput.focus();
        return;
    }

    const catKey = catSelect ? catSelect.value : "java";
    const difficulty = diffSelect ? diffSelect.value : "Easy";
    const count = countSelect ? parseInt(countSelect.value, 10) : 10;
    const timerVal = timerSelect ? timerSelect.value : "300";

    // 2. Fetch Raw Question Pool for Selected Category
    const pool = QUESTION_DATABASE[catKey] || QUESTION_DATABASE.java;

    // Filter by difficulty if available, else fallback to full pool
    let filtered = pool.filter(q => q.difficulty === difficulty);
    if (filtered.length < 3) filtered = pool;

    // 3. Randomize Question Order
    let randomized = shuffleArray(filtered);
    if (randomized.length > count) {
        randomized = randomized.slice(0, count);
    }

    // 4. Randomize Option Orders while preserving correct index
    const processedQuestions = randomized.map(q => {
        const originalCorrectText = q.options[q.correct];
        const shuffledOptions = shuffleArray(q.options);
        const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);

        return {
            ...q,
            options: shuffledOptions,
            correct: newCorrectIndex
        };
    });

    // 5. Populate State
    QuizState.playerName = playerName;
    QuizState.categoryKey = catKey;
    QuizState.categoryName = CATEGORY_NAMES[catKey] || "General Quiz";
    QuizState.difficulty = difficulty;
    QuizState.questionLimit = processedQuestions.length;
    QuizState.questions = processedQuestions;
    QuizState.currentIndex = 0;
    QuizState.userAnswers = {};
    QuizState.isSubmitted = false;
    QuizState.startTime = new Date();

    // Timer Setup
    if (timerVal === "none") {
        QuizState.timeLimitSeconds = null;
        QuizState.remainingSeconds = null;
    } else {
        QuizState.timeLimitSeconds = parseInt(timerVal, 10);
        QuizState.remainingSeconds = QuizState.timeLimitSeconds;
    }

    // 6. UI View Toggle
    document.getElementById("quizSetupSection").style.display = "none";
    document.getElementById("resultSection").style.display = "none";
    document.getElementById("reviewSection").style.display = "none";
    
    const dashboard = document.getElementById("quizDashboard");
    dashboard.style.display = "block";
    dashboard.scrollIntoView({ behavior: "smooth" });

    // 7. Initialize Timer & Render First Question
    startTimer();
    renderCurrentQuestion();
    renderQuestionPalette();
    updateDashboardHeader();
}

/**
 * Timer Engine
 */
function startTimer() {
    clearInterval(QuizState.timerInterval);

    const timerBadge = document.getElementById("dashTimerBadge");
    if (!timerBadge) return;

    if (QuizState.remainingSeconds === null) {
        timerBadge.textContent = "⏱️ No Timer";
        timerBadge.className = "badge badge-info";
        return;
    }

    updateTimerDisplay();

    QuizState.timerInterval = setInterval(() => {
        QuizState.remainingSeconds--;

        updateTimerDisplay();

        if (QuizState.remainingSeconds <= 0) {
            clearInterval(QuizState.timerInterval);
            alert("⏰ Time is up! Your quiz will now be submitted automatically.");
            submitQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerBadge = document.getElementById("dashTimerBadge");
    if (!timerBadge || QuizState.remainingSeconds === null) return;

    const mins = Math.floor(QuizState.remainingSeconds / 60);
    const secs = QuizState.remainingSeconds % 60;
    const formatted = `⏱️ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    timerBadge.textContent = formatted;

    // Low time warning (< 60s)
    if (QuizState.remainingSeconds <= 60) {
        timerBadge.className = "badge badge-danger timer-warning";
    } else {
        timerBadge.className = "badge badge-info";
    }
}

/**
 * Header Meta Updates
 */
function updateDashboardHeader() {
    document.getElementById("dashPlayerName").textContent = QuizState.playerName;
    document.getElementById("dashCategory").textContent = QuizState.categoryName;
    document.getElementById("dashDifficulty").textContent = QuizState.difficulty;
    
    const qCount = QuizState.questions.length;
    const answeredCount = Object.keys(QuizState.userAnswers).length;

    document.getElementById("dashProgressText").textContent = `Question ${QuizState.currentIndex + 1} of ${qCount}`;
    
    const fillPercent = ((QuizState.currentIndex + 1) / qCount) * 100;
    document.getElementById("dashProgressBarFill").style.width = `${fillPercent}%`;
}

/**
 * Render Current Active Question
 */
function renderCurrentQuestion() {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    document.getElementById("qNumberBadge").textContent = `Question ${QuizState.currentIndex + 1} of ${QuizState.questions.length}`;
    document.getElementById("qText").textContent = q.question;

    const optionsGrid = document.getElementById("qOptionsGrid");
    optionsGrid.innerHTML = "";

    const selectedIdx = QuizState.userAnswers[q.id];

    q.options.forEach((optText, optIdx) => {
        const isChecked = selectedIdx === optIdx;

        const label = document.createElement("label");
        label.className = `option-card ${isChecked ? 'selected' : ''}`;
        label.onclick = () => selectOption(q.id, optIdx);

        label.innerHTML = `
            <input type="radio" name="q_opt" value="${optIdx}" ${isChecked ? 'checked' : ''}>
            <span class="option-prefix">${String.fromCharCode(65 + optIdx)}</span>
            <span class="option-text-val">${optText}</span>
        `;

        optionsGrid.appendChild(label);
    });

    // Update Navigation Buttons
    const prevBtn = document.getElementById("prevQBtn");
    const nextBtn = document.getElementById("nextQBtn");
    const submitBtn = document.getElementById("submitQuizBtn");

    if (prevBtn) prevBtn.disabled = QuizState.currentIndex === 0;

    if (QuizState.currentIndex === QuizState.questions.length - 1) {
        if (nextBtn) nextBtn.style.display = "none";
        if (submitBtn) submitBtn.style.display = "inline-flex";
    } else {
        if (nextBtn) nextBtn.style.display = "inline-flex";
        if (submitBtn) submitBtn.style.display = "inline-flex";
    }

    updateDashboardHeader();
    renderQuestionPalette();
}

/**
 * Select Option Handler
 */
function selectOption(questionId, optionIndex) {
    QuizState.userAnswers[questionId] = optionIndex;
    renderCurrentQuestion();
}

/**
 * Question Palette Render & Click Handler
 */
function renderQuestionPalette() {
    const palette = document.getElementById("questionPalette");
    if (!palette) return;

    palette.innerHTML = "";

    QuizState.questions.forEach((q, index) => {
        const btn = document.createElement("button");
        btn.type = "button";

        const isCurrent = index === QuizState.currentIndex;
        const isAnswered = QuizState.userAnswers.hasOwnProperty(q.id);

        let className = "palette-btn";
        if (isCurrent) className += " current";
        else if (isAnswered) className += " answered";
        else className += " unanswered";

        btn.className = className;
        btn.textContent = index + 1;
        btn.onclick = () => jumpToQuestion(index);

        palette.appendChild(btn);
    });
}

function jumpToQuestion(index) {
    QuizState.currentIndex = index;
    renderCurrentQuestion();
}

function nextQuestion() {
    if (QuizState.currentIndex < QuizState.questions.length - 1) {
        QuizState.currentIndex++;
        renderCurrentQuestion();
    }
}

function prevQuestion() {
    if (QuizState.currentIndex > 0) {
        QuizState.currentIndex--;
        renderCurrentQuestion();
    }
}

/**
 * Submit Quiz & Calculate Results
 */
function submitQuiz() {
    if (QuizState.isSubmitted) return;
    QuizState.isSubmitted = true;
    clearInterval(QuizState.timerInterval);

    const endTime = new Date();
    const timeTakenSeconds = Math.round((endTime - QuizState.startTime) / 1000);

    // Score Calculations
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    const totalQuestions = QuizState.questions.length;

    QuizState.questions.forEach(q => {
        const userChoice = QuizState.userAnswers[q.id];
        if (userChoice === undefined) {
            unanswered++;
        } else if (userChoice === q.correct) {
            correctAnswers++;
        } else {
            wrongAnswers++;
        }
    });

    const score = correctAnswers;
    const percentage = parseFloat(((correctAnswers / totalQuestions) * 100).toFixed(1));
    const accuracy = parseFloat(((correctAnswers / (correctAnswers + wrongAnswers || 1)) * 100).toFixed(1));

    // Performance Feedback Message
    let feedback = "";
    let badgeClass = "badge-success";
    if (percentage >= 90) {
        feedback = "🌟 Outstanding Performance! Exceptional Knowledge!";
        badgeClass = "badge-success";
    } else if (percentage >= 70) {
        feedback = "👍 Great Job! You passed with high accuracy!";
        badgeClass = "badge-info";
    } else if (percentage >= 50) {
        feedback = "📚 Good Effort! Keep practicing to improve your score.";
        badgeClass = "badge-warning";
    } else {
        feedback = "💪 Keep Practicing! Review the concepts and try again.";
        badgeClass = "badge-danger";
    }

    // Format Time Taken string
    const mins = Math.floor(timeTakenSeconds / 60);
    const secs = timeTakenSeconds % 60;
    const timeTakenStr = `${mins}m ${secs}s`;

    // 1. Update Result Dashboard UI
    document.getElementById("resPlayerName").textContent = QuizState.playerName;
    document.getElementById("resCategory").textContent = QuizState.categoryName;
    document.getElementById("resDifficulty").textContent = QuizState.difficulty;
    document.getElementById("resFeedback").textContent = feedback;
    document.getElementById("resFeedbackBadge").className = `badge ${badgeClass}`;
    
    document.getElementById("resTotal").textContent = totalQuestions;
    document.getElementById("resCorrect").textContent = correctAnswers;
    document.getElementById("resWrong").textContent = wrongAnswers;
    document.getElementById("resUnanswered").textContent = unanswered;
    document.getElementById("resScore").textContent = `${score} / ${totalQuestions}`;
    document.getElementById("resPercentage").textContent = `${percentage}%`;
    document.getElementById("resAccuracy").textContent = `${accuracy}%`;
    document.getElementById("resTimeTaken").textContent = timeTakenStr;
    document.getElementById("resCircleProgress").style.strokeDashoffset = `${440 - (440 * percentage) / 100}`;

    // 2. Save Attempt Data to LocalStorage
    const attemptData = {
        id: Date.now(),
        playerName: QuizState.playerName,
        category: QuizState.categoryName,
        difficulty: QuizState.difficulty,
        score: score,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        wrongAnswers: wrongAnswers,
        unanswered: unanswered,
        percentage: percentage,
        accuracy: accuracy,
        timeTaken: timeTakenStr,
        date: new Date().toLocaleDateString()
    };

    StorageEngine.saveQuizAttempt(attemptData);

    // 3. UI View Toggle
    document.getElementById("quizDashboard").style.display = "none";
    
    const resultSection = document.getElementById("resultSection");
    resultSection.style.display = "block";
    resultSection.scrollIntoView({ behavior: "smooth" });

    // Refresh History, Leaderboard, & Dashboard
    renderLeaderboard();
    renderHistory();
    renderUserDashboard();
}

/**
 * Question Review Renderer
 */
function reviewAnswers() {
    const container = document.getElementById("reviewQuestionsList");
    if (!container) return;

    container.innerHTML = "";

    QuizState.questions.forEach((q, index) => {
        const userChoice = QuizState.userAnswers[q.id];
        const isCorrect = userChoice === q.correct;
        const isUnanswered = userChoice === undefined;

        const card = document.createElement("div");
        card.className = `review-card ${isCorrect ? 'correct' : isUnanswered ? 'unanswered' : 'wrong'}`;

        let statusBadge = '';
        if (isCorrect) statusBadge = '<span class="badge badge-success">✓ Correct</span>';
        else if (isUnanswered) statusBadge = '<span class="badge badge-warning">⚠️ Unanswered</span>';
        else statusBadge = '<span class="badge badge-danger">✗ Incorrect</span>';

        card.innerHTML = `
            <div class="review-header">
                <span class="question-number">Question ${index + 1} of ${QuizState.questions.length}</span>
                ${statusBadge}
            </div>
            <h4 class="review-question-text">${q.question}</h4>
            <div class="review-options-list">
                ${q.options.map((optText, optIdx) => {
                    let optClass = "review-opt";
                    if (optIdx === q.correct) optClass += " is-correct-ans";
                    if (optIdx === userChoice && !isCorrect) optClass += " is-wrong-ans";

                    return `
                        <div class="${optClass}">
                            <span class="option-prefix">${String.fromCharCode(65 + optIdx)}</span>
                            <span>${optText}</span>
                            ${optIdx === q.correct ? ' <strong style="margin-left: auto; color: var(--success-color);">(Correct Answer)</strong>' : ''}
                            ${optIdx === userChoice && !isCorrect ? ' <strong style="margin-left: auto; color: var(--danger-color);">(Your Selection)</strong>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        container.appendChild(card);
    });

    document.getElementById("resultSection").style.display = "none";
    
    const reviewSec = document.getElementById("reviewSection");
    reviewSec.style.display = "block";
    reviewSec.scrollIntoView({ behavior: "smooth" });
}

function backToResults() {
    document.getElementById("reviewSection").style.display = "none";
    const resSec = document.getElementById("resultSection");
    resSec.style.display = "block";
    resSec.scrollIntoView({ behavior: "smooth" });
}

/**
 * Render Local Leaderboard UI
 */
function renderLeaderboard() {
    const list = StorageEngine.getLeaderboard();
    const tableBody = document.getElementById("leaderboardTableBody");
    const top3Container = document.getElementById("top3Container");

    if (!tableBody || !top3Container) return;

    // Render Top 3 Cards
    top3Container.innerHTML = "";
    const ranks = ["🥇 1st Place", "🥈 2nd Place", "🥉 3rd Place"];

    list.slice(0, 3).forEach((item, index) => {
        const card = document.createElement("div");
        card.className = `top-player-card rank-${index + 1}`;
        card.innerHTML = `
            <span class="rank-badge">${ranks[index]}</span>
            <h4 class="player-name">${item.name}</h4>
            <div class="player-score">${item.score} / ${item.total || 10} (${item.percentage}%)</div>
            <div class="player-meta">${item.category} • ${item.difficulty}</div>
        `;
        top3Container.appendChild(card);
    });

    // Render Table Rows
    tableBody.innerHTML = "";
    list.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>#${index + 1}</strong></td>
            <td><strong>${item.name}</strong></td>
            <td>${item.category}</td>
            <td><span class="badge badge-info">${item.difficulty}</span></td>
            <td><strong>${item.score} / ${item.total || 10}</strong></td>
            <td><strong style="color: var(--accent-blue);">${item.percentage}%</strong></td>
            <td>${item.date || 'Recent'}</td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Render Quiz History UI
 */
function renderHistory() {
    const history = StorageEngine.getHistory();
    const tbody = document.getElementById("historyTableBody");
    const emptyState = document.getElementById("historyEmptyState");

    if (!tbody) return;

    if (history.length === 0) {
        tbody.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";
    tbody.innerHTML = "";

    history.forEach((h, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>#${idx + 1}</td>
            <td><strong>${h.playerName}</strong></td>
            <td>${h.category}</td>
            <td><span class="badge badge-info">${h.difficulty}</span></td>
            <td>${h.score} / ${h.totalQuestions}</td>
            <td><strong style="color: var(--accent-blue);">${h.percentage}%</strong></td>
            <td>${h.timeTaken || '-'}</td>
            <td>${h.date}</td>
        `;
        tbody.appendChild(row);
    });
}

function clearUserHistory() {
    if (confirm("Are you sure you want to clear your entire quiz history and reset leaderboard?")) {
        StorageEngine.clearHistory();
        renderHistory();
        renderLeaderboard();
        renderUserDashboard();
    }
}

/**
 * Render User Profile Dashboard Stats
 */
function renderUserDashboard() {
    const lastName = StorageEngine.getLastPlayerName();
    const stats = StorageEngine.getUserDashboardStats(lastName);

    const nameElem = document.getElementById("userDashName");
    if (nameElem) {
        nameElem.textContent = lastName ? `Player Profile: ${lastName}` : "Your Quiz Profile Summary";
    }

    document.getElementById("userTotalCompleted").textContent = stats.quizzesCompleted;
    document.getElementById("userBestScore").textContent = stats.bestScore;
    document.getElementById("userAvgPercentage").textContent = `${stats.avgPercentage}%`;
    document.getElementById("userTotalCorrect").textContent = stats.totalCorrect;
}
