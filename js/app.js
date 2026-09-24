/* ==========================================================================
   QuizSystem - Application Logic Engine
   Handles:
   - Quiz Setup & State Management
   - Question Palette & 4-State Question Navigator (Current, Answered, Unanswered, Marked)
   - Pre-submission Hint System & Post-submission Wrong Answer Learning System
   - Step-by-Step Solution Explanations (WHY, HOW, CONCEPT, QUICK TIP)
   - Score & Performance Analytics Engine
   - Weak Questions Targeted Practice Generator
   - LocalStorage History & Leaderboard Integrations
   ========================================================================== */

const QuizState = {
    playerName: "",
    categoryKey: "java",
    categoryName: "Java",
    difficulty: "Easy",
    questionLimit: 10,
    timeLimitSeconds: 300,
    remainingSeconds: 300,
    timerInterval: null,
    startTime: null,

    questions: [],
    currentIndex: 0,
    userAnswers: {},       // { questionId: optionIdx }
    markedForReview: {},   // { questionId: true/false }
    hintsUsed: {},         // { questionId: true/false }
    isSubmitted: false
};

const CATEGORY_NAMES = {
    java: "Java",
    html_css: "HTML & CSS",
    javascript: "JavaScript",
    dbms: "DBMS",
    oop: "OOP",
    cs: "Computer Science"
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Theme (Dark mode by default)
    StorageEngine.initTheme();

    // 2. Pre-fill saved Player Name
    const savedName = StorageEngine.getPlayerName();
    const nameInput = document.getElementById("setupPlayerName");
    if (nameInput && savedName) nameInput.value = savedName;

    // 3. Render Dashboard, Leaderboard & History
    renderDashboard();
    renderLeaderboard();
    renderHistory();

    // 4. Setup Global Event Listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Theme Toggle
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const current = StorageEngine.getTheme();
            const next = current === 'dark' ? 'light' : 'dark';
            StorageEngine.setTheme(next);
            updateThemeIcon(next);
        });
        updateThemeIcon(StorageEngine.getTheme());
    }

    // Mobile Navigation Hamburger Toggle
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

    // FAQ Accordions
    document.querySelectorAll(".faq-question").forEach(q => {
        q.addEventListener("click", () => {
            q.parentElement.classList.toggle("active");
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
 * Open Setup Screen / Pre-select Category
 */
function openQuizSetup(catKey) {
    if (catKey) {
        const catSelect = document.getElementById("setupCategory");
        if (catSelect) catSelect.value = catKey;
    }

    hideAllSections();
    const setup = document.getElementById("quizSetupSection");
    if (setup) {
        setup.style.display = "block";
        setup.scrollIntoView({ behavior: "smooth" });
    }
}

function hideAllSections() {
    const sections = ["quizSetupSection", "quizDashboard", "resultSection", "reviewSection", "weakReviewSection"];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
}

/**
 * Fisher-Yates Array Shuffle
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

    const nameInput = document.getElementById("setupPlayerName");
    const catSelect = document.getElementById("setupCategory");
    const diffSelect = document.getElementById("setupDifficulty");
    const countSelect = document.getElementById("setupCount");
    const timerSelect = document.getElementById("setupTimer");

    const playerName = nameInput ? nameInput.value.trim() : "Developer";
    if (!playerName) {
        alert("Please enter your name to start the test.");
        if (nameInput) nameInput.focus();
        return;
    }

    const catKey = catSelect ? catSelect.value : "java";
    const difficulty = diffSelect ? diffSelect.value : "Easy";
    const count = countSelect ? parseInt(countSelect.value, 10) : 10;
    const timerVal = timerSelect ? timerSelect.value : "300";

    // Fetch Question Pool
    const pool = QUESTION_DATABASE[catKey] || QUESTION_DATABASE.java;
    let filtered = pool.filter(q => q.difficulty === difficulty);
    if (filtered.length < 3) filtered = pool;

    let randomized = shuffleArray(filtered);
    if (randomized.length > count) randomized = randomized.slice(0, count);

    // Randomize option order while preserving correct answer mapping
    const processedQuestions = randomized.map(q => {
        const correctText = q.options[q.correct];
        const shuffledOptions = shuffleArray(q.options);
        const newCorrectIdx = shuffledOptions.indexOf(correctText);

        return {
            ...q,
            options: shuffledOptions,
            correct: newCorrectIdx
        };
    });

    // Reset Quiz State
    QuizState.playerName = playerName;
    QuizState.categoryKey = catKey;
    QuizState.categoryName = CATEGORY_NAMES[catKey] || "Technical Quiz";
    QuizState.difficulty = difficulty;
    QuizState.questionLimit = processedQuestions.length;
    QuizState.questions = processedQuestions;
    QuizState.currentIndex = 0;
    QuizState.userAnswers = {};
    QuizState.markedForReview = {};
    QuizState.hintsUsed = {};
    QuizState.isSubmitted = false;
    QuizState.startTime = new Date();

    if (timerVal === "none") {
        QuizState.timeLimitSeconds = null;
        QuizState.remainingSeconds = null;
    } else {
        QuizState.timeLimitSeconds = parseInt(timerVal, 10);
        QuizState.remainingSeconds = QuizState.timeLimitSeconds;
    }

    hideAllSections();

    const dashboard = document.getElementById("quizDashboard");
    if (dashboard) {
        dashboard.style.display = "block";
        dashboard.scrollIntoView({ behavior: "smooth" });
    }

    startTimer();
    renderCurrentQuestion();
    renderQuestionPalette();
}

/**
 * Start Targeted Weak Questions Practice Session
 */
function startWeakPractice() {
    const weakTopics = StorageEngine.getWeakTopics();
    if (weakTopics.length === 0) {
        alert("Great job! You currently have no weak questions tracked. Take a new quiz to test your skills!");
        return;
    }

    // Build question pool from weak topics
    const weakQuestionIds = weakTopics.map(t => t.id);
    const allQuestions = [];
    Object.keys(QUESTION_DATABASE).forEach(cat => {
        allQuestions.push(...QUESTION_DATABASE[cat]);
    });

    const weakQuestionsPool = allQuestions.filter(q => weakQuestionIds.includes(q.id));
    if (weakQuestionsPool.length === 0) {
        alert("No specific weak questions found. Starting general practice quiz.");
        startQuiz();
        return;
    }

    const processedQuestions = shuffleArray(weakQuestionsPool).map(q => {
        const correctText = q.options[q.correct];
        const shuffledOptions = shuffleArray(q.options);
        const newCorrectIdx = shuffledOptions.indexOf(correctText);
        return {
            ...q,
            options: shuffledOptions,
            correct: newCorrectIdx
        };
    });

    QuizState.playerName = StorageEngine.getPlayerName();
    QuizState.categoryKey = "weak_practice";
    QuizState.categoryName = "Targeted Weak Practice";
    QuizState.difficulty = "Adaptive";
    QuizState.questionLimit = processedQuestions.length;
    QuizState.questions = processedQuestions;
    QuizState.currentIndex = 0;
    QuizState.userAnswers = {};
    QuizState.markedForReview = {};
    QuizState.hintsUsed = {};
    QuizState.isSubmitted = false;
    QuizState.startTime = new Date();
    QuizState.timeLimitSeconds = 300;
    QuizState.remainingSeconds = 300;

    hideAllSections();
    const dashboard = document.getElementById("quizDashboard");
    if (dashboard) {
        dashboard.style.display = "block";
        dashboard.scrollIntoView({ behavior: "smooth" });
    }

    startTimer();
    renderCurrentQuestion();
    renderQuestionPalette();
}

/**
 * Countdown Timer Engine
 */
function startTimer() {
    clearInterval(QuizState.timerInterval);
    const badge = document.getElementById("dashTimerBadge");
    if (!badge) return;

    if (QuizState.remainingSeconds === null) {
        badge.textContent = "⏱️ No Timer";
        badge.className = "badge badge-info";
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
    const badge = document.getElementById("dashTimerBadge");
    if (!badge || QuizState.remainingSeconds === null) return;

    const mins = Math.floor(QuizState.remainingSeconds / 60);
    const secs = QuizState.remainingSeconds % 60;
    const formatted = `⏱️ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    badge.textContent = formatted;

    if (QuizState.remainingSeconds <= 60) {
        badge.className = "badge badge-danger timer-warning";
    } else {
        badge.className = "badge badge-info";
    }
}

/**
 * Render Active Question & Options
 */
function renderCurrentQuestion() {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    document.getElementById("dashPlayerName").textContent = QuizState.playerName;
    document.getElementById("dashCategory").textContent = QuizState.categoryName;
    document.getElementById("dashDifficulty").textContent = QuizState.difficulty;

    document.getElementById("qNumberBadge").textContent = `Question ${QuizState.currentIndex + 1} of ${QuizState.questions.length}`;
    document.getElementById("qText").textContent = q.question;

    // Render Options
    const grid = document.getElementById("qOptionsGrid");
    grid.innerHTML = "";

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

        grid.appendChild(label);
    });

    // Mark for Review Button State
    const markBtn = document.getElementById("markReviewBtn");
    const isMarked = QuizState.markedForReview[q.id];
    if (markBtn) {
        if (isMarked) {
            markBtn.className = "btn btn-warning";
            markBtn.innerHTML = "🔖 Marked for Review";
        } else {
            markBtn.className = "btn btn-outline";
            markBtn.innerHTML = "🔖 Mark for Review";
        }
    }

    // Hint Card Handling
    const hintCard = document.getElementById("qHintCard");
    const hintText = document.getElementById("qHintText");
    const hintBtn = document.getElementById("toggleHintBtn");

    if (hintCard && hintText) {
        hintText.textContent = q.hint || "Think carefully about the core concepts of this topic.";
        if (QuizState.hintsUsed[q.id]) {
            hintCard.style.display = "block";
            if (hintBtn) hintBtn.textContent = "💡 Hide Hint";
        } else {
            hintCard.style.display = "none";
            if (hintBtn) hintBtn.textContent = "💡 Need a Hint?";
        }
    }

    // Navigation Buttons State
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

    // Header Progress Bar & Side Panel Counters
    const qCount = QuizState.questions.length;
    const answeredCount = Object.keys(QuizState.userAnswers).length;
    const unansweredCount = qCount - answeredCount;

    document.getElementById("dashProgressText").textContent = `Question ${QuizState.currentIndex + 1} of ${qCount}`;
    document.getElementById("dashProgressBarFill").style.width = `${((QuizState.currentIndex + 1) / qCount) * 100}%`;

    document.getElementById("sideAnsweredCount").textContent = answeredCount;
    document.getElementById("sideUnansweredCount").textContent = unansweredCount;
    document.getElementById("sideMarkedCount").textContent = Object.values(QuizState.markedForReview).filter(Boolean).length;

    renderQuestionPalette();
}

/**
 * Option Select Handler
 */
function selectOption(questionId, optionIndex) {
    QuizState.userAnswers[questionId] = optionIndex;
    renderCurrentQuestion();
}

/**
 * Toggle Pre-submission Hint
 */
function toggleHint() {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    QuizState.hintsUsed[q.id] = !QuizState.hintsUsed[q.id];
    renderCurrentQuestion();
}

/**
 * Toggle Mark for Review State
 */
function toggleMarkForReview() {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    QuizState.markedForReview[q.id] = !QuizState.markedForReview[q.id];
    renderCurrentQuestion();
}

/**
 * Render Question Palette (4 States: Current, Answered, Unanswered, Marked)
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
        const isMarked = QuizState.markedForReview[q.id];

        let className = "palette-btn";
        if (isCurrent) className += " current";
        else if (isMarked) className += " marked";
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
 * Submit Quiz & Generate Comprehensive Analytics
 */
function submitQuiz() {
    if (QuizState.isSubmitted) return;
    QuizState.isSubmitted = true;
    clearInterval(QuizState.timerInterval);

    const endTime = new Date();
    const timeTakenSeconds = Math.round((endTime - QuizState.startTime) / 1000);

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    const totalQuestions = QuizState.questions.length;

    QuizState.questions.forEach(q => {
        const choice = QuizState.userAnswers[q.id];
        if (choice === undefined) {
            unanswered++;
        } else if (choice === q.correct) {
            correctAnswers++;
        } else {
            wrongAnswers++;
        }
    });

    const score = correctAnswers;
    const percentage = parseFloat(((correctAnswers / totalQuestions) * 100).toFixed(1));
    const accuracy = parseFloat(((correctAnswers / (correctAnswers + wrongAnswers || 1)) * 100).toFixed(1));

    // Performance Feedback & Message
    let feedback = "";
    let badgeClass = "badge-success";
    if (percentage >= 90) {
        feedback = "🌟 Outstanding Performance! Exceptional Mastery!";
        badgeClass = "badge-success";
    } else if (percentage >= 70) {
        feedback = "👍 Great Job! Strong technical foundation!";
        badgeClass = "badge-info";
    } else if (percentage >= 50) {
        feedback = "📚 Good Effort! Keep practicing to improve accuracy.";
        badgeClass = "badge-warning";
    } else {
        feedback = "💪 Keep Practicing! Review key concepts and retry.";
        badgeClass = "badge-danger";
    }

    const mins = Math.floor(timeTakenSeconds / 60);
    const secs = timeTakenSeconds % 60;
    const timeTakenStr = `${mins}m ${secs}s`;

    // Save Attempt to LocalStorage
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
        date: new Date().toLocaleDateString(),
        questions: QuizState.questions,
        userAnswers: QuizState.userAnswers
    };

    StorageEngine.saveQuizAttempt(attemptData);

    // Populate Results UI
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

    hideAllSections();
    const resultSection = document.getElementById("resultSection");
    if (resultSection) {
        resultSection.style.display = "block";
        resultSection.scrollIntoView({ behavior: "smooth" });
    }

    renderDashboard();
    renderLeaderboard();
    renderHistory();
}

/**
 * Render Complete Question-by-Question Review with Step-by-Step Explanations
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
        else statusBadge = '<span class="badge badge-danger">✕ Incorrect</span>';

        const userChoiceText = userChoice !== undefined ? `${String.fromCharCode(65 + userChoice)}) ${q.options[userChoice]}` : "None (Unanswered)";
        const correctChoiceText = `${String.fromCharCode(65 + q.correct)}) ${q.options[q.correct]}`;

        card.innerHTML = `
            <div class="review-header">
                <span class="question-number">Question ${index + 1} of ${QuizState.questions.length}</span>
                ${statusBadge}
            </div>
            
            <h4 class="review-q-title">${q.question}</h4>

            <div class="user-vs-correct-grid">
                <div class="ans-box ${isCorrect ? 'user-correct' : 'user-wrong'}">
                    <span class="ans-label">❌ Your Answer:</span>
                    <strong>${userChoiceText}</strong>
                </div>
                <div class="ans-box correct">
                    <span class="ans-label">✅ Correct Answer:</span>
                    <strong>${correctChoiceText}</strong>
                </div>
            </div>

            <!-- Deep Learning Breakdown Cards -->
            <div class="explanation-details-box">
                <div class="exp-block">
                    <span class="exp-badge">🧠 WHY?</span>
                    <p>${q.explanation || "The correct option matches the fundamental specification of this topic."}</p>
                </div>

                ${q.solution && q.solution.length > 0 ? `
                    <div class="exp-block">
                        <span class="exp-badge">⚙️ HOW TO SOLVE (Step-by-Step):</span>
                        <ul class="solution-steps-list">
                            ${q.solution.map(step => `<li>${step}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div class="exp-block">
                    <span class="exp-badge">📚 CONCEPT TO REMEMBER:</span>
                    <p><strong>${q.concept || q.category}</strong></p>
                </div>

                ${q.quickTip ? `
                    <div class="exp-block">
                        <span class="exp-badge">💡 QUICK TIP:</span>
                        <p>${q.quickTip}</p>
                    </div>
                ` : ''}
            </div>
        `;

        container.appendChild(card);
    });

    hideAllSections();
    const reviewSec = document.getElementById("reviewSection");
    if (reviewSec) {
        reviewSec.style.display = "block";
        reviewSec.scrollIntoView({ behavior: "smooth" });
    }
}

/**
 * Render Dedicated "Questions to Review" (Only Incorrect Answers)
 */
function reviewWrongAnswersOnly() {
    const container = document.getElementById("weakReviewList");
    if (!container) return;

    container.innerHTML = "";

    const wrongQuestions = QuizState.questions.filter(q => {
        const userChoice = QuizState.userAnswers[q.id];
        return userChoice === undefined || userChoice !== q.correct;
    });

    if (wrongQuestions.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 2.5rem;">
                <h3>🎉 Perfect Score! No wrong answers to review.</h3>
            </div>
        `;
    } else {
        wrongQuestions.forEach((q, index) => {
            const userChoice = QuizState.userAnswers[q.id];
            const card = document.createElement("div");
            card.className = "review-card wrong";

            card.innerHTML = `
                <div class="review-header">
                    <span class="badge badge-danger">❌ Question to Review #${index + 1}</span>
                    <span class="badge badge-info">${q.category}</span>
                </div>

                <h4 class="review-q-title">${q.question}</h4>

                <div class="user-vs-correct-grid">
                    <div class="ans-box user-wrong">
                        <span class="ans-label">Your Selection:</span>
                        <strong>${userChoice !== undefined ? q.options[userChoice] : "Unanswered"}</strong>
                    </div>
                    <div class="ans-box correct">
                        <span class="ans-label">Correct Answer:</span>
                        <strong>${q.options[q.correct]}</strong>
                    </div>
                </div>

                <div class="explanation-details-box">
                    <div class="exp-block">
                        <span class="exp-badge">💡 Hint Clue:</span>
                        <p>${q.hint}</p>
                    </div>
                    <div class="exp-block">
                        <span class="exp-badge">🧠 Why your answer was incorrect:</span>
                        <p>${q.explanation}</p>
                    </div>
                    <div class="exp-block">
                        <span class="exp-badge">📚 Core Concept:</span>
                        <p>${q.concept}</p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    hideAllSections();
    const weakSec = document.getElementById("weakReviewSection");
    if (weakSec) {
        weakSec.style.display = "block";
        weakSec.scrollIntoView({ behavior: "smooth" });
    }
}

function backToResults() {
    hideAllSections();
    const resSec = document.getElementById("resultSection");
    if (resSec) {
        resSec.style.display = "block";
        resSec.scrollIntoView({ behavior: "smooth" });
    }
}

/**
 * Render User Profile Dashboard & Performance Summary
 */
function renderDashboard() {
    const stats = StorageEngine.getUserDashboardStats();
    
    document.getElementById("userWelcomeHeader").textContent = `Welcome back, ${stats.playerName}`;
    document.getElementById("userDashCompleted").textContent = stats.quizzesCompleted;
    document.getElementById("userDashBest").textContent = stats.bestScore;
    document.getElementById("userDashAvg").textContent = `${stats.avgPercentage}%`;
    document.getElementById("userDashAttempted").textContent = stats.totalAttempted;
    document.getElementById("userDashAccuracy").textContent = `${stats.accuracy}%`;

    // Strong vs Needs Improvement Topics
    const strongList = document.getElementById("dashStrongTopics");
    if (strongList) {
        strongList.innerHTML = stats.strongCategories.map(c => `<span class="badge badge-success">✓ ${c}</span>`).join(' ');
    }

    const weakList = document.getElementById("dashWeakTopics");
    if (weakList) {
        weakList.innerHTML = stats.weakCategories.map(c => `<span class="badge badge-danger">⚠️ ${c}</span>`).join(' ');
    }
}

/**
 * Render Leaderboard
 */
function renderLeaderboard() {
    const list = StorageEngine.getLeaderboard();
    const tbody = document.getElementById("leaderboardTableBody");
    const top3Container = document.getElementById("top3Container");

    if (!tbody || !top3Container) return;

    // Top 3 Podium
    top3Container.innerHTML = "";
    const ranks = ["🥇 1st Place", "🥈 2nd Place", "🥉 3rd Place"];

    list.slice(0, 3).forEach((item, idx) => {
        const card = document.createElement("div");
        card.className = `top-player-card rank-${idx + 1}`;
        card.innerHTML = `
            <span class="rank-badge">${ranks[idx]}</span>
            <h4 class="player-name">${item.name}</h4>
            <div class="player-score">${item.score} / ${item.total || 10} (${item.percentage}%)</div>
            <div class="player-meta">${item.category} • ${item.difficulty}</div>
        `;
        top3Container.appendChild(card);
    });

    // Table Rows
    tbody.innerHTML = "";
    list.forEach((item, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>#${idx + 1}</strong></td>
            <td><strong>${item.name}</strong></td>
            <td>${item.category}</td>
            <td><span class="badge badge-info">${item.difficulty}</span></td>
            <td><strong>${item.score} / ${item.total || 10}</strong></td>
            <td><strong style="color: var(--accent-blue);">${item.percentage}%</strong></td>
            <td>${item.date || 'Recent'}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Render Quiz History
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
        renderDashboard();
        renderHistory();
        renderLeaderboard();
    }
}
