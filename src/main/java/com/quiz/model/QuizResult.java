package com.quiz.model;

/**
 * QuizResult Model Class
 * Stores calculated result data after quiz evaluation.
 */
public class QuizResult {
    private int totalQuestions;
    private int correctAnswers;
    private int wrongAnswers;
    private int score;
    private double percentage;
    private String feedbackMessage;

    // Parameterized Constructor
    public QuizResult(int totalQuestions, int correctAnswers, int wrongAnswers, int score, double percentage, String feedbackMessage) {
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
        this.wrongAnswers = wrongAnswers;
        this.score = score;
        this.percentage = percentage;
        this.feedbackMessage = feedbackMessage;
    }

    // Getters
    public int getTotalQuestions() {
        return totalQuestions;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }

    public int getWrongAnswers() {
        return wrongAnswers;
    }

    public int getScore() {
        return score;
    }

    public double getPercentage() {
        return percentage;
    }

    public String getFeedbackMessage() {
        return feedbackMessage;
    }
}
