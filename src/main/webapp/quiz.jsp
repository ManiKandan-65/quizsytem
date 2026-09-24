<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.List" %>
<%@ page import="com.quiz.model.Question" %>
<%
    // Ensure questions list is loaded. If null, forward to QuizServlet (doGet)
    List<Question> questions = (List<Question>) request.getAttribute("questions");
    if (questions == null) {
        response.sendRedirect("quiz");
        return;
    }
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online Quiz System - Take Quiz</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <!-- Header Navigation -->
    <nav class="navbar">
        <div class="navbar-container">
            <a href="index.jsp" class="navbar-brand">
                📝 Online <span>Quiz System</span>
            </a>
            <span class="navbar-tag">10 Questions</span>
        </div>
    </nav>

    <!-- Main Container -->
    <main class="main-container">

        <!-- Quiz Header -->
        <div class="quiz-header">
            <h2 class="quiz-title">Knowledge Assessment</h2>
            <span class="badge">Total: <%= questions.size() %> Questions</span>
        </div>

        <!-- Quiz Form -->
        <form action="submitQuiz" method="POST">

            <% 
                int totalCount = questions.size();
                for (int i = 0; i < totalCount; i++) { 
                    Question q = questions.get(i);
                    int qNum = i + 1;
            %>
                <!-- Single Question Card -->
                <div class="question-card">
                    <span class="question-meta">Question <%= qNum %> of <%= totalCount %></span>
                    <h3 class="question-text"><%= q.getQuestionText() %></h3>

                    <div class="options-grid">
                        <!-- Option A -->
                        <label class="option-label">
                            <input type="radio" name="question_<%= q.getId() %>" value="1" required>
                            <span class="option-text">A) <%= q.getOptionA() %></span>
                        </label>

                        <!-- Option B -->
                        <label class="option-label">
                            <input type="radio" name="question_<%= q.getId() %>" value="2">
                            <span class="option-text">B) <%= q.getOptionB() %></span>
                        </label>

                        <!-- Option C -->
                        <label class="option-label">
                            <input type="radio" name="question_<%= q.getId() %>" value="3">
                            <span class="option-text">C) <%= q.getOptionC() %></span>
                        </label>

                        <!-- Option D -->
                        <label class="option-label">
                            <input type="radio" name="question_<%= q.getId() %>" value="4">
                            <span class="option-text">D) <%= q.getOptionD() %></span>
                        </label>
                    </div>
                </div>
            <% } %>

            <!-- Submit Button -->
            <div class="actions-container">
                <button type="submit" class="btn btn-primary" style="font-size: 1.1rem; padding: 0.9rem 3rem;">
                    ✅ Submit Quiz
                </button>
            </div>
        </form>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <p>&copy; Online Quiz System - Built with Java Servlets & JSP</p>
    </footer>

</body>
</html>
