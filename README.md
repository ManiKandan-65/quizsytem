# QuizSystem - Online Quiz Platform 📝

A modern, responsive, and professional **Online Quiz System** web application built purely using **HTML5, CSS3, and JavaScript (Vanilla JS)**, ready for instant static deployment on **Vercel** ([https://quizsytem.vercel.app/](https://quizsytem.vercel.app/)).

---

## 📌 Project Overview

**QuizSystem** is an interactive online quiz platform designed to help users test their technical knowledge in Programming, Java, HTML, CSS, and Computer Science. The application evaluates answers dynamically on the client side, calculates score and percentage metrics, and displays a detailed performance report.

### Key Highlights:
- ⚡ **Pure Client-Side Architecture**: Built with standard **HTML, CSS, and JavaScript**.
- 🚀 **100% Vercel Compatible**: Zero backend dependencies, instant static hosting.
- 🎨 **Modern Responsive UI**: White & dark-blue theme with glassmorphism card design.
- 📱 **Mobile Friendly**: Fully responsive layout for Desktop, Tablet, and Mobile devices.
- 🗣️ **Interview Ready**: Easy to explain for technical interviews.

---

## 🛠️ Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic structure for Navbar, Hero, Features, About, Quiz, Results, and Footer |
| **CSS3** | Custom styling, animations, card layouts, dark-blue theme & `@media` queries |
| **JavaScript (ES6)** | Dynamic question rendering, answer checking, score/percentage calculation & DOM manipulation |

---

## 🌟 Website Sections & Features

1. **Navbar Navigation**:
   - Logo: `QuizSystem`
   - Links: Home, Features, About, Contact
   - "Start Quiz" CTA button
   - Mobile responsive toggle menu.

2. **Hero Section**:
   - Heading: *"Test Your Knowledge"*
   - Subheading: *"Challenge yourself with interactive quizzes and discover how much you know."*
   - Buttons: *"Start Quiz"* and *"Learn More"*
   - Interactive CSS Quiz Preview illustration card.

3. **Features Section**:
   - 📝 **Multiple Choice Questions**: 10 beginner-friendly questions.
   - ⚡ **Instant Results**: Real-time score calculation.
   - 📊 **Track Your Score**: Correct vs. Wrong counts & percentage progress bar.
   - 💡 **Learn & Improve**: One-click Retry Quiz functionality.

4. **About Section**:
   - Highlights the core mission of QuizSystem as an interactive self-assessment tool.

5. **Quiz Interface**:
   - Displays 10 multiple-choice questions dynamically.
   - Progress bar tracker (e.g. `0 of 10 Answered`).
   - Selectable radio options with styled label cards.

6. **Result Section**:
   - Displays Total Questions, Correct Answers, Wrong Answers, Final Score, and Percentage.
   - Dynamic encouraging message based on score ("Outstanding Job!", "Good Job!", "Keep Practicing!").
   - "Retry Quiz" & "Back to Home" buttons.

7. **Contact & Footer**:
   - Get in touch form & quick navigation links.

---

## 📂 Project Folder Structure

```text
online-quiz-system/
├── index.html                   # Main HTML5 Document (Root)
├── vercel.json                  # Vercel Routing Configuration
├── README.md                    # Project Documentation
├── css/
│   └── style.css                # Responsive Custom CSS Stylesheet
└── js/
    └── app.js                   # Client-side Quiz Logic & DOM Handling
```

---

## 🗣️ Technical Interview Explanation Guide

You can easily explain this project in 3 simple sentences:

> *"Online Quiz System is a responsive web application developed using HTML, CSS, and JavaScript. HTML is used to structure the website layout, CSS is used for styling and mobile responsiveness, and JavaScript is used to handle quiz questions, user answer validation, score calculation, and result rendering."*

---

## 🚀 How to Deploy on Vercel

1. Commit and push all project files to GitHub:
   ```bash
   git add .
   git commit -m "Convert to client-side HTML/CSS/JS for Vercel deployment"
   git push origin main
   ```
2. Open your [Vercel Dashboard](https://vercel.com/dashboard).
3. If your repository `ManiKandan-65/quizsytem` is already connected, Vercel will automatically deploy the site.
4. Your live URL will be active at:
   ```text
   https://quizsytem.vercel.app/
   ```
