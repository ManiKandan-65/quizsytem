package com.quiz.servlet;

import com.quiz.model.Question;
import com.quiz.model.QuizResult;
import com.quiz.repository.QuestionRepository;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * QuizServlet Class
 * Controller Servlet that handles:
 * 1. GET requests (/quiz): Fetches 10 questions and forwards to quiz.jsp
 * 2. POST requests (/submitQuiz): Receives user answers, calculates score, and forwards to result.jsp
 */
public class QuizServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    /**
     * Handles HTTP GET request.
     * Invoked when user clicks "Start Quiz" or accesses /quiz URL.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Step 1: Retrieve questions list from Java QuestionRepository
        List<Question> questions = QuestionRepository.getAllQuestions();
        
        // Step 2: Attach questions list to request object
        request.setAttribute("questions", questions);
        
        // Step 3: Forward request to quiz.jsp page
        request.getRequestDispatcher("quiz.jsp").forward(request, response);
    }

    /**
     * Handles HTTP POST request.
     * Invoked when user clicks "Submit Quiz" on the quiz form.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Step 1: Load original question list to compare answers
        List<Question> questions = QuestionRepository.getAllQuestions();
        
        int totalQuestions = questions.size();
        int correctAnswers = 0;
        int wrongAnswers = 0;

        // Step 2: Loop through all questions and check user selected radio option
        for (Question question : questions) {
            String paramName = "question_" + question.getId();
            String userChoiceStr = request.getParameter(paramName);

            if (userChoiceStr != null && !userChoiceStr.trim().isEmpty()) {
                try {
                    int userChoice = Integer.parseInt(userChoiceStr);
                    // Compare user selected option (1-4) with correct option (1-4)
                    if (userChoice == question.getCorrectOption()) {
                        correctAnswers++; // Increment correct count
                    } else {
                        wrongAnswers++; // Increment wrong count
                    }
                } catch (NumberFormatException e) {
                    wrongAnswers++;
                }
            } else {
                // If question was skipped without selection
                wrongAnswers++;
            }
        }

        // Step 3: Calculate score & percentage
        int score = correctAnswers; // 1 point per correct answer
        double percentage = ((double) correctAnswers / totalQuestions) * 100.0;

        // Step 4: Determine simple message based on score
        String feedbackMessage;
        if (percentage >= 80.0) {
            feedbackMessage = "🌟 Outstanding Performance! You scored exceptionally well!";
        } else if (percentage >= 50.0) {
            feedbackMessage = "👍 Good Job! You passed the quiz successfully.";
        } else {
            feedbackMessage = "📚 Keep Practicing! Review the concepts and try again.";
        }

        // Step 5: Wrap result parameters into QuizResult object
        QuizResult quizResult = new QuizResult(
            totalQuestions,
            correctAnswers,
            wrongAnswers,
            score,
            percentage,
            feedbackMessage
        );

        // Step 6: Set result object as request attribute
        request.setAttribute("quizResult", quizResult);

        // Step 7: Forward request to result.jsp
        request.getRequestDispatcher("result.jsp").forward(request, response);
    }
}
