/* ==========================================================================
   QuizSystem - Master EdTech Application Engine
   Upgraded Platform: Quiz + Personalized Learning + Placement Interview Prep
   Handles:
   - Navigation Routing & Section Visibility
   - Gamified XP, Skill Levels (1-5), Badges, & Daily Streaks
   - Smart Weak-Subject Detection & Visual Weakness Heatmaps
   - Confidence vs Accuracy Tracking (Not Sure, Somewhat Sure, Very Sure)
   - Beat Your Previous Score Comparison
   - Time Analysis (Per-question time tracking)
   - Technical Placement Interview Prep Mode
   - Saved Mistakes Notebook ("My Mistakes") & Targeted Practice Loops
   - Recommended YouTube Video Tutorials (Embeds / Modals)
   - Tricky Question Annotations & Detailed Step-by-Step Solutions
   ========================================================================== */

const QuizState = {
    playerName: "",
    categoryKey: "java",
    categoryName: "Java",
    difficulty: "Easy",
    mode: "exam",          // "exam", "learning", "weak_mix", "mistakes_only"
    questionLimit: 10,
    timeLimitSeconds: 300,
    remainingSeconds: 300,
    timerInterval: null,
    startTime: null,
    currentQuestionStartTime: null,

    questions: [],
    currentIndex: 0,
    userAnswers: {},       // { questionId: optionIdx }
    userConfidence: {},    // { questionId: "Not Sure" | "Somewhat Sure" | "Very Sure" }
    perQuestionTime: {},   // { questionId: secondsSpent }
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
    cn: "Computer Networks",
    weak_mix: "Weak Areas Practice",
    mistakes_only: "My Mistakes Practice"
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

    // 3. Render Views & Analytics
    renderUserDashboard();
    renderInterviewMode();
    renderMistakesNotebook();
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
        "interviewModeSection", "mistakesSection", "quizSetupSection", 
        "quizDashboard", "resultSection", "reviewSection", "weakReviewSection", 
        "bookmarksSection", "dailyChallengeSection", "leaderboardSection", 
        "historySection", "achievementsSection", "profileSection", 
        "settingsSection", "aboutSection", "faqSection", "contactSection"
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

    // Refresh view data upon display
    if (sectionId === "userDashboardSection") renderUserDashboard();
    if (sectionId === "interviewModeSection") renderInterviewMode();
    if (sectionId === "mistakesSection") renderMistakesNotebook();
    if (sectionId === "leaderboardSection") renderLeaderboard();
    if (sectionId === "historySection") renderHistory();
    if (sectionId === "achievementsSection") renderAchievements();
    if (sectionId === "bookmarksSection") renderBookmarks();
    if (sectionId === "profileSection") renderProfile();
}

function setupEventListeners() {
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
 * Open Quiz Setup Screen
 */
function openQuizSetup(catKey) {
    if (catKey) {
        const catSelect = document.getElementById("setupCategory");
        if (catSelect) catSelect.value = catKey;
    }
    showSection("quizSetupSection");
}

function startWeakPractice() {
    const analysis = StorageEngine.getWeakSubjectsAnalysis();
    let weakCats = analysis.weak.map(w => w.category.toLowerCase().replace('/', '_'));
    if (weakCats.length === 0) {
        weakCats = ["dbms", "oop", "sql", "java"];
    }

    const catSelect = document.getElementById("setupCategory");
    if (catSelect) catSelect.value = "weak_mix";
    showSection("quizSetupSection");
}

function startPracticeMyMistakes() {
    const mistakes = StorageEngine.getMistakes();
    if (mistakes.length === 0) {
        showToast("No mistakes saved in your notebook yet! Complete a quiz to save wrong answers.", "info");
        return;
    }

    const catSelect = document.getElementById("setupCategory");
    if (catSelect) catSelect.value = "mistakes_only";
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
 * Start Quiz Execution
 */
function startQuiz(event) {
    if (event) event.preventDefault();

    const playerName = document.getElementById("setupPlayerName")?.value || "Developer";
    const categoryKey = document.getElementById("setupCategory")?.value || "java";
    const difficulty = document.getElementById("setupDifficulty")?.value || "Medium";
    const count = parseInt(document.getElementById("setupCount")?.value || "10", 10);
    const mode = document.getElementById("setupMode")?.value || "exam";
    const timerVal = document.getElementById("setupTimer")?.value || "300";

    StorageEngine.setPlayerName(playerName);

    // Prepare Question Pool
    let questionPool = [];

    if (categoryKey === "weak_mix") {
        const analysis = StorageEngine.getWeakSubjectsAnalysis();
        const weakCategoryNames = analysis.weak.map(w => w.category);
        const categoriesToUse = weakCategoryNames.length > 0 ? weakCategoryNames : ["DBMS", "OOP", "SQL", "Java"];
        
        Object.keys(QUESTION_DATABASE).forEach(cat => {
            QUESTION_DATABASE[cat].forEach(q => {
                if (categoriesToUse.includes(q.category)) {
                    questionPool.push(q);
                }
            });
        });
    } else if (categoryKey === "mistakes_only") {
        const mistakes = StorageEngine.getMistakes();
        questionPool = mistakes.map(m => m.questionObj);
    } else {
        const catKeyClean = categoryKey === "html_css" ? "html_css" : categoryKey;
        const pool = QUESTION_DATABASE[catKeyClean] || QUESTION_DATABASE.java;
        
        if (difficulty === "All") {
            questionPool = [...pool];
        } else {
            questionPool = pool.filter(q => q.difficulty === difficulty);
            if (questionPool.length < count) {
                questionPool = [...pool];
            }
        }
    }

    if (questionPool.length === 0) {
        showToast("No questions found for the selected criteria.", "warning");
        questionPool = [...QUESTION_DATABASE.java];
    }

    const shuffled = shuffleArray(questionPool);
    const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));

    // Reset QuizState
    QuizState.playerName = playerName;
    QuizState.categoryKey = categoryKey;
    QuizState.categoryName = CATEGORY_NAMES[categoryKey] || "Quiz";
    QuizState.difficulty = difficulty;
    QuizState.mode = mode;
    QuizState.questionLimit = selectedQuestions.length;
    QuizState.questions = selectedQuestions;
    QuizState.currentIndex = 0;
    QuizState.userAnswers = {};
    QuizState.userConfidence = {};
    QuizState.perQuestionTime = {};
    QuizState.markedForReview = {};
    QuizState.hintsUsed = {};
    QuizState.learningFeedback = {};
    QuizState.isSubmitted = false;
    QuizState.isDailyChallenge = false;
    QuizState.startTime = Date.now();
    QuizState.currentQuestionStartTime = Date.now();

    // Timer Setup
    if (QuizState.timerInterval) clearInterval(QuizState.timerInterval);

    if (timerVal === "none") {
        QuizState.timeLimitSeconds = null;
        const timerBadge = document.getElementById("dashTimerBadge");
        if (timerBadge) timerBadge.textContent = "⏱️ No Limit";
    } else {
        QuizState.timeLimitSeconds = parseInt(timerVal, 10);
        QuizState.remainingSeconds = QuizState.timeLimitSeconds;
        updateTimerDisplay();
        QuizState.timerInterval = setInterval(handleTimerTick, 1000);
    }

    // Render Quiz Header
    const catHeader = document.getElementById("dashCategory");
    const nameHeader = document.getElementById("dashPlayerName");
    const diffBadge = document.getElementById("dashDifficulty");

    if (catHeader) catHeader.textContent = QuizState.categoryName;
    if (nameHeader) nameHeader.textContent = QuizState.playerName;
    if (diffBadge) diffBadge.textContent = QuizState.difficulty;

    showSection("quizDashboard");
    renderQuestion(0);
    renderQuestionPalette();
}

