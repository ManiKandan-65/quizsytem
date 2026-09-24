<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.quiz.model.QuizResult" %>
<%
    QuizResult result = (QuizResult) request.getAttribute("quizResult");
    if (result == null) {
        response.sendRedirect("index.jsp");
        return;
    }
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online Quiz System - Quiz Result</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <!-- Header Navigation -->
    <nav class="navbar">
        <div class="navbar-container">
            <a href="index.jsp" class="navbar-brand">
                📝 Online <span>Quiz System</span>
            </a>
            <span class="navbar-tag">Quiz Score Summary</span>
        </div>
    </nav>

    <!-- Main Content Container -->
    <main class="main-container">
        <div class="card result-card">
            
            <span class="result-badge">🎉 Quiz Completed</span>
            <h1 style="font-size: 2rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 1rem;">
                Your Performance Report
            </h1>

            <!-- Score Feedback Message Banner -->
            <div class="feedback-banner">
                <%= result.getFeedbackMessage() %>
            </div>

            <!-- Percentage Progress Bar -->
            <div style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; font-weight: 600; color: var(--text-secondary);">
                <span>Score Percentage</span>
                <span><%= String.format("%.1f", result.getPercentage()) %>%</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: <%= result.getPercentage() %>%;"></div>
            </div>

            <!-- Metrics Grid -->
            <div class="metrics-grid">
                <!-- Total Questions -->
                <div class="metric-box">
                    <div class="metric-value"><%= result.getTotalQuestions() %></div>
                    <div class="metric-label">Total Questions</div>
                </div>

                <!-- Correct Answers -->
                <div class="metric-box">
                    <div class="metric-value success"><%= result.getCorrectAnswers() %></div>
                    <div class="metric-label">Correct Answers</div>
                </div>

                <!-- Wrong Answers -->
                <div class="metric-box">
                    <div class="metric-value danger"><%= result.getWrongAnswers() %></div>
                    <div class="metric-label">Wrong Answers</div>
                </div>

                <!-- Final Score -->
                <div class="metric-box">
                    <div class="metric-value"><%= result.getScore() %> / <%= result.getTotalQuestions() %></div>
                    <div class="metric-label">Final Score</div>
                </div>
            </div>

            <!-- Actions Container -->
            <div class="actions-container">
                <a href="quiz" class="btn btn-primary" style="padding: 0.9rem 2.5rem; font-size: 1.05rem;">
                    🔄 Try Again
                </a>
            </div>

        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <p>&copy; Online Quiz System - Built with Java Servlets, JSP & Apache Tomcat</p>
    </footer>

</body>
</html>
