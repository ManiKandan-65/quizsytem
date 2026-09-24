package com.quiz.repository;

import com.quiz.model.Question;
import java.util.ArrayList;
import java.util.List;

/**
 * QuestionRepository Class
 * Serves as an in-memory data store for the 10 quiz questions.
 * No external database (MySQL, etc.) is required.
 */
public class QuestionRepository {

    /**
     * Returns a list of 10 fixed multiple-choice questions with 4 options each.
     */
    public static List<Question> getAllQuestions() {
        List<Question> questions = new ArrayList<>();

        questions.add(new Question(
            1,
            "Which of the following programming languages is known for its write-once, run-anywhere (WORA) philosophy?",
            "Java",
            "C",
            "Assembly",
            "Pascal",
            1
        ));

        questions.add(new Question(
            2,
            "Which keyword is used to declare a class in Java?",
            "struct",
            "class",
            "interface",
            "define",
            2
        ));

        questions.add(new Question(
            3,
            "What is the standard entry point method signature for a Java standalone application?",
            "public void start()",
            "public static void main(String[] args)",
            "public void run()",
            "public static void init()",
            2
        ));

        questions.add(new Question(
            4,
            "Which HTML tag is used to create a hyperlink?",
            "<link>",
            "<a>",
            "<href>",
            "<url>",
            2
        ));

        questions.add(new Question(
            5,
            "Which HTTP method is commonly used to submit form data to a Java Servlet for processing?",
            "GET",
            "POST",
            "FETCH",
            "SEND",
            2
        ));

        questions.add(new Question(
            6,
            "In JSP, which implicit object represents the HttpServletRequest?",
            "request",
            "response",
            "session",
            "application",
            1
        ));

        questions.add(new Question(
            7,
            "What does CSS stand for?",
            "Computer Style Sheets",
            "Cascading Style Sheets",
            "Creative Style System",
            "Colorful Style Structure",
            2
        ));

        questions.add(new Question(
            8,
            "Which Java Collection class stores unique elements and does not allow duplicate entries?",
            "ArrayList",
            "Vector",
            "HashSet",
            "LinkedList",
            3
        ));

        questions.add(new Question(
            9,
            "In a Java Servlet, which method is executed to handle HTTP GET requests?",
            "doPost()",
            "doGet()",
            "service()",
            "init()",
            2
        ));

        questions.add(new Question(
            10,
            "Which XML deployment descriptor file is traditionally used to map Java Servlets in web applications?",
            "pom.xml",
            "web.xml",
            "server.xml",
            "context.xml",
            2
        ));

        return questions;
    }
}