/**
 * Per-Question Time Tracker Helper
 */
function recordTimeForCurrentQuestion() {
    if (QuizState.currentQuestionStartTime && QuizState.questions[QuizState.currentIndex]) {
        const qId = QuizState.questions[QuizState.currentIndex].id;
        const elapsed = Math.round((Date.now() - QuizState.currentQuestionStartTime) / 1000);
        QuizState.perQuestionTime[qId] = (QuizState.perQuestionTime[qId] || 0) + elapsed;
    }
    QuizState.currentQuestionStartTime = Date.now();
}

/**
 * Render Current Question Card
 */
function renderQuestion(index) {
    recordTimeForCurrentQuestion();
    QuizState.currentIndex = index;
    const q = QuizState.questions[index];
    if (!q) return;

    // Badges & Counters
    const qBadge = document.getElementById("qNumberBadge");
    const qProgressText = document.getElementById("dashProgressText");
    const qProgressBarFill = document.getElementById("dashProgressBarFill");
    const trickyBadge = document.getElementById("trickyBadge");

    if (qBadge) qBadge.textContent = `Question ${index + 1} of ${QuizState.questionLimit}`;
    if (qProgressText) qProgressText.textContent = `Question ${index + 1} of ${QuizState.questionLimit}`;
    if (qProgressBarFill) {
        const pct = ((index + 1) / QuizState.questionLimit) * 100;
        qProgressBarFill.style.width = `${pct}%`;
    }

    if (trickyBadge) {
        trickyBadge.style.display = q.isTricky ? "inline-block" : "none";
    }

    // Question Text
    const qText = document.getElementById("qText");
    if (qText) qText.textContent = q.question;

    // Options Grid
    const optionsGrid = document.getElementById("qOptionsGrid");
    if (optionsGrid) {
        optionsGrid.innerHTML = "";
        q.options.forEach((optText, optIdx) => {
            const card = document.createElement("div");
            card.className = "option-card";
            if (QuizState.userAnswers[q.id] === optIdx) {
                card.classList.add("selected");
            }

            const prefix = String.fromCharCode(65 + optIdx);
            card.innerHTML = `
                <span class="option-prefix">${prefix}</span>
                <span class="option-text-val">${optText}</span>
            `;

            card.addEventListener("click", () => selectOption(optIdx));
            optionsGrid.appendChild(card);
        });
    }

    // Confidence Selector State
    updateConfidenceButtonsUI(q.id);

    // Pre-submission Hint Box
    const hintBox = document.getElementById("qHintCard");
    const hintText = document.getElementById("qHintText");
    if (hintBox && hintText) {
        if (QuizState.hintsUsed[q.id]) {
            hintBox.style.display = "block";
            hintText.textContent = q.hint || "Focus on key domain principles.";
        } else {
            hintBox.style.display = "none";
        }
    }

    // Bookmark & Note Buttons State
    const bmBtn = document.getElementById("bookmarkBtn");
    if (bmBtn) {
        const isBm = StorageEngine.isBookmarked(q.id);
        bmBtn.textContent = isBm ? "📌 Bookmarked" : "📌 Bookmark";
        bmBtn.className = isBm ? "btn btn-primary" : "btn btn-outline";
    }

    const noteInput = document.getElementById("questionNoteInput");
    if (noteInput) {
        noteInput.value = StorageEngine.getNoteForQuestion(q.id);
    }

    // Learning Mode Instant Feedback Box
    const feedbackBox = document.getElementById("learningFeedbackBox");
    if (feedbackBox) {
        if (QuizState.mode === "learning" && QuizState.userAnswers[q.id] !== undefined) {
            renderLearningFeedback(q, feedbackBox);
        } else {
            feedbackBox.style.display = "none";
        }
    }

    // Nav Buttons
    const prevBtn = document.getElementById("prevQBtn");
    const nextBtn = document.getElementById("nextQBtn");
    const markBtn = document.getElementById("markReviewBtn");

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === QuizState.questionLimit - 1;
    if (markBtn) {
        markBtn.textContent = QuizState.markedForReview[q.id] ? "🔖 Marked" : "🔖 Mark for Review";
        markBtn.className = QuizState.markedForReview[q.id] ? "btn btn-warning" : "btn btn-outline";
    }

    renderQuestionPalette();
}

/**
 * Confidence Selector UI Handler
 */
function selectConfidence(level) {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    QuizState.userConfidence[q.id] = level;
    updateConfidenceButtonsUI(q.id);
}

function updateConfidenceButtonsUI(qId) {
    const selectedLevel = QuizState.userConfidence[qId];
    
    const btnUnsure = document.getElementById("confUnsure");
    const btnSomewhat = document.getElementById("confSomewhat");
    const btnVery = document.getElementById("confVery");

    if (btnUnsure) btnUnsure.classList.toggle("selected", selectedLevel === "Not Sure");
    if (btnSomewhat) btnSomewhat.classList.toggle("selected", selectedLevel === "Somewhat Sure");
    if (btnVery) btnVery.classList.toggle("selected", selectedLevel === "Very Sure");
}

/**
 * Option Selection Handler
 */
function selectOption(optIdx) {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    QuizState.userAnswers[q.id] = optIdx;

    // Default confidence to "Very Sure" if not explicitly selected yet
    if (!QuizState.userConfidence[q.id]) {
        QuizState.userConfidence[q.id] = "Somewhat Sure";
    }

    renderQuestion(QuizState.currentIndex);
}

function toggleHint() {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    QuizState.hintsUsed[q.id] = !QuizState.hintsUsed[q.id];
    renderQuestion(QuizState.currentIndex);
}

