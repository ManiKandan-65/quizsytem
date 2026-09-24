/* ==========================================================================
   QuizSystem - EdTech LocalStorage Engine & Gamification System
   Manages:
   - Default Dark Theme
   - XP, Levels, & Level Progression
   - Achievements & Badge Unlocks
   - Daily Challenges & Daily Streaks
   - Question Bookmarks & Personal Notes
   - Topic Mastery Analytics
   - Weak Topics & Targeted Recommendations
   ========================================================================== */

const STORAGE_KEYS = {
    THEME: 'quizsystem_theme',
    PLAYER_NAME: 'quizsystem_player_name',
    SETTINGS: 'quizsystem_settings',
    XP: 'quizsystem_xp',
    LEVEL: 'quizsystem_level',
    ACHIEVEMENTS: 'quizsystem_achievements',
    DAILY_CHALLENGE: 'quizsystem_daily_challenge',
    STREAK: 'quizsystem_streak',
    HISTORY: 'quizsystem_history',
    LEADERBOARD: 'quizsystem_leaderboard',
    BOOKMARKS: 'quizsystem_bookmarks',
    NOTES: 'quizsystem_notes',
    WEAK_TOPICS: 'quizsystem_weak_topics'
};

// Level XP Thresholds & Badges
const LEVEL_CONFIG = [
    { level: 1, title: "Beginner", minXP: 0, maxXP: 100 },
    { level: 2, title: "Learner", minXP: 100, maxXP: 300 },
    { level: 3, title: "Explorer", minXP: 300, maxXP: 600 },
    { level: 4, title: "Skilled", minXP: 600, maxXP: 1000 },
    { level: 5, title: "Expert", minXP: 1000, maxXP: 99999 }
];

const BADGES_CONFIG = [
    { id: "first_quiz", title: "First Quiz", desc: "Complete your first quiz test", icon: "🚀" },
    { id: "quiz_starter", title: "Quiz Starter", desc: "Complete 3 total quizzes", icon: "🎯" },
    { id: "correct_10", title: "10 Correct Answers", desc: "Answer 10 total questions correctly", icon: "✅" },
    { id: "correct_25", title: "25 Correct Answers", desc: "Answer 25 total questions correctly", icon: "🔥" },
    { id: "perfect_score", title: "Perfect Score", desc: "Score 100% on any quiz test", icon: "🏆" },
    { id: "quizzes_5", title: "5 Quizzes Completed", desc: "Complete 5 quiz attempts", icon: "⭐" },
    { id: "streak_7", title: "7 Day Streak", desc: "Maintain a 7-day learning streak", icon: "⚡" },
    { id: "oop_specialist", title: "OOP Specialist", desc: "Score 80%+ on an OOP quiz", icon: "🧩" },
    { id: "sql_specialist", title: "SQL Specialist", desc: "Score 80%+ on a SQL or DBMS quiz", icon: "🗄️" },
    { id: "speed_solver", title: "Speed Solver", desc: "Finish a quiz in under 2 minutes", icon: "⏱️" }
];

const SAMPLE_LEADERBOARD = [
    { name: "Alex Chen", xp: 1250, level: 5, score: 10, total: 10, percentage: 100.0, quizzesCompleted: 12, date: "2026-09-20" },
    { name: "Priya Sharma", xp: 850, level: 4, score: 9, total: 10, percentage: 90.0, quizzesCompleted: 8, date: "2026-09-21" },
    { name: "David Miller", xp: 520, level: 3, score: 8, total: 10, percentage: 80.0, quizzesCompleted: 5, date: "2026-09-22" },
    { name: "Sara Khan", xp: 340, level: 3, score: 8, total: 10, percentage: 80.0, quizzesCompleted: 4, date: "2026-09-23" },
    { name: "Rahul Verma", xp: 180, level: 2, score: 7, total: 10, percentage: 70.0, quizzesCompleted: 2, date: "2026-09-24" }
];

