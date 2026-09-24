/* ==========================================================================
   QuizSystem - Client-Side JavaScript Logic
   Handles quiz rendering, answer validation, score calculation & results
   ========================================================================== */

// 10 Beginner-Friendly Multiple Choice Questions
const questions = [
    {
        id: 1,
        question: "Which programming language is primarily used for defining the structure of web pages?",
        options: ["HTML", "CSS", "JavaScript", "Python"],
        correct: 0 // A
    },
    {
        id: 2,
        question: "Which keyword is used to declare a block-scoped constant variable in JavaScript?",
        options: ["var", "let", "const", "static"],
        correct: 2 // C
    },
    {
        id: 3,
        question: "What does CSS stand for in web development?",
        options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"],
        correct: 1 // B
    },
    {
        id: 4,
        question: "Which Object-Oriented programming language is known for 'Write Once, Run Anywhere' (WORA)?",
        options: ["C", "Java", "Assembly", "Pascal"],
        correct: 1 // B
    },
    {
        id: 5,
        question: "Which HTML tag is used to include an external JavaScript file into an HTML document?",
        options: ["<script>", "<js>", "<javascript>", "<code>"],
        correct: 0 // A
    },
    {
        id: 6,
        question: "Which method is used in JavaScript to select a DOM element by its unique ID?",
        options: ["document.query()", "document.getElementById()", "document.getElement()", "document.findId()"],
        correct: 1 // B
    },
    {
        id: 7,
        question: "Which CSS property is used to change the text color of an element?",
        options: ["font-color", "text-style", "color", "background-color"],
        correct: 2 // C
    },
    {
        id: 8,
        question: "What is the standard file extension for a JavaScript source file?",
        options: [".java", ".js", ".script", ".html"],
        correct: 1 // B
    },
    {
        id: 9,
        question: "Which HTML element is used to create a clickable hyperlink?",
        options: ["<a>", "<link>", "<href>", "<url>"],
        correct: 0 // A
    },
    {
        id: 10,
        question: "Which JavaScript array method adds one or more elements to the end of an array?",
        options: ["pop()", "push()", "shift()", "append()"],
        correct: 1 // B
    }
];

// Initialize DOM elements
document.addEventListener("DOMContentLoaded", () => {
    renderQuiz();
    setupNavigation();
    setupQuizProgressTracker();
});

/**
 * Render all 10 questions dynamically into the quiz form
 */
function renderQuiz() {
    const container = document.getElementById("questionsContainer");
    if (!container) return;

    container.innerHTML = "";

    questions.forEach((q, index) => {
        const questionNumber = index + 1;
        const totalCount = questions.length;

        const card = document.createElement("div");
        card.className = "question-card";

        card.innerHTML = `
            <span class="question-number">Question ${questionNumber} of ${totalCount}</span>
            <h3 class="question-text">${q.question}</h3>
            <div class="options-grid">
                ${q.options.map((opt, optIdx) => `
                    <label class="option-label">
                        <input type="radio" name="question_${q.id}" value="${optIdx}" required>
                        <span class="option-text">${String.fromCharCode(65 + optIdx)}) ${opt}</span>
                    </label>
                `).join('')}
            </div>
        `;

        container.appendChild(card);
    });
}

/**
 * Tracks option radio selections to update quiz progress bar
 */
function setupQuizProgressTracker() {
    const form = document.getElementById("quizForm");
    const progressFill = document.getElementById("quizProgressFill");
    const progressBadge = document.getElementById("quizProgressBadge");

    if (!form || !progressFill) return;

    form.addEventListener("change", () => {
        let answeredCount = 0;
        questions.forEach(q => {
            const selected = form.querySelector(`input[name="question_${q.id}"]:checked`);
            if (selected) answeredCount++;
        });

        const percentage = (answeredCount / questions.length) * 100;
        progressFill.style.width = `${percentage}%`;
        
        if (progressBadge) {
            progressBadge.textContent = `${answeredCount} of ${questions.length} Answered`;
        }
    });
}

/**
 * Handles Form Submission, score calculation & results display
 */
function submitQuiz(event) {
    event.preventDefault();

    const form = document.getElementById("quizForm");
    let correctAnswers = 0;
    let wrongAnswers = 0;
    const totalQuestions = questions.length;

    questions.forEach(q => {
        const selectedInput = form.querySelector(`input[name="question_${q.id}"]:checked`);
        if (selectedInput) {
            const selectedVal = parseInt(selectedInput.value, 10);
            if (selectedVal === q.correct) {
                correctAnswers++;
            } else {
                wrongAnswers++;
            }
        } else {
            wrongAnswers++;
        }
    });

    const score = correctAnswers;
    const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(1);

    // Generate performance feedback message
    let feedbackMessage = "";
    if (percentage >= 80) {
        feedbackMessage = "🌟 Outstanding Job! Excellent knowledge of programming concepts!";
    } else if (percentage >= 50) {
        feedbackMessage = "👍 Good Job! You passed the quiz. Keep practicing to improve!";
    } else {
        feedbackMessage = "📚 Keep Practicing! Review the concepts and try again.";
    }

    // Populate Results UI
    document.getElementById("resTotal").textContent = totalQuestions;
    document.getElementById("resCorrect").textContent = correctAnswers;
    document.getElementById("resWrong").textContent = wrongAnswers;
    document.getElementById("resScore").textContent = `${score} / ${totalQuestions}`;
    document.getElementById("resPercentage").textContent = `${percentage}%`;
    document.getElementById("resFeedback").textContent = feedbackMessage;
    document.getElementById("resProgressBar").style.width = `${percentage}%`;

    // Show Result Card & Scroll smoothly
    const resultCard = document.getElementById("resultSection");
    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: "smooth" });
}

/**
 * Resets the quiz to try again
 */
function retryQuiz() {
    const form = document.getElementById("quizForm");
    if (form) form.reset();

    const progressFill = document.getElementById("quizProgressFill");
    if (progressFill) progressFill.style.width = "0%";

    const progressBadge = document.getElementById("quizProgressBadge");
    if (progressBadge) progressBadge.textContent = "0 of 10 Answered";

    const resultCard = document.getElementById("resultSection");
    if (resultCard) resultCard.style.display = "none";

    const quizSection = document.getElementById("quiz");
    if (quizSection) quizSection.scrollIntoView({ behavior: "smooth" });
}

/**
 * Mobile Navigation Toggle & Smooth Link Scrolling
 */
function setupNavigation() {
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });

        // Close menu when a link is clicked
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
            });
        });
    }
}
