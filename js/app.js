/* ==========================================================================
   QuizSystem - Master EdTech Application Engine
   Handles:
   - Navigation Routing & Section Visibility
   - Gamified XP, Levels, Badges, & Daily Streaks
   - Exam Mode vs Learning Mode Execution
   - Interactive Question Palette (4 States: Current, Answered, Unanswered, Marked)
   - Pre-submission Hints, Post-submission Solutions (WHY, HOW, CONCEPT, TIP)
   - Question Bookmarks & Personal Notes Engine
   - Daily Challenge System
   - Local Leaderboard & History
   - Settings & Data Reset Controls
   - Animated Toast Notifications
   ========================================================================== */

const QuizState = {
    playerName: "",
    categoryKey: "java",
    categoryName: "Java",
    difficulty: "Easy",
    mode: "exam",          // "exam" or "learning"
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
    learningFeedback: {},  // { questionId: true/false } for Learning Mode instant feedback
    isSubmitted: false,
    isDailyChallenge: false
};

const CATEGORY_NAMES = {
    java: "Java",
    oop: "OOP",
    dbms: "DBMS",
    sql: "SQL",
    html_css: "HTML/CSS",
    javascript: "JavaScript",
    os: "OS",
    cn: "Computer Networks"
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Theme (Dark Default)
    StorageEngine.initTheme();

    // 2. Load Saved Player Name & Settings
    const savedName = StorageEngine.getPlayerName();
    const nameInput = document.getElementById("setupPlayerName");
    const profileNameInput = document.getElementById("profileNameInput");
    if (nameInput && savedName) nameInput.value = savedName;
    if (profileNameInput && savedName) profileNameInput.value = savedName;

    // 3. Render All Views & Dashboard Analytics
    renderUserDashboard();
    renderLeaderboard();
    renderHistory();
    renderAchievements();
    renderDailyChallengeCard();
    renderBookmarks();

    // 4. Setup Event Listeners
    setupEventListeners();
});

/**
 * Navigation Router
 */
function showSection(sectionId) {
    const sections = [
        "landingSection", "userDashboardSection", "categoriesSection",
        "quizSetupSection", "quizDashboard", "resultSection", "reviewSection",
        "weakReviewSection", "bookmarksSection", "dailyChallengeSection",
        "leaderboardSection", "historySection", "achievementsSection",
        "profileSection", "settingsSection", "aboutSection", "faqSection", "contactSection"
    ];

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    const activeEl = document.getElementById(sectionId);
    if (activeEl) {
        activeEl.style.display = "block";
        activeEl.scrollIntoView({ behavior: "smooth" });
    }

    // Refresh specific section data upon view
    if (sectionId === "userDashboardSection") renderUserDashboard();
    if (sectionId === "leaderboardSection") renderLeaderboard();
    if (sectionId === "historySection") renderHistory();
    if (sectionId === "achievementsSection") renderAchievements();
    if (sectionId === "bookmarksSection") renderBookmarks();
    if (sectionId === "profileSection") renderProfile();
}

