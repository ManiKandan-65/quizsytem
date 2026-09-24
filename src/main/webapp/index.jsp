<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online Quiz System - Home</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <!-- Header Navigation -->
    <nav class="navbar">
        <div class="navbar-container">
            <a href="index.jsp" class="navbar-brand">
                📝 Online <span>Quiz System</span>
            </a>
            <span class="navbar-tag">Java Servlet / JSP Project</span>
        </div>
    </nav>

    <!-- Main Content Container -->
    <main class="main-container">
        <div class="card hero-card">
            <!-- Icon -->
            <div class="hero-icon">
                🎯
            </div>

            <!-- Title & Subtitle -->
            <h1 class="hero-title">Welcome to Online Quiz System</h1>
            <p class="hero-subtitle">
                Test your knowledge of Core Java, Servlets, JSP, HTML, and Web Development concepts.
            </p>

            <!-- Instructions Box -->
            <div class="rules-box">
                <h3>📋 Quiz Guidelines:</h3>
                <ul>
                    <li>✨ Total Questions: <strong>10 Multiple Choice Questions</strong></li>
                    <li>🔘 Each question has 4 options with only 1 correct answer</li>
                    <li>⏱️ No time limit — read carefully and answer at your own pace</li>
                    <li>📊 Score, percentage, and detailed feedback will be shown upon submission</li>
                </ul>
            </div>

            <!-- Start Quiz Button -->
            <a href="quiz" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2.5rem;">
                🚀 Start Quiz Now
            </a>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <p>&copy; Online Quiz System - Built with Java Servlets, JSP & Apache Tomcat</p>
    </footer>

</body>
</html>
