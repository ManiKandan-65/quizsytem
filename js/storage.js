/* ==========================================================================
   QuizSystem - LocalStorage & State Management Engine
   Manages:
   - Theme preferences (Dark Mode by default)
   - Quiz attempt history & detailed question records
   - User Dashboard analytics
   - Weak topics tracking for targeted practice sessions
   - Local Leaderboard
   ========================================================================== */

const STORAGE_KEYS = {
    THEME: 'quizsystem_theme',
    HISTORY: 'quizsystem_history',
    LEADERBOARD: 'quizsystem_leaderboard',
    PLAYER_NAME: 'quizsystem_player_name',
    WEAK_TOPICS: 'quizsystem_weak_topics'
};

// Initial Sample Leaderboard Data for cold start
const SAMPLE_LEADERBOARD = [
    { name: "Alex Chen", category: "Java", difficulty: "Hard", score: 5, total: 5, percentage: 100.0, date: "2026-09-20" },
    { name: "Priya Sharma", category: "JavaScript", difficulty: "Medium", score: 4, total: 5, percentage: 80.0, date: "2026-09-21" },
    { name: "David Miller", category: "HTML & CSS", difficulty: "Medium", score: 4, total: 5, percentage: 80.0, date: "2026-09-22" },
    { name: "Sara Khan", category: "DBMS", difficulty: "Easy", score: 3, total: 5, percentage: 60.0, date: "2026-09-23" },
    { name: "Rahul Verma", category: "OOP", difficulty: "Medium", score: 3, total: 5, percentage: 60.0, date: "2026-09-24" }
];

const StorageEngine = {
    /**
     * Theme Preference (Dark mode is default as per prompt)
     */
    getTheme() {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    },

    setTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEYS.THEME, theme);
        } catch (e) {
            console.warn("LocalStorage access error:", e);
        }
        document.documentElement.setAttribute('data-theme', theme);
    },

    initTheme() {
        const savedTheme = this.getTheme();
        document.documentElement.setAttribute('data-theme', savedTheme);
        return savedTheme;
    },

    /**
     * Player Name Memory
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
     * Quiz History Storage
     */
    getHistory() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error reading quiz history from localStorage", e);
            return [];
        }
    },

    saveQuizAttempt(attemptData) {
        const history = this.getHistory();
        history.unshift(attemptData); // latest first
        
        try {
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
        } catch (e) {
            console.warn("History storage limit reached", e);
        }

        this.setPlayerName(attemptData.playerName);
        this.updateLeaderboard(attemptData);
        this.trackWeakTopics(attemptData);
    },

    getAttemptById(attemptId) {
        const history = this.getHistory();
        return history.find(item => item.id == attemptId) || null;
    },

    clearHistory() {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
        localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
        localStorage.removeItem(STORAGE_KEYS.WEAK_TOPICS);
    },

    /**
     * Track Weak Topics & Incorrect Questions
     */
    trackWeakTopics(attemptData) {
        if (!attemptData.questions || !attemptData.userAnswers) return;

        let weakTopics = this.getWeakTopics();

        attemptData.questions.forEach(q => {
            const userChoice = attemptData.userAnswers[q.id];
            if (userChoice === undefined || userChoice !== q.correct) {
                // Topic/Question was incorrect or unanswered
                if (!weakTopics.some(item => item.id === q.id)) {
                    weakTopics.push({
                        id: q.id,
                        category: q.category,
                        question: q.question,
                        difficulty: q.difficulty,
                        date: new Date().toLocaleDateString()
                    });
                }
            } else {
                // If answered correctly in latest attempt, remove from weak list
                weakTopics = weakTopics.filter(item => item.id !== q.id);
            }
        });

        try {
            localStorage.setItem(STORAGE_KEYS.WEAK_TOPICS, JSON.stringify(weakTopics));
        } catch (e) {
            console.warn("Error saving weak topics", e);
        }
    },

    getWeakTopics() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.WEAK_TOPICS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Local Leaderboard Management
     */
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

        const entry = {
            name: attemptData.playerName,
            category: attemptData.category,
            difficulty: attemptData.difficulty,
            score: attemptData.score,
            total: attemptData.totalQuestions,
            percentage: parseFloat(attemptData.percentage),
            date: attemptData.date
        };

        leaderboard.push(entry);
        leaderboard.sort((a, b) => b.percentage - a.percentage || b.score - a.score);
        leaderboard = leaderboard.slice(0, 15);

        try {
            localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
        } catch (e) {
            console.warn("Leaderboard save error", e);
        }
    },

    /**
     * Dashboard Analytics Aggregator
     */
    getUserDashboardStats() {
        const history = this.getHistory();
        const playerName = this.getPlayerName();

        if (history.length === 0) {
            return {
                playerName,
                quizzesCompleted: 0,
                bestScore: 0,
                avgPercentage: "0.0",
                totalAttempted: 0,
                totalCorrect: 0,
                accuracy: "0.0",
                strongCategories: [],
                weakCategories: []
            };
        }

        const quizzesCompleted = history.length;
        let bestScore = 0;
        let percentageSum = 0;
        let totalAttempted = 0;
        let totalCorrect = 0;

        const categoryStats = {};

        history.forEach(h => {
            if (h.score > bestScore) bestScore = h.score;
            percentageSum += parseFloat(h.percentage);
            totalAttempted += h.totalQuestions;
            totalCorrect += h.correctAnswers;

            // Track per-category stats
            if (!categoryStats[h.category]) {
                categoryStats[h.category] = { correct: 0, total: 0 };
            }
            categoryStats[h.category].correct += h.correctAnswers;
            categoryStats[h.category].total += h.totalQuestions;
        });

        const avgPercentage = (percentageSum / quizzesCompleted).toFixed(1);
        const accuracy = totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : "0.0";

        // Identify Strong vs Weak Categories
        const strongCategories = [];
        const weakCategories = [];

        Object.keys(categoryStats).forEach(cat => {
            const catAcc = (categoryStats[cat].correct / categoryStats[cat].total) * 100;
            if (catAcc >= 70) strongCategories.push(cat);
            else weakCategories.push(cat);
        });

        return {
            playerName,
            quizzesCompleted,
            bestScore,
            avgPercentage,
            totalAttempted,
            totalCorrect,
            accuracy,
            strongCategories: strongCategories.length > 0 ? strongCategories : ["Java Basics"],
            weakCategories: weakCategories.length > 0 ? weakCategories : ["Exception Handling"]
        };
    }
};