function setupEventListeners() {
    // Theme Toggle Button
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const current = StorageEngine.getTheme();
            const next = current === 'dark' ? 'light' : 'dark';
            StorageEngine.setTheme(next);
            updateThemeIcon(next);
            showToast(`Theme switched to ${next} mode`, "info");
        });
        updateThemeIcon(StorageEngine.getTheme());
    }

    // Mobile Hamburger Menu Toggle
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

    // FAQ Accordion Toggle
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
 * Toast Notification Engine
 */
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "🏆";
    if (type === "danger") icon = "⚠️";

    toast.innerHTML = `<span>${icon} ${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

/**
 * Open Quiz Setup Screen / Pre-select Category
 */
function openQuizSetup(catKey) {
    if (catKey) {
        const catSelect = document.getElementById("setupCategory");
        if (catSelect) catSelect.value = catKey;
    }
    showSection("quizSetupSection");
}

/**
 * Fisher-Yates Array Randomizer
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
 * Start Quiz Test Execution
 */
function startQuiz(event) {
    if (event) event.preventDefault();

    const nameInput = document.getElementById("setupPlayerName");
    const catSelect = document.getElementById("setupCategory");
    const diffSelect = document.getElementById("setupDifficulty");
    const countSelect = document.getElementById("setupCount");
    const modeSelect = document.getElementById("setupMode");
    const timerSelect = document.getElementById("setupTimer");

    const playerName = nameInput ? nameInput.value.trim() : "Developer";
    if (!playerName) {
        alert("Please enter your name to start.");
        if (nameInput) nameInput.focus();
        return;
    }

    const catKey = catSelect ? catSelect.value : "java";
    const difficulty = diffSelect ? diffSelect.value : "Easy";
    const count = countSelect ? parseInt(countSelect.value, 10) : 10;
    const mode = modeSelect ? modeSelect.value : "exam";
    const timerVal = timerSelect ? timerSelect.value : "300";

    // Fetch Question Pool
    const pool = QUESTION_DATABASE[catKey] || QUESTION_DATABASE.java;
    let filtered = pool.filter(q => q.difficulty === difficulty);
    if (filtered.length < 3) filtered = pool;

    let randomized = shuffleArray(filtered);
    if (randomized.length > count) randomized = randomized.slice(0, count);

    // Shuffling Options while maintaining correct index
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

    QuizState.playerName = playerName;
    QuizState.categoryKey = catKey;
    QuizState.categoryName = CATEGORY_NAMES[catKey] || "Technical Quiz";
    QuizState.difficulty = difficulty;
    QuizState.mode = mode;
    QuizState.questionLimit = processedQuestions.length;
    QuizState.questions = processedQuestions;
    QuizState.currentIndex = 0;
    QuizState.userAnswers = {};
    QuizState.markedForReview = {};
    QuizState.hintsUsed = {};
    QuizState.learningFeedback = {};
    QuizState.isSubmitted = false;
    QuizState.isDailyChallenge = false;
    QuizState.startTime = new Date();

    if (timerVal === "none") {
        QuizState.timeLimitSeconds = null;
        QuizState.remainingSeconds = null;
    } else {
        QuizState.timeLimitSeconds = parseInt(timerVal, 10);
        QuizState.remainingSeconds = QuizState.timeLimitSeconds;
    }

    showSection("quizDashboard");
    startTimer();
    renderCurrentQuestion();
    renderQuestionPalette();
}

/**
 * Start Daily Challenge Execution (5 Random Questions)
 */
function startDailyChallenge() {
    const dailyData = StorageEngine.getDailyChallengeData();
    if (dailyData.completed) {
        alert("You have already completed today's Daily Challenge! Check back tomorrow.");
        return;
    }

    // Pick 5 random questions across all categories
    const allQuestions = [];
    Object.keys(QUESTION_DATABASE).forEach(cat => {
        allQuestions.push(...QUESTION_DATABASE[cat]);
    });

    const shuffled = shuffleArray(allQuestions).slice(0, 5);
    const processedQuestions = shuffled.map(q => {
        const correctText = q.options[q.correct];
        const shuffledOptions = shuffleArray(q.options);
        return {
            ...q,
            options: shuffledOptions,
            correct: shuffledOptions.indexOf(correctText)
        };
    });

    QuizState.playerName = StorageEngine.getPlayerName();
    QuizState.categoryKey = "daily_challenge";
    QuizState.categoryName = "Daily Challenge";
    QuizState.difficulty = "Adaptive";
    QuizState.mode = "exam";
    QuizState.questionLimit = 5;
    QuizState.questions = processedQuestions;
    QuizState.currentIndex = 0;
    QuizState.userAnswers = {};
    QuizState.markedForReview = {};
    QuizState.hintsUsed = {};
    QuizState.learningFeedback = {};
    QuizState.isSubmitted = false;
    QuizState.isDailyChallenge = true;
    QuizState.startTime = new Date();
    QuizState.timeLimitSeconds = 300;
    QuizState.remainingSeconds = 300;

    showSection("quizDashboard");
    startTimer();
    renderCurrentQuestion();
    renderQuestionPalette();
}

/**
 * Start Weak Questions Practice Session
 */
function startWeakPractice() {
    const history = StorageEngine.getHistory();
    const wrongQuestionIds = new Set();

    history.forEach(h => {
        if (h.questions && h.userAnswers) {
            h.questions.forEach(q => {
                if (h.userAnswers[q.id] !== q.correct) {
                    wrongQuestionIds.add(q.id);
                }
            });
        }
    });

    const allQuestions = [];
    Object.keys(QUESTION_DATABASE).forEach(cat => {
        allQuestions.push(...QUESTION_DATABASE[cat]);
    });

    let weakPool = allQuestions.filter(q => wrongQuestionIds.has(q.id));
    if (weakPool.length === 0) weakPool = allQuestions;

    const processed = shuffleArray(weakPool).slice(0, 10).map(q => {
        const correctText = q.options[q.correct];
        const shuffledOptions = shuffleArray(q.options);
        return {
            ...q,
            options: shuffledOptions,
            correct: shuffledOptions.indexOf(correctText)
        };
    });

    QuizState.playerName = StorageEngine.getPlayerName();
    QuizState.categoryKey = "weak_practice";
    QuizState.categoryName = "Practice Weak Questions";
    QuizState.difficulty = "Adaptive";
    QuizState.mode = "learning"; // Practice weak questions in Learning Mode
    QuizState.questionLimit = processed.length;
    QuizState.questions = processed;
    QuizState.currentIndex = 0;
    QuizState.userAnswers = {};
    QuizState.markedForReview = {};
    QuizState.hintsUsed = {};
    QuizState.learningFeedback = {};
    QuizState.isSubmitted = false;
    QuizState.isDailyChallenge = false;
    QuizState.startTime = new Date();
    QuizState.timeLimitSeconds = 300;
    QuizState.remainingSeconds = 300;

    showSection("quizDashboard");
    startTimer();
    renderCurrentQuestion();
    renderQuestionPalette();
}

/**
 * Countdown Timer
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
    badge.textContent = `⏱️ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (QuizState.remainingSeconds <= 60) {
        badge.className = "badge badge-danger timer-warning";
    } else {
        badge.className = "badge badge-info";
    }
}