function saveCurrentNote() {
    const q = QuizState.questions[QuizState.currentIndex];
    const input = document.getElementById("questionNoteInput");
    if (!q || !input) return;

    StorageEngine.saveNote(q.id, input.value);
    showToast("Personal note saved for this question!", "success");
}

function toggleBookmarkCurrent() {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    StorageEngine.toggleBookmark(q);
    renderQuestion(QuizState.currentIndex);
}

function toggleMarkForReview() {
    const q = QuizState.questions[QuizState.currentIndex];
    if (!q) return;

    QuizState.markedForReview[q.id] = !QuizState.markedForReview[q.id];
    renderQuestion(QuizState.currentIndex);
}

function prevQuestion() {
    if (QuizState.currentIndex > 0) {
        renderQuestion(QuizState.currentIndex - 1);
    }
}

function nextQuestion() {
    if (QuizState.currentIndex < QuizState.questionLimit - 1) {
        renderQuestion(QuizState.currentIndex + 1);
    }
}

/**
 * Question Palette Side Grid
 */
function renderQuestionPalette() {
    const paletteGrid = document.getElementById("questionPalette");
    if (!paletteGrid) return;

    paletteGrid.innerHTML = "";
    let answered = 0;
    let marked = 0;

    QuizState.questions.forEach((q, idx) => {
        const item = document.createElement("div");
        item.className = "palette-item";
        item.textContent = idx + 1;

        const isCurrent = idx === QuizState.currentIndex;
        const isAns = QuizState.userAnswers[q.id] !== undefined;
        const isMrk = QuizState.markedForReview[q.id];

        if (isAns) answered++;
        if (isMrk) marked++;

        if (isCurrent) item.classList.add("current");
        else if (isAns) item.classList.add("answered");
        else if (isMrk) item.classList.add("marked");
        else item.classList.add("unanswered");

        item.addEventListener("click", () => renderQuestion(idx));
        paletteGrid.appendChild(item);
    });

    const sideAns = document.getElementById("sideAnsweredCount");
    const sideUnans = document.getElementById("sideUnansweredCount");
    const sideMrk = document.getElementById("sideMarkedCount");

    if (sideAns) sideAns.textContent = answered;
    if (sideUnans) sideUnans.textContent = QuizState.questionLimit - answered;
    if (sideMrk) sideMrk.textContent = marked;
}

/**
 * Learning Mode Instant Feedback Renderer
 */
function renderLearningFeedback(q, container) {
    container.style.display = "block";
    const userAns = QuizState.userAnswers[q.id];
    const isCorrect = userAns === q.correct;

    container.innerHTML = `
        <div style="padding: 1rem; border-radius: 8px; background: ${isCorrect ? 'var(--success-light)' : 'var(--danger-light)'}; border: 1px solid ${isCorrect ? 'var(--success-color)' : 'var(--danger-color)'};">
            <h4 style="color: ${isCorrect ? 'var(--success-color)' : 'var(--danger-color)'}; margin-bottom: 0.5rem;">
                ${isCorrect ? '✅ Correct Answer!' : '❌ Incorrect Answer'}
            </h4>
            <p style="font-size: 0.9rem; color: var(--text-primary); margin-bottom: 0.5rem;">
                <strong>Explanation:</strong> ${q.explanation}
            </p>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                💡 <strong>Quick Tip:</strong> ${q.quickTip || ''}
            </div>
        </div>
    `;
}

/**
 * Timer Handler
 */
function handleTimerTick() {
    if (QuizState.remainingSeconds === null) return;

    QuizState.remainingSeconds--;
    updateTimerDisplay();

    if (QuizState.remainingSeconds <= 0) {
        clearInterval(QuizState.timerInterval);
        showToast("⏰ Time is up! Submitting quiz...", "warning");
        submitQuiz();
    }
}

function updateTimerDisplay() {
    const timerBadge = document.getElementById("dashTimerBadge");
    if (!timerBadge || QuizState.remainingSeconds === null) return;

    const mins = Math.floor(QuizState.remainingSeconds / 60);
    const secs = QuizState.remainingSeconds % 60;
    const formatted = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    timerBadge.textContent = formatted;

    if (QuizState.remainingSeconds < 60) {
        timerBadge.style.color = "var(--danger-color)";
    }
}

/**
 * Submit Quiz & Performance Evaluation
 */
function submitQuiz() {
    recordTimeForCurrentQuestion();
    if (QuizState.timerInterval) clearInterval(QuizState.timerInterval);

    QuizState.isSubmitted = true;

    // Calculate Metrics
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    // Confidence metrics
    let confCorrect = 0;
    let confWrong = 0;
    let unsureCorrect = 0;
    let unsureWrong = 0;

    QuizState.questions.forEach(q => {
        const userAns = QuizState.userAnswers[q.id];
        const conf = QuizState.userConfidence[q.id] || "Somewhat Sure";

        if (userAns === undefined) {
            unansweredCount++;
        } else if (userAns === q.correct) {
            correctCount++;
            if (conf === "Very Sure" || conf === "Somewhat Sure") confCorrect++;
            else unsureCorrect++;
        } else {
            wrongCount++;
            // Save to Mistakes Notebook automatically
            StorageEngine.saveMistake(q, userAns);

            if (conf === "Very Sure") confWrong++;
            else unsureWrong++;
        }
    });

    const totalQ = QuizState.questionLimit;
    const scorePct = Math.round((correctCount / totalQ) * 100);
    const timeSpentSec = Math.round((Date.now() - QuizState.startTime) / 1000);
    const minsSpent = Math.floor(timeSpentSec / 60);
    const secsSpent = timeSpentSec % 60;
    const timeFormatted = `${minsSpent}m ${secsSpent}s`;

    // Category Previous Score Comparison ("Beat Your Previous Score")
    const prevCategoryScore = StorageEngine.saveCategoryScore(QuizState.categoryName, correctCount, totalQ);

    // Save Attempt to History
    const attemptData = {
        id: `att_${Date.now()}`,
        date: new Date().toLocaleDateString(),
        playerName: QuizState.playerName,
        category: QuizState.categoryName,
        difficulty: QuizState.difficulty,
        score: correctCount,
        totalQuestions: totalQ,
        percentage: scorePct,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        unanswered: unansweredCount,
        timeTakenSeconds: timeSpentSec,
        timeFormatted: timeFormatted,
        userAnswers: QuizState.userAnswers,
        userConfidence: QuizState.userConfidence,
        perQuestionTime: QuizState.perQuestionTime
    };

    StorageEngine.saveQuizAttempt(attemptData);

    // Render Result Dashboard Screen
    renderResultDashboard(attemptData, prevCategoryScore, {
        confCorrect,
        confWrong,
        unsureCorrect,
        unsureWrong
    });

    showSection("resultSection");
}

/**
 * Render Advanced Result Dashboard Screen
 */
