/* ==========================================================================
   QuizSystem - LocalStorage Engine
   Manages Theme preferences, Quiz History, Local Leaderboard, & User Dashboard
   ========================================================================== */

const STORAGE_KEYS = {
    THEME: 'quizsystem_theme',
    HISTORY: 'quizsystem_history',
    LEADERBOARD: 'quizsystem_leaderboard',
    PLAYER_NAME: 'quizsystem_last_player'
};

// Initial Sample Leaderboard Data if no user data exists yet
const SAMPLE_LEADERBOARD = [
    { name: "Alex Chen", category: "Java", difficulty: "Hard", score: 10, total: 10, percentage: 100.0, date: "2026-09-20" },
    { name: "Priya Sharma", category: "JavaScript", difficulty: "Medium", score: 9, total: 10, percentage: 90.0, date: "2026-09-21" },
    { name: "David Miller", category: "HTML & CSS", difficulty: "Medium", score: 8, total: 10, percentage: 80.0, date: "2026-09-22" },
    { name: "Sara Khan", category: "DBMS", difficulty: "Easy", score: 8, total: 10, percentage: 80.0, date: "2026-09-23" },
    { name: "Rahul Verma", category: "OOP", difficulty: "Medium", score: 7, total: 10, percentage: 70.0, date: "2026-09-24" }
];

const StorageEngine = {
    /**
     * Theme Preference Management
     */
    getTheme() {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    },

    setTheme(theme) {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
        document.documentElement.setAttribute('data-theme', theme);
    },

    initTheme() {
        const savedTheme = this.getTheme();
        document.documentElement.setAttribute('data-theme', savedTheme);
        return savedTheme;
    },

    /**
     * Last Used Player Name
     */
    getLastPlayerName() {
        return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || '';
    },

    setLastPlayerName(name) {
        if (name) localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name);
    },

    /**
     * Save completed quiz attempt to History & update Leaderboard
     */
    saveQuizAttempt(attemptData) {
        // 1. Save to History
        const history = this.getHistory();
        history.unshift(attemptData); // Add latest attempt at beginning
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

        // 2. Save Last Used Player Name
        this.setLastPlayerName(attemptData.playerName);

        // 3. Update Local Leaderboard
        this.updateLeaderboard(attemptData);
    },

    /**
     * Get all History attempts
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

    /**
     * Clear all History & reset Leaderboard
     */
    clearHistory() {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
        localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
    },

    /**
     * Update Leaderboard with new entry and sort by Score/Percentage
     */
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

        // Sort descending by percentage, then by score
        leaderboard.sort((a, b) => b.percentage - a.percentage || b.score - a.score);

        // Keep top 20 entries
        leaderboard = leaderboard.slice(0, 20);

        localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    },

    /**
     * Get Leaderboard entries (returns sample fallback if empty)
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

    /**
     * Compute aggregated User Dashboard metrics from LocalStorage
     */
    getUserDashboardStats(playerName) {
        const history = this.getHistory();
        
        // Filter history by player name if provided, else compute overall user stats
        const userHistory = playerName ? history.filter(h => h.playerName.toLowerCase() === playerName.toLowerCase()) : history;

        if (userHistory.length === 0) {
            return {
                quizzesCompleted: 0,
                bestScore: 0,
                avgPercentage: 0.0,
                totalCorrect: 0,
                totalAttempted: 0
            };
        }

        const quizzesCompleted = userHistory.length;
        let totalScoreSum = 0;
        let bestScore = 0;
        let percentageSum = 0;
        let totalCorrect = 0;
        let totalAttempted = 0;

        userHistory.forEach(h => {
            totalScoreSum += h.score;
            if (h.score > bestScore) bestScore = h.score;
            percentageSum += parseFloat(h.percentage);
            totalCorrect += h.correctAnswers;
            totalAttempted += h.totalQuestions;
        });

        const avgPercentage = (percentageSum / quizzesCompleted).toFixed(1);

        return {
            quizzesCompleted,
            bestScore,
            avgPercentage,
            totalCorrect,
            totalAttempted
        };
    }
};