/**
 * Render Current Question Area
 */
function renderCurrentQuestion() {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    document.getElementById("dashPlayerName").textContent = QuizState.playerName;
    document.getElementById("dashCategory").textContent = QuizState.categoryName;
    document.getElementById("dashDifficulty").textContent = QuizState.difficulty;

    document.getElementById("qNumberBadge").textContent = `Question ${QuizState.currentIndex + 1} of ${QuizState.questions.length}`;
    document.getElementById("qText").textContent = q.question;

    // Render Option Cards
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

    // Learning Mode Instant Feedback Container
    const learningBox = document.getElementById("learningFeedbackBox");
    if (learningBox) {
        if (QuizState.mode === "learning" && selectedIdx !== undefined) {
            const isCorrect = selectedIdx === q.correct;
            learningBox.style.display = "block";
            learningBox.className = `explanation-details-box ${isCorrect ? 'user-correct' : 'user-wrong'}`;

            learningBox.innerHTML = `
                <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 0.5rem; color: ${isCorrect ? 'var(--success-color)' : 'var(--danger-color)'};">
                    ${isCorrect ? '✓ Correct Answer!' : '✕ Incorrect Selection'}
                </div>
                <div class="exp-block">
                    <span class="exp-badge">🧠 WHY?</span>
                    <p>${q.explanation}</p>
                </div>
                ${q.solution && q.solution.length > 0 ? `
                    <div class="exp-block">
                        <span class="exp-badge">⚙️ HOW TO SOLVE:</span>
                        <ul class="solution-steps-list">
                            ${q.solution.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <div class="exp-block">
                    <span class="exp-badge">📚 CONCEPT:</span>
                    <p>${q.concept}</p>
                </div>
                ${q.quickTip ? `<div class="exp-block"><span class="exp-badge">💡 QUICK TIP:</span><p>${q.quickTip}</p></div>` : ''}
            `;
        } else {
            learningBox.style.display = "none";
        }
    }

    // Bookmark & Note Buttons State
    const bmBtn = document.getElementById("bookmarkBtn");
    const isBookmarked = StorageEngine.isBookmarked(q.id);
    if (bmBtn) {
        bmBtn.className = isBookmarked ? "btn btn-warning" : "btn btn-outline";
        bmBtn.innerHTML = isBookmarked ? "📌 Bookmarked" : "📌 Bookmark";
    }

    const noteInput = document.getElementById("questionNoteInput");
    if (noteInput) {
        noteInput.value = StorageEngine.getNoteForQuestion(q.id);
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

    // Mark for Review Button State
    const markBtn = document.getElementById("markReviewBtn");
    const isMarked = QuizState.markedForReview[q.id];
    if (markBtn) {
        markBtn.className = isMarked ? "btn btn-warning" : "btn btn-outline";
        markBtn.innerHTML = isMarked ? "🔖 Marked for Review" : "🔖 Mark for Review";
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

    // Header Progress Bar & Side Counters
    const qCount = QuizState.questions.length;
    const answeredCount = Object.keys(QuizState.userAnswers).length;

    document.getElementById("dashProgressText").textContent = `Question ${QuizState.currentIndex + 1} of ${qCount}`;
    document.getElementById("dashProgressBarFill").style.width = `${((QuizState.currentIndex + 1) / qCount) * 100}%`;

    document.getElementById("sideAnsweredCount").textContent = answeredCount;
    document.getElementById("sideUnansweredCount").textContent = qCount - answeredCount;
    document.getElementById("sideMarkedCount").textContent = Object.values(QuizState.markedForReview).filter(Boolean).length;

    renderQuestionPalette();
}

function selectOption(questionId, optionIndex) {
    QuizState.userAnswers[questionId] = optionIndex;
    renderCurrentQuestion();
}

function toggleHint() {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    QuizState.hintsUsed[q.id] = !QuizState.hintsUsed[q.id];
    renderCurrentQuestion();
}

function toggleMarkForReview() {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    QuizState.markedForReview[q.id] = !QuizState.markedForReview[q.id];
    renderCurrentQuestion();
}

function toggleBookmarkCurrent() {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    StorageEngine.toggleBookmark(q);
    renderCurrentQuestion();
}

function saveCurrentNote() {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    const noteInput = document.getElementById("questionNoteInput");
    if (noteInput) {
        StorageEngine.saveNote(q.id, noteInput.value);
        showToast("Personal note saved!", "success");
    }
}

/**
 * Question Palette Navigation (4 States: Current, Answered, Unanswered, Marked)
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
 * Submit Quiz & Analytics Execution
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

    // Calculate XP Gained
    let xpGained = score * 10 + 25; // 10 per correct + 25 completion
    if (percentage >= 100) xpGained += 100;
    if (QuizState.isDailyChallenge) xpGained += 50;

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

    if (QuizState.isDailyChallenge) {
        StorageEngine.saveDailyChallengeResult(score, totalQuestions);
    } else {
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
            timeTakenSeconds: timeTakenSeconds,
            date: new Date().toLocaleDateString(),
            questions: QuizState.questions,
            userAnswers: QuizState.userAnswers
        };
        StorageEngine.saveQuizAttempt(attemptData);
    }

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
    document.getElementById("resXPGained").textContent = `+${xpGained} XP`;
    document.getElementById("resCircleProgress").style.strokeDashoffset = `${440 - (440 * percentage) / 100}`;

    showSection("resultSection");
    renderUserDashboard();
    renderLeaderboard();
    renderHistory();
    renderAchievements();
}

/**
 * Render Complete Answer Key & Step-by-Step Explanations
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
                    <span class="ans-label">❌ Your Selection:</span>
                    <strong>${userChoiceText}</strong>
                </div>
                <div class="ans-box correct">
                    <span class="ans-label">✅ Correct Answer:</span>
                    <strong>${correctChoiceText}</strong>
                </div>
            </div>

            <div class="explanation-details-box">
                <div class="exp-block">
                    <span class="exp-badge">🧠 WHY?</span>
                    <p>${q.explanation}</p>
                </div>
                ${q.solution && q.solution.length > 0 ? `
                    <div class="exp-block">
                        <span class="exp-badge">⚙️ HOW TO SOLVE (Step-by-Step):</span>
                        <ul class="solution-steps-list">
                            ${q.solution.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <div class="exp-block">
                    <span class="exp-badge">📚 CONCEPT TO REMEMBER:</span>
                    <p><strong>${q.concept}</strong></p>
                </div>
                ${q.quickTip ? `<div class="exp-block"><span class="exp-badge">💡 QUICK TIP:</span><p>${q.quickTip}</p></div>` : ''}
            </div>
        `;

        container.appendChild(card);
    });

    showSection("reviewSection");
}

/**
 * Render Dedicated Mistake Review (Wrong Answers Only)
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
                    <span class="badge badge-danger">❌ Mistake Review #${index + 1}</span>
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

    showSection("weakReviewSection");
}

function backToResults() {
    showSection("resultSection");
}

/**
 * Render User Profile Dashboard & Topic Mastery Progress
 */
function renderUserDashboard() {
    const stats = StorageEngine.getUserDashboardStats();
    
    document.getElementById("userWelcomeHeader").textContent = `Welcome back, ${stats.playerName}`;
    document.getElementById("userDashCompleted").textContent = stats.quizzesCompleted;
    document.getElementById("userDashBest").textContent = stats.bestScore;
    document.getElementById("userDashAvg").textContent = `${stats.avgPercentage}%`;
    document.getElementById("userDashAttempted").textContent = stats.totalAttempted;
    document.getElementById("userDashAccuracy").textContent = `${stats.accuracy}%`;

    // XP & Level UI
    document.getElementById("dashXPText").textContent = `${stats.currentXP} XP`;
    document.getElementById("dashLevelTitle").textContent = `Level ${stats.currentLevel.level}: ${stats.currentLevel.title}`;
    
    const xpProgress = ((stats.currentXP - stats.currentLevel.minXP) / (stats.currentLevel.maxXP - stats.currentLevel.minXP)) * 100;
    document.getElementById("dashXPBarFill").style.width = `${Math.min(100, Math.max(0, xpProgress))}%`;
    document.getElementById("dashStreakText").textContent = `🔥 ${stats.streak.currentStreak} Day Streak`;

    // Render Topic Mastery Progress Bars
    const mastery = StorageEngine.getTopicMastery();
    const masteryContainer = document.getElementById("topicMasteryContainer");

    if (masteryContainer) {
        masteryContainer.innerHTML = "";
        Object.keys(mastery).forEach(cat => {
            const data = mastery[cat];
            const bar = document.createElement("div");
            bar.style.marginBottom = "1rem";
            bar.innerHTML = `
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 700; margin-bottom: 4px;">
                    <span>${cat}</span>
                    <span>${data.percentage}% Mastery</span>
                </div>
                <div class="progress-bar-wrap" style="height: 8px;">
                    <div class="progress-bar-fill" style="width: ${data.percentage}%;"></div>
                </div>
            `;
            masteryContainer.appendChild(bar);
        });
    }
}

/**
 * Render Daily Challenge Card
 */
function renderDailyChallengeCard() {
    const daily = StorageEngine.getDailyChallengeData();
    const statusBadge = document.getElementById("dailyStatusBadge");
    const startBtn = document.getElementById("dailyStartBtn");

    if (statusBadge && startBtn) {
        if (daily.completed) {
            statusBadge.className = "badge badge-success";
            statusBadge.textContent = "✓ Completed Today (+50 XP)";
            startBtn.disabled = true;
            startBtn.textContent = "✓ Challenge Completed";
        } else {
            statusBadge.className = "badge badge-info";
            statusBadge.textContent = "⏱️ Available Today (+50 XP Reward)";
            startBtn.disabled = false;
            startBtn.textContent = "🚀 Start Daily Challenge";
        }
    }
}

/**
 * Render Bookmarks Section
 */
function renderBookmarks() {
    const bookmarks = StorageEngine.getBookmarks();
    const list = document.getElementById("bookmarksList");
    const emptyState = document.getElementById("bookmarksEmptyState");

    if (!list) return;

    if (bookmarks.length === 0) {
        list.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";
    list.innerHTML = "";

    bookmarks.forEach(bm => {
        const card = document.createElement("div");
        card.className = "review-card";

        const note = StorageEngine.getNoteForQuestion(bm.id);

        card.innerHTML = `
            <div class="review-header">
                <span class="badge badge-info">${bm.category} • ${bm.difficulty}</span>
                <button type="button" class="btn btn-outline" style="padding: 4px 10px; font-size: 0.8rem;" onclick="removeBookmark('${bm.id}')">🗑️ Remove</button>
            </div>

            <h4 class="review-q-title">${bm.question}</h4>

            <div class="explanation-details-box">
                <div class="exp-block">
                    <span class="exp-badge">💡 Hint:</span>
                    <p>${bm.hint}</p>
                </div>
                <div class="exp-block">
                    <span class="exp-badge">🧠 Explanation:</span>
                    <p>${bm.explanation}</p>
                </div>
                ${note ? `<div class="exp-block"><span class="exp-badge">📝 Your Personal Note:</span><p>${note}</p></div>` : ''}
            </div>
        `;

        list.appendChild(card);
    });
}

function removeBookmark(questionId) {
    StorageEngine.toggleBookmark({ id: questionId });
    renderBookmarks();
}

/**
 * Render Achievements & Badges
 */
function renderAchievements() {
    const unlocked = StorageEngine.getUnlockedAchievements();
    const grid = document.getElementById("achievementsGrid");

    if (!grid) return;
    grid.innerHTML = "";

    BADGES_CONFIG.forEach(b => {
        const isUnlocked = unlocked.includes(b.id);
        const card = document.createElement("div");
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;

        card.innerHTML = `
            <div class="achievement-icon">${b.icon}</div>
            <h4 class="achievement-title">${b.title}</h4>
            <p class="achievement-desc">${b.desc}</p>
            <span class="badge ${isUnlocked ? 'badge-success' : 'badge-secondary'}" style="margin-top: 8px;">
                ${isUnlocked ? '✓ Unlocked' : '🔒 Locked'}
            </span>
        `;

        grid.appendChild(card);
    });
}

/**
 * Render Profile Page
 */
function renderProfile() {
    const stats = StorageEngine.getUserDashboardStats();
    document.getElementById("profName").textContent = stats.playerName;
    document.getElementById("profXP").textContent = `${stats.currentXP} XP`;
    document.getElementById("profLevel").textContent = `Level ${stats.currentLevel.level}: ${stats.currentLevel.title}`;
    document.getElementById("profStreak").textContent = `🔥 ${stats.streak.currentStreak} Day Streak`;
    document.getElementById("profQuizzes").textContent = stats.quizzesCompleted;
    document.getElementById("profBest").textContent = stats.bestScore;
    document.getElementById("profAccuracy").textContent = `${stats.accuracy}%`;
}

function updateProfileName(event) {
    if (event) event.preventDefault();
    const input = document.getElementById("profileNameInput");
    if (input && input.value.trim()) {
        StorageEngine.setPlayerName(input.value.trim());
        showToast("Profile name updated!", "success");
        renderProfile();
        renderUserDashboard();
    }
}

/**
 * Render Leaderboard & History
 */
function renderLeaderboard() {
    const list = StorageEngine.getLeaderboard();
    const tbody = document.getElementById("leaderboardTableBody");
    const top3Container = document.getElementById("top3Container");

    if (!tbody || !top3Container) return;

    top3Container.innerHTML = "";
    const ranks = ["🥇 1st Place", "🥈 2nd Place", "🥉 3rd Place"];

    list.slice(0, 3).forEach((item, idx) => {
        const card = document.createElement("div");
        card.className = `top-player-card rank-${idx + 1}`;
        card.innerHTML = `
            <span class="rank-badge">${ranks[idx]}</span>
            <h4 class="player-name">${item.name}</h4>
            <div class="player-score">${item.xp || (item.score * 10)} XP (Lvl ${item.level || 1})</div>
            <div class="player-meta">${item.category} • ${item.percentage}%</div>
        `;
        top3Container.appendChild(card);
    });

    tbody.innerHTML = "";
    list.forEach((item, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>#${idx + 1}</strong></td>
            <td><strong>${item.name}</strong></td>
            <td><span class="badge badge-warning">Lvl ${item.level || 1}</span></td>
            <td><strong>${item.xp || (item.score * 10)} XP</strong></td>
            <td>${item.category}</td>
            <td><strong style="color: var(--accent-blue);">${item.percentage}%</strong></td>
            <td>${item.date || 'Recent'}</td>
        `;
        tbody.appendChild(row);
    });
}

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
    if (confirm("Are you sure you want to clear your entire quiz history and reset leaderboard data?")) {
        StorageEngine.clearHistory();
        showToast("Quiz history cleared", "info");
        renderUserDashboard();
        renderHistory();
        renderLeaderboard();
    }
}

function resetAllData() {
    if (confirm("WARNING: This will reset all your XP, Levels, Badges, Streaks, History, and Settings. Continue?")) {
        StorageEngine.clearAllData();
        showToast("All application data reset successfully", "danger");
        setTimeout(() => location.reload(), 1000);
    }
}