function renderResultDashboard(attempt, prevScore, confStats) {
    const resPlayer = document.getElementById("resPlayerName");
    const resCat = document.getElementById("resCategory");
    const resDiff = document.getElementById("resDifficulty");
    const resPct = document.getElementById("resPercentage");
    const resCircle = document.getElementById("resCircleProgress");

    if (resPlayer) resPlayer.textContent = attempt.playerName;
    if (resCat) resCat.textContent = attempt.category;
    if (resDiff) resDiff.textContent = attempt.difficulty;
    if (resPct) resPct.textContent = `${attempt.percentage}%`;

    if (resCircle) {
        const circumference = 2 * Math.PI * 70;
        const offset = circumference - (attempt.percentage / 100) * circumference;
        resCircle.style.strokeDashoffset = offset;
    }

    // Feedback message
    const resFB = document.getElementById("resFeedback");
    if (resFB) {
        if (attempt.percentage >= 90) resFB.textContent = "🏆 Outstanding Performance! Master Level Accuracy!";
        else if (attempt.percentage >= 70) resFB.textContent = "🎉 Great Job! Solid concept understanding!";
        else if (attempt.percentage >= 50) resFB.textContent = "👍 Good Effort! Review recommended videos to boost accuracy.";
        else resFB.textContent = "📖 Needs Practice! Focus on weak concepts in the mistake notebook.";
    }

    // Detailed metrics
    document.getElementById("resTotal").textContent = attempt.totalQuestions;
    document.getElementById("resCorrect").textContent = attempt.correctAnswers;
    document.getElementById("resWrong").textContent = attempt.wrongAnswers;
    document.getElementById("resUnanswered").textContent = attempt.unanswered;
    document.getElementById("resScore").textContent = `${attempt.score} / ${attempt.totalQuestions}`;
    document.getElementById("resAccuracy").textContent = `${attempt.percentage}%`;
    document.getElementById("resTimeTaken").textContent = attempt.timeFormatted;
    document.getElementById("resXPGained").textContent = `+${attempt.score * 10 + 25} XP`;

    // Beat Your Previous Score Banner
    const beatCard = document.getElementById("beatPreviousScoreCard");
    const beatMsg = document.getElementById("beatScoreMessage");
    const beatPrev = document.getElementById("beatPrevVal");
    const beatCurr = document.getElementById("beatCurrVal");
    const beatDiff = document.getElementById("beatDiffVal");

    if (beatCard && prevScore) {
        beatCard.style.display = "block";
        beatPrev.textContent = `${prevScore.score}/${prevScore.total}`;
        beatCurr.textContent = `${attempt.score}/${attempt.totalQuestions}`;
        
        const diff = attempt.score - prevScore.score;
        if (diff > 0) {
            beatMsg.textContent = `Great! You improved from ${prevScore.score} to ${attempt.score}.`;
            beatDiff.textContent = `+${diff}`;
            beatDiff.style.color = "var(--success-color)";
        } else if (diff < 0) {
            beatMsg.textContent = `Keep practicing. Your previous score was ${prevScore.score}.`;
            beatDiff.textContent = `${diff}`;
            beatDiff.style.color = "var(--warning-color)";
        } else {
            beatMsg.textContent = `You maintained your previous score of ${prevScore.score}!`;
            beatDiff.textContent = `0`;
            beatDiff.style.color = "var(--accent-blue)";
        }
    } else if (beatCard) {
        beatCard.style.display = "none";
    }

    // Confidence Breakdown Summary
    document.getElementById("confCorrectVal").textContent = confStats.confCorrect;
    document.getElementById("confWrongVal").textContent = confStats.confWrong;
    document.getElementById("unsureCorrectVal").textContent = confStats.unsureCorrect;
    document.getElementById("unsureWrongVal").textContent = confStats.unsureWrong;

    const highConfAlert = document.getElementById("highConfWrongAlert");
    if (highConfAlert) {
        highConfAlert.style.display = confStats.confWrong > 0 ? "block" : "none";
    }

    // Time Analysis Summary
    const timeTotalSec = attempt.timeTakenSeconds;
    const avgSec = Math.round(timeTotalSec / attempt.totalQuestions);
    document.getElementById("timeTotalVal").textContent = `${timeTotalSec}s`;
    document.getElementById("timeAvgVal").textContent = `${avgSec}s`;

    let fastestQ = null;
    let slowestQ = null;
    let minT = Infinity;
    let maxT = -1;

    QuizState.questions.forEach((q, idx) => {
        const t = QuizState.perQuestionTime[q.id] || 5;
        if (t < minT) { minT = t; fastestQ = `Q${idx + 1} (${t}s)`; }
        if (t > maxT) { maxT = t; slowestQ = `Q${idx + 1} (${t}s)`; }
    });

    document.getElementById("timeFastestVal").textContent = fastestQ || "Q1 (0s)";
    document.getElementById("timeSlowestVal").textContent = slowestQ || "Q1 (0s)";

    const slowAlert = document.getElementById("slowQuestionAlert");
    if (slowAlert) {
        slowAlert.style.display = maxT > avgSec * 1.8 ? "block" : "none";
    }

    // Render Weakness Heatmap & Video Recommendations
    renderResultHeatmap();
    renderResultVideoRecommendations();
}

/**
 * Render Heatmap in Result & Dashboard
 */
function renderResultHeatmap() {
    const container = document.getElementById("resultHeatmapContainer");
    if (!container) return;

    const analysis = StorageEngine.getWeakSubjectsAnalysis();
    container.innerHTML = "";

    Object.keys(analysis.catStats).forEach(cat => {
        const stat = analysis.catStats[cat];
        let statusClass = "status-average";
        let statusText = "Average 🟡";

        if (stat.total > 0) {
            if (stat.percentage >= 75) { statusClass = "status-strong"; statusText = "Strong 🟢"; }
            else if (stat.percentage < 50) { statusClass = "status-weak"; statusText = "Weak 🔴"; }
        } else {
            statusText = "Not Attempted ⚪";
        }

        const row = document.createElement("div");
        row.className = "heatmap-row";
        row.innerHTML = `
            <div class="heatmap-label-bar">
                <span>${cat}</span>
                <span>${stat.percentage}% (${statusText})</span>
            </div>
            <div class="heatmap-bar-wrap">
                <div class="heatmap-bar-fill ${statusClass}" style="width: ${stat.percentage}%;"></div>
            </div>
        `;
        container.appendChild(row);
    });
}

/**
 * Render Video Recommendations Grid in Result & Dashboard
 */