const StorageEngine = {
    /**
     * Theme Engine (Dark mode is DEFAULT)
     */
    getTheme() {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    },

    setTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEYS.THEME, theme);
        } catch (e) {}
        document.documentElement.setAttribute('data-theme', theme);
    },

    initTheme() {
        const saved = this.getTheme();
        document.documentElement.setAttribute('data-theme', saved);
        return saved;
    },

    /**
     * Application Settings (Audio & Animations)
     */
    getSettings() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return data ? JSON.parse(data) : { sound: true, animations: true };
        } catch (e) {
            return { sound: true, animations: true };
        }
    },

    setSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    /**
     * Player Name
     */
    getPlayerName() {
        return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || 'Developer';
    },

    setPlayerName(name) {
        if (name && name.trim()) {
            localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name.trim());
        }
    },

    /**
     * Gamified XP & Level System
     */
    getXP() {
        return parseInt(localStorage.getItem(STORAGE_KEYS.XP) || "0", 10);
    },

    addXP(amount) {
        const currentXP = this.getXP();
        const newXP = currentXP + amount;
        localStorage.setItem(STORAGE_KEYS.XP, newXP.toString());
        
        const oldLevel = this.getLevel(currentXP);
        const newLevel = this.getLevel(newXP);

        if (newLevel.level > oldLevel.level) {
            if (typeof showToast === 'function') {
                showToast(`🎉 Level Up! You reached Level ${newLevel.level}: ${newLevel.title}!`, "success");
            }
        }

        return { newXP, levelUp: newLevel.level > oldLevel.level, newLevel };
    },

    getLevel(xpVal) {
        const xp = xpVal !== undefined ? xpVal : this.getXP();
        let currentLvl = LEVEL_CONFIG[0];

        for (let i = 0; i < LEVEL_CONFIG.length; i++) {
            if (xp >= LEVEL_CONFIG[i].minXP) {
                currentLvl = LEVEL_CONFIG[i];
            }
        }
        return currentLvl;
    },

    /**
     * Streak Tracker
     */
    getStreak() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.STREAK);
            return data ? JSON.parse(data) : { currentStreak: 1, maxStreak: 1, lastActiveDate: new Date().toLocaleDateString() };
        } catch (e) {
            return { currentStreak: 1, maxStreak: 1, lastActiveDate: new Date().toLocaleDateString() };
        }
    },

    updateStreak() {
        const streakData = this.getStreak();
        const todayStr = new Date().toLocaleDateString();
        
        if (streakData.lastActiveDate === todayStr) {
            return streakData;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString();

        if (streakData.lastActiveDate === yesterdayStr) {
            streakData.currentStreak += 1;
        } else {
            streakData.currentStreak = 1;
        }

        if (streakData.currentStreak > streakData.maxStreak) {
            streakData.maxStreak = streakData.currentStreak;
        }

        streakData.lastActiveDate = todayStr;
        localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streakData));
        
        this.checkAchievements();
        return streakData;
    },

    /**
     * Achievements & Badges
     */
    getUnlockedAchievements() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    unlockBadge(badgeId) {
        const unlocked = this.getUnlockedAchievements();
        if (!unlocked.includes(badgeId)) {
            unlocked.push(badgeId);
            localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(unlocked));

            const badgeObj = BADGES_CONFIG.find(b => b.id === badgeId);
            if (badgeObj && typeof showToast === 'function') {
                showToast(`🏆 Achievement Unlocked: ${badgeObj.title}! (${badgeObj.desc})`, "warning");
            }
        }
    },

    checkAchievements() {
        const history = this.getHistory();
        const unlocked = this.getUnlockedAchievements();
        const streak = this.getStreak();

        const totalQuizzes = history.length;
        let totalCorrect = 0;
        let hasPerfectScore = false;
        let hasOOPSpecialist = false;
        let hasSQLSpecialist = false;
        let hasSpeedSolver = false;

        history.forEach(h => {
            totalCorrect += h.correctAnswers;
            if (h.percentage >= 100) hasPerfectScore = true;
            if (h.category === "OOP" && h.percentage >= 80) hasOOPSpecialist = true;
            if ((h.category === "SQL" || h.category === "DBMS") && h.percentage >= 80) hasSQLSpecialist = true;
            if (h.timeTakenSeconds && h.timeTakenSeconds <= 120) hasSpeedSolver = true;
        });

        if (totalQuizzes >= 1) this.unlockBadge("first_quiz");
        if (totalQuizzes >= 3) this.unlockBadge("quiz_starter");
        if (totalQuizzes >= 5) this.unlockBadge("quizzes_5");

        if (totalCorrect >= 10) this.unlockBadge("correct_10");
        if (totalCorrect >= 25) this.unlockBadge("correct_25");

        if (hasPerfectScore) this.unlockBadge("perfect_score");
        if (hasOOPSpecialist) this.unlockBadge("oop_specialist");
        if (hasSQLSpecialist) this.unlockBadge("sql_specialist");
        if (hasSpeedSolver) this.unlockBadge("speed_solver");

        if (streak.currentStreak >= 7) this.unlockBadge("streak_7");
    },

    /**
     * Daily Challenge Tracker
     */
    getDailyChallengeData() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGE);
            const todayStr = new Date().toLocaleDateString();
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.date === todayStr) return parsed;
            }
            return { date: todayStr, completed: false, score: 0, total: 5 };
        } catch (e) {
            return { date: new Date().toLocaleDateString(), completed: false, score: 0, total: 5 };
        }
    },

    saveDailyChallengeResult(score, total) {
        const data = {
            date: new Date().toLocaleDateString(),
            completed: true,
            score: score,
            total: total
        };
        localStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGE, JSON.stringify(data));
        this.addXP(50); // Daily challenge reward
        this.updateStreak();
    },

    /**
     * Question Bookmarks
     */
    getBookmarks() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    toggleBookmark(questionObj) {
        let bookmarks = this.getBookmarks();
        const existsIdx = bookmarks.findIndex(b => b.id === questionObj.id);

        let isBookmarked = false;
        if (existsIdx >= 0) {
            bookmarks.splice(existsIdx, 1);
            if (typeof showToast === 'function') showToast("Bookmark removed", "info");
        } else {
            bookmarks.push({
                id: questionObj.id,
                category: questionObj.category,
                difficulty: questionObj.difficulty,
                question: questionObj.question,
                options: questionObj.options,
                correct: questionObj.correct,
                explanation: questionObj.explanation,
                hint: questionObj.hint,
                date: new Date().toLocaleDateString()
            });
            isBookmarked = true;
            if (typeof showToast === 'function') showToast("Question bookmarked!", "success");
        }

        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
        return isBookmarked;
    },

    isBookmarked(questionId) {
        const bookmarks = this.getBookmarks();
        return bookmarks.some(b => b.id === questionId);
    },

    /**
     * Personal User Notes on Questions
     */
    getNotes() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.NOTES);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    },

    saveNote(questionId, noteText) {
        const notes = this.getNotes();
        if (noteText && noteText.trim()) {
            notes[questionId] = noteText.trim();
        } else {
            delete notes[questionId];
        }
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    },

    getNoteForQuestion(questionId) {
        const notes = this.getNotes();
        return notes[questionId] || "";
    },

    /**
     * Quiz History & Local Leaderboard
     */
    getHistory() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveQuizAttempt(attemptData) {
        const history = this.getHistory();
        history.unshift(attemptData);
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

        // Award XP
        let xpGained = attemptData.score * 10 + 25; // 10 per correct + 25 completion
        if (attemptData.percentage >= 100) xpGained += 100; // Perfect score bonus
        this.addXP(xpGained);

        this.setPlayerName(attemptData.playerName);
        this.updateLeaderboard(attemptData);
        this.updateStreak();
        this.checkAchievements();
    },

    getLeaderboard() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed && parsed.length > 0) return parsed;
            }
            return [...SAMPLE_LEADERBOARD];
        } catch (e) {
            return [...SAMPLE_LEADERBOARD];
        }
    },

    updateLeaderboard(attemptData) {
        let leaderboard = this.getLeaderboard();
        const currentXP = this.getXP();
        const currentLvl = this.getLevel(currentXP);

        const entry = {
            name: attemptData.playerName,
            xp: currentXP,
            level: currentLvl.level,
            category: attemptData.category,
            difficulty: attemptData.difficulty,
            score: attemptData.score,
            total: attemptData.totalQuestions,
            percentage: parseFloat(attemptData.percentage),
            date: attemptData.date
        };

        leaderboard.push(entry);
        leaderboard.sort((a, b) => b.xp - a.xp || b.percentage - a.percentage);
        leaderboard = leaderboard.slice(0, 20);

        localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    },

    clearAllData() {
        localStorage.clear();
        this.initTheme();
    },

    /**
     * Topic Mastery Progress Calculation
     */
    getTopicMastery() {
        const history = this.getHistory();
        const categories = ["Java", "OOP", "DBMS", "SQL", "HTML/CSS", "JavaScript", "OS", "Computer Networks"];
        const mastery = {};

        categories.forEach(cat => {
            mastery[cat] = { correct: 0, total: 0, percentage: 0 };
        });

        history.forEach(h => {
            let catKey = h.category;
            if (catKey === "HTML & CSS") catKey = "HTML/CSS";
            if (catKey === "CS") catKey = "Computer Networks";

            if (mastery[catKey]) {
                mastery[catKey].correct += h.correctAnswers;
                mastery[catKey].total += h.totalQuestions;
            }
        });

        categories.forEach(cat => {
            if (mastery[cat].total > 0) {
                mastery[cat].percentage = Math.round((mastery[cat].correct / mastery[cat].total) * 100);
            } else {
                mastery[cat].percentage = 0; // Default cold start
            }
        });

        return mastery;
    },

    /**
     * User Profile Dashboard Metrics
     */
    getUserDashboardStats() {
        const history = this.getHistory();
        const playerName = this.getPlayerName();
        const currentXP = this.getXP();
        const currentLevel = this.getLevel(currentXP);
        const streak = this.getStreak();

        if (history.length === 0) {
            return {
                playerName,
                currentXP,
                currentLevel,
                streak,
                quizzesCompleted: 0,
                bestScore: 0,
                avgPercentage: "0.0",
                totalAttempted: 0,
                totalCorrect: 0,
                accuracy: "0.0"
            };
        }

        const quizzesCompleted = history.length;
        let bestScore = 0;
        let percentageSum = 0;
        let totalAttempted = 0;
        let totalCorrect = 0;

        history.forEach(h => {
            if (h.score > bestScore) bestScore = h.score;
            percentageSum += parseFloat(h.percentage);
            totalAttempted += h.totalQuestions;
            totalCorrect += h.correctAnswers;
        });

        const avgPercentage = (percentageSum / quizzesCompleted).toFixed(1);
        const accuracy = totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : "0.0";

        return {
            playerName,
            currentXP,
            currentLevel,
            streak,
            quizzesCompleted,
            bestScore,
            avgPercentage,
            totalAttempted,
            totalCorrect,
            accuracy
        };
    }
};