function renderResultVideoRecommendations() {
    const grid = document.getElementById("resultVideoRecGrid");
    if (!grid) return;

    const analysis = StorageEngine.getWeakSubjectsAnalysis();
    grid.innerHTML = "";

    const categoriesToRecommend = analysis.weak.length > 0 
        ? analysis.weak.map(w => w.category) 
        : [QuizState.categoryName];

    categoriesToRecommend.forEach(cat => {
        const rec = RECOMMENDED_LEARNING[cat];
        if (rec) {
            const card = document.createElement("div");
            card.className = "video-rec-card";
            card.innerHTML = `
                <div>
                    <span class="badge badge-warning" style="margin-bottom: 0.5rem;">${cat} — Recommended</span>
                    <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">${rec.topics[0]}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">${rec.description}</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn btn-primary" style="flex: 1; padding: 8px;" onclick="openVideoModal('${cat}', '${rec.topics[0]}')">▶️ Watch Video</button>
                    <button type="button" class="btn btn-outline" style="padding: 8px;" onclick="startWeakPractice()">🎯 Practice</button>
                </div>
            `;
            grid.appendChild(card);
        }
    });
}

/**
 * User Dashboard Section Renderer
 */
function renderUserDashboard() {
    const stats = StorageEngine.getUserDashboardStats();
    const analysis = StorageEngine.getWeakSubjectsAnalysis();

    // Headers & Metrics
    const welcome = document.getElementById("userWelcomeHeader");
    const streak = document.getElementById("dashStreakText");
    const xpText = document.getElementById("dashXPText");
    const lvlTitle = document.getElementById("dashLevelTitle");
    const xpBar = document.getElementById("dashXPBarFill");

    if (welcome) welcome.textContent = `Welcome back, ${stats.playerName}`;
    if (streak) streak.textContent = `🔥 ${stats.streak.currentStreak} Day Streak`;
    if (xpText) xpText.textContent = `${stats.currentXP} XP`;
    if (lvlTitle) lvlTitle.textContent = `Level ${stats.currentLevel.level} — ${stats.currentLevel.title}`;

    if (xpBar) {
        const currMin = stats.currentLevel.minXP;
        const currMax = stats.currentLevel.maxXP;
        const pct = Math.min(100, Math.round(((stats.currentXP - currMin) / (currMax - currMin)) * 100));
        xpBar.style.width = `${pct}%`;
    }

    // Grid Values
    document.getElementById("userDashCompleted").textContent = stats.quizzesCompleted;
    document.getElementById("userDashBest").textContent = stats.bestScore;
    document.getElementById("userDashAvg").textContent = `${stats.avgPercentage}%`;
    document.getElementById("userDashAttempted").textContent = stats.totalAttempted;
    document.getElementById("userDashMistakes").textContent = stats.totalMistakes;
    document.getElementById("userDashAccuracy").textContent = `${stats.accuracy}%`;

    // Smart Weak Area Banner
    const weakTitle = document.getElementById("weakSubjectTitle");
    if (weakTitle) {
        if (analysis.primaryWeak) {
            weakTitle.textContent = `Your Weak Area: ${analysis.primaryWeak.category} needs more practice (${analysis.primaryWeak.percentage}% accuracy).`;
        } else {
            weakTitle.textContent = "Keep taking quizzes to analyze your category performance!";
        }
    }

    // Dashboard Heatmap
    const dbHeatmap = document.getElementById("dashboardHeatmapContainer");
    if (dbHeatmap) {
        dbHeatmap.innerHTML = "";
        Object.keys(analysis.catStats).forEach(cat => {
            const stat = analysis.catStats[cat];
            let statusClass = "status-average";
            let statusText = "Average 🟡";

            if (stat.total > 0) {
                if (stat.percentage >= 75) { statusClass = "status-strong"; statusText = "Strong 🟢"; }
                else if (stat.percentage < 50) { statusClass = "status-weak"; statusText = "Weak 🔴"; }
            } else {
                statusText = "Not Attempted ⚪";
            }

            const row = document.createElement("div");
            row.className = "heatmap-row";
            row.innerHTML = `
                <div class="heatmap-label-bar">
                    <span>${cat}</span>
                    <span>${stat.percentage}% (${statusText})</span>
                </div>
                <div class="heatmap-bar-wrap">
                    <div class="heatmap-bar-fill ${statusClass}" style="width: ${stat.percentage}%;"></div>
                </div>
            `;
            dbHeatmap.appendChild(row);
        });
    }

    // Dashboard Video Recommendations Grid
    const dashVidGrid = document.getElementById("dashVideoRecGrid");
    if (dashVidGrid) {
        dashVidGrid.innerHTML = "";
        const categoriesToRecommend = analysis.weak.length > 0 
            ? analysis.weak.map(w => w.category) 
            : ["DBMS", "OOP", "SQL", "Java"];

        categoriesToRecommend.forEach(cat => {
            const rec = RECOMMENDED_LEARNING[cat];
            if (rec) {
                const card = document.createElement("div");
                card.className = "video-rec-card";
                card.innerHTML = `
                    <div>
                        <span class="badge badge-warning" style="margin-bottom: 0.5rem;">${cat} — Recommended</span>
                        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">${rec.topics[0]}</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">${rec.description}</p>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button type="button" class="btn btn-primary" style="flex: 1; padding: 8px;" onclick="openVideoModal('${cat}', '${rec.topics[0]}')">▶️ Watch Video</button>
                        <button type="button" class="btn btn-outline" style="padding: 8px;" onclick="startWeakPractice()">🎯 Practice</button>
                    </div>
                `;
                dashVidGrid.appendChild(card);
            }
        });
    }
}

/**
 * Technical Placement Interview Preparation Mode Handler
 */
function renderInterviewMode(selectedCategory = "all") {
    const container = document.getElementById("interviewCardsContainer");
    if (!container) return;

    container.innerHTML = "";

    // Build list of interview questions across database
    let interviewList = [];
    Object.keys(QUESTION_DATABASE).forEach(cat => {
        QUESTION_DATABASE[cat].forEach(q => {
            if (selectedCategory === "all" || q.category === selectedCategory) {
                interviewList.push(q);
            }
        });
    });

    if (interviewList.length === 0) {
        container.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">No interview questions available for this category.</p>`;
        return;
    }

    interviewList.forEach(q => {
        const card = document.createElement("div");
        card.className = "interview-card";
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 8px;">
                <span class="badge badge-info">${q.category} • ${q.topic}</span>
                <span class="badge badge-warning">${q.difficulty}</span>
            </div>
            
            <h3 style="font-size: 1.25rem; color: var(--text-primary); margin-bottom: 1.25rem;">
                ${q.question}
            </h3>

            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.5rem;">
                ${q.options.map((opt, idx) => `
                    <div class="option-card ${idx === q.correct ? 'correct' : ''}" style="padding: 10px 14px; font-size: 0.9rem;">
                        <span class="option-prefix">${String.fromCharCode(65 + idx)}</span>
                        <span>${opt} ${idx === q.correct ? '✅ (Correct Answer)' : ''}</span>
                    </div>
                `).join('')}
            </div>

            <div style="background: var(--bg-secondary); border-radius: 12px; padding: 1.25rem; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <strong style="color: var(--accent-blue);">📖 Detailed Explanation:</strong>
                    <p style="font-size: 0.95rem; color: var(--text-primary); margin-top: 4px;">${q.explanation}</p>
                </div>

                <div>
                    <strong style="color: var(--warning-color);">🎯 What the Interviewer is Testing:</strong>
                    <p style="font-size: 0.95rem; color: var(--text-primary); margin-top: 4px;">${q.interviewTesting || 'Tests core conceptual depth and implementation knowledge.'}</p>
                </div>

                <div>
                    <strong style="color: var(--danger-color);">⚠️ Common Candidate Pitfall:</strong>
                    <p style="font-size: 0.95rem; color: var(--text-primary); margin-top: 4px;">${q.commonMistake}</p>
                </div>

                <div>
                    <strong style="color: var(--success-color);">💬 Possible Follow-up Question:</strong>
                    <p style="font-size: 0.95rem; color: var(--text-primary); margin-top: 4px;">"${q.interviewFollowUp || 'How would you optimize this for high-scale concurrent execution?'}"</p>
                </div>

                <div>
                    <strong style="color: var(--accent-blue);">💡 Quick Interview Tip:</strong>
                    <p style="font-size: 0.95rem; color: var(--text-primary); margin-top: 4px;">${q.quickTip}</p>
                </div>
            </div>

            <div style="margin-top: 1.25rem; text-align: right;">
                <button type="button" class="btn btn-primary" onclick="openVideoModal('${q.category}', '${q.topic}')">▶️ Watch Learning Video</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterInterviewCat(catName, btnEl) {
    document.querySelectorAll("#interviewCatTabs .tab-btn").forEach(b => b.classList.remove("active"));
    if (btnEl) btnEl.classList.add("active");
    renderInterviewMode(catName);
}

/**
 * Saved Mistakes Notebook ("My Mistakes") Renderer
 */
function renderMistakesNotebook() {
    const container = document.getElementById("mistakesListContainer");
    const badge = document.getElementById("mistakesCountBadge");
    if (!container) return;

    const mistakes = StorageEngine.getMistakes();
    if (badge) badge.textContent = `${mistakes.length} Saved Mistakes`;

    if (mistakes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <h3>🎉 Your Mistakes Notebook is empty!</h3>
                <p>When you answer a question wrong in any quiz mode, it will automatically show up here for revision.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    mistakes.forEach(m => {
        const q = m.questionObj;
        const userOptText = q.options[m.userAnswer] || "Unanswered";
        const correctOptText = q.options[q.correct];

        const card = document.createElement("div");
        card.className = "mistake-card";
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 8px;">
                <span class="badge badge-warning">${q.category} • ${q.topic || 'Core Concept'}</span>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">Saved: ${m.date}</span>
            </div>

            <h3 style="font-size: 1.15rem; color: var(--text-primary); margin-bottom: 1rem;">${q.question}</h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div style="padding: 10px 14px; background: rgba(239, 68, 68, 0.15); border: 1px solid var(--danger-color); border-radius: 8px;">
                    <strong style="color: var(--danger-color);">❌ Your Answer:</strong>
                    <div style="color: var(--text-primary); font-weight: 600; margin-top: 4px;">${userOptText}</div>
                </div>
                <div style="padding: 10px 14px; background: rgba(16, 185, 129, 0.15); border: 1px solid var(--success-color); border-radius: 8px;">
                    <strong style="color: var(--success-color);">✅ Correct Answer:</strong>
                    <div style="color: var(--text-primary); font-weight: 600; margin-top: 4px;">${correctOptText}</div>
                </div>
            </div>

            <div style="background: var(--bg-secondary); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <p style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.5rem;"><strong>📖 Why is this correct?</strong> ${q.explanation}</p>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;"><strong>🧠 Concept:</strong> ${q.concept || ''}</p>
                <p style="font-size: 0.9rem; color: var(--danger-color);"><strong>⚠️ Common Mistake:</strong> ${q.commonMistake || ''}</p>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <button type="button" class="btn btn-primary" onclick="openVideoModal('${q.category}', '${q.topic || 'Basics'}')">▶️ Watch Video</button>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn btn-secondary" onclick="openPracticeModal('${q.id}')">🎯 Practice Question</button>
                    <button type="button" class="btn btn-outline" onclick="removeSingleMistake('${q.id}')">🗑️ Remove</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function removeSingleMistake(qId) {
    StorageEngine.removeMistake(qId);
    showToast("Mistake removed from notebook!", "info");
    renderMistakesNotebook();
}

function clearMistakesNotebook() {
    StorageEngine.clearMistakes();
    showToast("Mistakes notebook cleared!", "info");
    renderMistakesNotebook();
}

/**
 * Complete Answer Review Handler
 */
function reviewAnswers() {
    const list = document.getElementById("reviewQuestionsList");
    if (!list) return;

    list.innerHTML = "";

    QuizState.questions.forEach((q, idx) => {
        const userAns = QuizState.userAnswers[q.id];
        const isCorrect = userAns === q.correct;
        const isUnans = userAns === undefined;
        const conf = QuizState.userConfidence[q.id] || "Somewhat Sure";

        let statusBadge = `<span class="badge badge-success">✅ Correct</span>`;
        if (isUnans) statusBadge = `<span class="badge badge-warning">⚪ Unanswered</span>`;
        else if (!isCorrect) statusBadge = `<span class="badge badge-danger">❌ Wrong</span>`;

        const confBadge = `<span class="badge badge-info">Confidence: ${conf}</span>`;

        const card = document.createElement("div");
        card.className = "category-card";
        card.style.marginBottom = "1.5rem";
        card.style.textAlign = "left";

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span class="badge badge-info">Q${idx + 1}</span>
                    ${statusBadge}
                    ${confBadge}
                </div>
                ${q.isTricky ? '<span class="badge badge-warning">⚠️ Tricky Question</span>' : ''}
            </div>

            <h3 style="font-size: 1.15rem; color: var(--text-primary); margin-bottom: 1rem;">${q.question}</h3>

            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.25rem;">
                ${q.options.map((opt, oIdx) => {
                    let optStyle = "padding: 10px 14px; font-size: 0.9rem;";
                    if (oIdx === q.correct) optStyle += " background: var(--success-light); border-color: var(--success-color);";
                    else if (oIdx === userAns && !isCorrect) optStyle += " background: var(--danger-light); border-color: var(--danger-color);";

                    return `
                        <div class="option-card" style="${optStyle}">
                            <span class="option-prefix">${String.fromCharCode(65 + oIdx)}</span>
                            <span>${opt} ${oIdx === q.correct ? '✅ (Correct Answer)' : ''} ${oIdx === userAns && !isCorrect ? '❌ (Your Answer)' : ''}</span>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="background: var(--bg-secondary); border-radius: 8px; padding: 1.25rem; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
                <div><strong style="color: var(--accent-blue);">📖 Why is this correct?</strong> <p style="margin-top: 2px;">${q.explanation}</p></div>
                ${q.isTricky && q.trickyExplanation ? `<div><strong style="color: var(--warning-color);">⚠️ Why other options look correct & Common Pitfall:</strong> <p style="margin-top: 2px;">${q.trickyExplanation}</p></div>` : ''}
                <div><strong style="color: var(--success-color);">🧠 Concept to Remember:</strong> <p style="margin-top: 2px;">${q.concept}</p></div>
                <div><strong style="color: var(--danger-color);">⚠️ Common Mistake:</strong> <p style="margin-top: 2px;">${q.commonMistake}</p></div>
                <div><strong style="color: var(--warning-color);">💡 Quick Tip:</strong> <p style="margin-top: 2px;">${q.quickTip}</p></div>
            </div>

            <div style="margin-top: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <button type="button" class="btn btn-primary" onclick="openVideoModal('${q.category}', '${q.topic}')">▶️ Watch Video</button>
                <button type="button" class="btn btn-secondary" onclick="openPracticeModal('${q.id}')">🎯 Practice Similar Question</button>
            </div>
        `;
        list.appendChild(card);
    });

    showSection("reviewSection");
}

function reviewWrongAnswersOnly() {
    reviewAnswers();
}

function backToResults() {
    showSection("resultSection");
}

/**
 * Video Player Modal Controls
 */
function openVideoModal(category, topicName) {
    const modal = document.getElementById("videoModal");
    const title = document.getElementById("videoModalTitle");
    const desc = document.getElementById("videoModalDesc");
    const embedBox = document.getElementById("videoEmbedBox");

    const rec = RECOMMENDED_LEARNING[category] || RECOMMENDED_LEARNING.Java;

    if (title) title.textContent = `🎥 Learning Video: ${category} — ${topicName || rec.topics[0]}`;
    if (desc) desc.textContent = rec.description;

    if (embedBox) {
        embedBox.innerHTML = `
            <iframe src="${rec.embedUrl}?autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        `;
    }

    if (modal) modal.style.display = "flex";
}

function closeVideoModal() {
    const modal = document.getElementById("videoModal");
    const embedBox = document.getElementById("videoEmbedBox");
    if (embedBox) embedBox.innerHTML = "";
    if (modal) modal.style.display = "none";
}

/**
 * Practice Similar / Retry Modal Controls
 */
function openPracticeModal(questionId) {
    const modal = document.getElementById("practiceModal");
    const content = document.getElementById("practiceModalContent");
    if (!modal || !content) return;

    let targetQ = null;
    Object.keys(QUESTION_DATABASE).forEach(cat => {
        const found = QUESTION_DATABASE[cat].find(q => q.id === questionId);
        if (found) targetQ = found;
    });

    if (!targetQ) targetQ = QUESTION_DATABASE.java[0];

    content.innerHTML = `
        <span class="badge badge-info" style="margin-bottom: 1rem;">${targetQ.category} • Retry Question</span>
        <h3 style="font-size: 1.15rem; color: var(--text-primary); margin-bottom: 1.25rem;">${targetQ.question}</h3>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.5rem;" id="practiceModalOptions">
            ${targetQ.options.map((opt, idx) => `
                <div class="option-card" onclick="submitPracticeModalAnswer(${idx}, ${targetQ.correct}, '${targetQ.explanation.replace(/'/g, "\\'")}')" style="padding: 10px 14px; font-size: 0.9rem;">
                    <span class="option-prefix">${String.fromCharCode(65 + idx)}</span>
                    <span>${opt}</span>
                </div>
            `).join('')}
        </div>

        <div id="practiceModalFeedback" style="display: none; margin-bottom: 1rem;"></div>
        <div style="text-align: right;">
            <button type="button" class="btn btn-secondary" onclick="closePracticeModal()">Close</button>
        </div>
    `;

    modal.style.display = "flex";
}

function submitPracticeModalAnswer(selectedIdx, correctIdx, explanationText) {
    const feedback = document.getElementById("practiceModalFeedback");
    if (!feedback) return;

    const isCorrect = selectedIdx === correctIdx;
    feedback.style.display = "block";
    feedback.innerHTML = `
        <div style="padding: 1rem; border-radius: 8px; background: ${isCorrect ? 'var(--success-light)' : 'var(--danger-light)'}; border: 1px solid ${isCorrect ? 'var(--success-color)' : 'var(--danger-color)'};">
            <h4 style="color: ${isCorrect ? 'var(--success-color)' : 'var(--danger-color)'}; margin-bottom: 0.5rem;">
                ${isCorrect ? '🎉 Correct! Great Improvement!' : '❌ Still Incorrect! Learn from explanation below:'}
            </h4>
            <p style="font-size: 0.9rem; color: var(--text-primary);">${explanationText}</p>
        </div>
    `;

    if (isCorrect) {
        showToast("Great job! You mastered this question!", "success");
    }
}

function closePracticeModal() {
    const modal = document.getElementById("practiceModal");
    if (modal) modal.style.display = "none";
}

/**
 * Daily Challenge Handler
 */
function renderDailyChallengeCard() {
    const status = StorageEngine.getDailyChallengeData();
    const btn = document.getElementById("dailyStartBtn");
    const badge = document.getElementById("dailyStatusBadge");

    if (status.completed) {
        if (badge) {
            badge.textContent = `✅ Completed Today (Score: ${status.score}/${status.total})`;
            badge.className = "badge badge-success";
        }
        if (btn) {
            btn.disabled = true;
            btn.textContent = "✅ Challenge Completed Today";
        }
    }
}

function startDailyChallenge() {
    const status = StorageEngine.getDailyChallengeData();
    if (status.completed) {
        showToast("You have already completed today's daily challenge!", "info");
        return;
    }

    let allQuestions = [];
    Object.keys(QUESTION_DATABASE).forEach(cat => {
        allQuestions = allQuestions.concat(QUESTION_DATABASE[cat]);
    });

    const shuffled = shuffleArray(allQuestions).slice(0, 5);

    QuizState.playerName = StorageEngine.getPlayerName();
    QuizState.categoryKey = "daily";
    QuizState.categoryName = "Daily Challenge";
    QuizState.difficulty = "Medium";
    QuizState.mode = "exam";
    QuizState.questionLimit = 5;
    QuizState.questions = shuffled;
    QuizState.currentIndex = 0;
    QuizState.userAnswers = {};
    QuizState.userConfidence = {};
    QuizState.perQuestionTime = {};
    QuizState.markedForReview = {};
    QuizState.hintsUsed = {};
    QuizState.learningFeedback = {};
    QuizState.isSubmitted = false;
    QuizState.isDailyChallenge = true;
    QuizState.startTime = Date.now();
    QuizState.currentQuestionStartTime = Date.now();
    QuizState.remainingSeconds = 300;

    if (QuizState.timerInterval) clearInterval(QuizState.timerInterval);
    QuizState.timerInterval = setInterval(handleTimerTick, 1000);

    showSection("quizDashboard");
    renderQuestion(0);
    renderQuestionPalette();
}

/**
 * Bookmarks Section Renderer
 */
function renderBookmarks() {
    const list = document.getElementById("bookmarksList");
    const emptyState = document.getElementById("bookmarksEmptyState");
    if (!list) return;

    const bookmarks = StorageEngine.getBookmarks();
    if (bookmarks.length === 0) {
        list.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";
    list.innerHTML = "";

    bookmarks.forEach(bm => {
        const card = document.createElement("div");
        card.className = "category-card";
        card.style.marginBottom = "1.25rem";
        card.style.textAlign = "left";

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span class="badge badge-info">${bm.category} • ${bm.difficulty}</span>
                <button type="button" class="btn btn-outline" style="padding: 4px 10px; font-size: 0.8rem;" onclick="removeBookmark('${bm.id}')">🗑️ Remove</button>
            </div>
            <h4 style="font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.75rem;">${bm.question}</h4>
            <div style="font-size: 0.9rem; color: var(--text-secondary); background: var(--bg-secondary); padding: 0.75rem; border-radius: 8px;">
                💡 <strong>Hint:</strong> ${bm.hint || ''}<br>
                📖 <strong>Explanation:</strong> ${bm.explanation || ''}
            </div>
        `;
        list.appendChild(card);
    });
}

function removeBookmark(qId) {
    let bookmarks = StorageEngine.getBookmarks();
    bookmarks = bookmarks.filter(b => b.id !== qId);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    showToast("Bookmark removed", "info");
    renderBookmarks();
}

/**
 * Achievements & Badges Renderer
 */
function renderAchievements() {
    const grid = document.getElementById("achievementsGrid");
    if (!grid) return;

    const unlocked = StorageEngine.getUnlockedAchievements();
    grid.innerHTML = "";

    BADGES_CONFIG.forEach(b => {
        const isUnlocked = unlocked.includes(b.id);
        const card = document.createElement("div");
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;

        card.innerHTML = `
            <div class="achievement-icon">${b.icon}</div>
            <h4>${b.title}</h4>
            <p>${b.desc}</p>
            <span class="badge ${isUnlocked ? 'badge-success' : 'badge-info'}" style="margin-top: 0.5rem; display: inline-block;">
                ${isUnlocked ? '✅ Unlocked' : '🔒 Locked'}
            </span>
        `;
        grid.appendChild(card);
    });
}

/**
 * Local Leaderboard Renderer
 */
function renderLeaderboard() {
    const top3 = document.getElementById("top3Container");
    const tbody = document.getElementById("leaderboardTableBody");
    if (!tbody) return;

    const leaderboard = StorageEngine.getLeaderboard();

    if (top3) {
        top3.innerHTML = "";
        const top3List = leaderboard.slice(0, 3);
        top3List.forEach((entry, idx) => {
            const card = document.createElement("div");
            card.className = `top-player-card rank-${idx + 1}`;
            card.innerHTML = `
                <div class="rank-badge">${idx === 0 ? '🥇 1st Place' : idx === 1 ? '🥈 2nd Place' : '🥉 3rd Place'}</div>
                <div class="player-name">${entry.name}</div>
                <div class="player-score">${entry.xp} XP</div>
                <div class="player-meta">Level ${entry.level} • ${entry.percentage}% Accuracy</div>
            `;
            top3.appendChild(card);
        });
    }

    tbody.innerHTML = "";
    leaderboard.forEach((entry, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>#${idx + 1}</td>
            <td><strong>${entry.name}</strong></td>
            <td><span class="badge badge-info">Level ${entry.level}</span></td>
            <td style="color: var(--warning-color); font-weight: 700;">${entry.xp} XP</td>
            <td>${entry.category || 'Mixed'}</td>
            <td>${entry.percentage}%</td>
            <td style="color: var(--text-secondary); font-size: 0.85rem;">${entry.date}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Quiz Attempt History Renderer
 */
function renderHistory() {
    const tbody = document.getElementById("historyTableBody");
    const emptyState = document.getElementById("historyEmptyState");
    if (!tbody) return;

    const history = StorageEngine.getHistory();

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
            <td>#${history.length - idx}</td>
            <td><strong>${h.playerName}</strong></td>
            <td><span class="badge badge-info">${h.category}</span></td>
            <td>${h.difficulty}</td>
            <td style="font-weight: 700; color: var(--accent-blue);">${h.score} / ${h.totalQuestions}</td>
            <td><strong>${h.percentage}%</strong></td>
            <td>${h.timeFormatted || 'N/A'}</td>
            <td style="color: var(--text-secondary); font-size: 0.85rem;">${h.date}</td>
        `;
        tbody.appendChild(row);
    });
}

function clearUserHistory() {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    showToast("Quiz history cleared!", "info");
    renderHistory();
    renderUserDashboard();
}

/**
 * Profile Renderer
 */
function renderProfile() {
    const stats = StorageEngine.getUserDashboardStats();
    const nameEl = document.getElementById("profName");
    const lvlEl = document.getElementById("profLevel");
    const xpEl = document.getElementById("profXP");
    const streakEl = document.getElementById("profStreak");
    const quizEl = document.getElementById("profQuizzes");
    const bestEl = document.getElementById("profBest");

    if (nameEl) nameEl.textContent = stats.playerName;
    if (lvlEl) lvlEl.textContent = `Level ${stats.currentLevel.level} — ${stats.currentLevel.title}`;
    if (xpEl) xpEl.textContent = `${stats.currentXP} XP`;
    if (streakEl) streakEl.textContent = `🔥 ${stats.streak.currentStreak} Day`;
    if (quizEl) quizEl.textContent = stats.quizzesCompleted;
    if (bestEl) bestEl.textContent = stats.bestScore;
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

function resetAllData() {
    if (confirm("Are you sure you want to reset all stored XP, levels, badges, history, and mistakes?")) {
        StorageEngine.clearAllData();
        showToast("All application data has been reset.", "warning");
        location.reload();
    }
}
