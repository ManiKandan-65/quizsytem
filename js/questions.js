/* ==========================================================================
   QuizSystem - Question Dataset
   Categorized by: Java, HTML & CSS, JavaScript, DBMS, OOP, Computer Science
   Difficulties: Easy, Medium, Hard
   ========================================================================== */

const QUESTION_DATABASE = {
    java: [
        {
            id: "j1",
            category: "Java",
            difficulty: "Easy",
            question: "Which keyword is used to define a class in Java?",
            options: ["struct", "class", "interface", "define"],
            correct: 1
        },
        {
            id: "j2",
            category: "Java",
            difficulty: "Easy",
            question: "What is the size of an int data type in Java?",
            options: ["8 bits", "16 bits", "32 bits", "64 bits"],
            correct: 2
        },
        {
            id: "j3",
            category: "Java",
            difficulty: "Easy",
            question: "Which method is the main entry point for a Java standalone application?",
            options: ["public void start()", "public static void main(String[] args)", "public void run()", "public static void init()"],
            correct: 1
        },
        {
            id: "j4",
            category: "Java",
            difficulty: "Medium",
            question: "Which Java collection class guarantees unique elements with no duplicate entries?",
            options: ["ArrayList", "Vector", "HashSet", "LinkedList"],
            correct: 2
        },
        {
            id: "j5",
            category: "Java",
            difficulty: "Medium",
            question: "Which exception is thrown when an array is accessed with an invalid index?",
            options: ["NullPointerException", "ArrayIndexOutOfBoundsException", "IllegalArgumentException", "ClassNotFoundException"],
            correct: 1
        },
        {
            id: "j6",
            category: "Java",
            difficulty: "Medium",
            question: "Which keyword is used by a subclass to call a constructor of its superclass?",
            options: ["this", "super", "parent", "extends"],
            correct: 1
        },
        {
            id: "j7",
            category: "Java",
            difficulty: "Hard",
            question: "What happens if a thread calls wait() without holding the object's monitor lock?",
            options: ["InterruptedException", "IllegalMonitorStateException", "ThreadDeath", "Deadlock"],
            correct: 1
        },
        {
            id: "j8",
            category: "Java",
            difficulty: "Hard",
            question: "Which garbage collector in Java 17+ is designed for ultra-low latency with concurrent pause times?",
            options: ["Serial GC", "Parallel GC", "ZGC (Z Garbage Collector)", "CMS"],
            correct: 2
        },
        {
            id: "j9",
            category: "Java",
            difficulty: "Easy",
            question: "Which operator is used for object type casting in Java?",
            options: ["(type)", "instanceof", "as", "convert"],
            correct: 0
        },
        {
            id: "j10",
            category: "Java",
            difficulty: "Medium",
            question: "Which modifier prevents a method from being overridden in a Java subclass?",
            options: ["static", "final", "abstract", "private"],
            correct: 1
        }
    ],

    html_css: [
        {
            id: "hc1",
            category: "HTML & CSS",
            difficulty: "Easy",
            question: "Which HTML tag is used to define an inline hyperlink?",
            options: ["<link>", "<a>", "<href>", "<url>"],
            correct: 1
        },
        {
            id: "hc2",
            category: "HTML & CSS",
            difficulty: "Easy",
            question: "What does CSS stand for in web design?",
            options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"],
            correct: 1
        },
        {
            id: "hc3",
            category: "HTML & CSS",
            difficulty: "Easy",
            question: "Which CSS property is used to change the background color of an element?",
            options: ["color", "bg-color", "background-color", "fill"],
            correct: 2
        },
        {
            id: "hc4",
            category: "HTML & CSS",
            difficulty: "Medium",
            question: "In CSS Flexbox, which property aligns items along the cross axis?",
            options: ["justify-content", "align-items", "flex-direction", "align-content"],
            correct: 1
        },
        {
            id: "hc5",
            category: "HTML & CSS",
            difficulty: "Medium",
            question: "Which HTML5 semantic element should contain introductory content or navigation links?",
            options: ["<section>", "<header>", "<article>", "<aside>"],
            correct: 1
        },
        {
            id: "hc6",
            category: "HTML & CSS",
            difficulty: "Medium",
            question: "In the CSS Box Model, which space is immediately between the content and the border?",
            options: ["margin", "padding", "outline", "gap"],
            correct: 1
        },
        {
            id: "hc7",
            category: "HTML & CSS",
            difficulty: "Hard",
            question: "Which CSS Grid property specifies a grid container's row and column gap simultaneously?",
            options: ["grid-gap / gap", "grid-space", "margin", "padding-grid"],
            correct: 0
        },
        {
            id: "hc8",
            category: "HTML & CSS",
            difficulty: "Hard",
            question: "What is the specificity value of a single ID selector in CSS?",
            options: ["(0, 0, 0, 1)", "(0, 0, 1, 0)", "(0, 1, 0, 0)", "(1, 0, 0, 0)"],
            correct: 2
        },
        {
            id: "hc9",
            category: "HTML & CSS",
            difficulty: "Easy",
            question: "Which HTML attribute is used to define inline styles directly on an element?",
            options: ["class", "css", "style", "font"],
            correct: 2
        },
        {
            id: "hc10",
            category: "HTML & CSS",
            difficulty: "Medium",
            question: "Which CSS display property makes an element invisible while still occupying space in layout?",
            options: ["display: none", "visibility: hidden", "opacity: 0", "Both B and C"],
            correct: 3
        }
    ],

    javascript: [
        {
            id: "js1",
            category: "JavaScript",
            difficulty: "Easy",
            question: "Which keyword is used to declare a block-scoped constant variable in JavaScript?",
            options: ["var", "let", "const", "static"],
            correct: 2
        },
        {
            id: "js2",
            category: "JavaScript",
            difficulty: "Easy",
            question: "What is the result of typeof NaN in JavaScript?",
            options: ["undefined", "null", "number", "nan"],
            correct: 2
        },
        {
            id: "js3",
            category: "JavaScript",
            difficulty: "Easy",
            question: "Which array method adds one or more elements to the end of an array?",
            options: ["pop()", "push()", "shift()", "unshift()"],
            correct: 1
        },
        {
            id: "js4",
            category: "JavaScript",
            difficulty: "Medium",
            question: "Which method converts a JavaScript object or array into a JSON string?",
            options: ["JSON.parse()", "JSON.stringify()", "JSON.toObject()", "Object.toJSON()"],
            correct: 1
        },
        {
            id: "js5",
            category: "JavaScript",
            difficulty: "Medium",
            question: "What does the strict equality operator (===) compare in JavaScript?",
            options: ["Values only", "Types only", "Both Value and Type", "Memory reference only"],
            correct: 2
        },
        {
            id: "js6",
            category: "JavaScript",
            difficulty: "Medium",
            question: "What is a Closure in JavaScript?",
            options: ["A function bundled together with references to its surrounding lexical environment", "A method to close browser tabs", "A private class declaration", "An event listener loop"],
            correct: 0
        },
        {
            id: "js7",
            category: "JavaScript",
            difficulty: "Hard",
            question: "Which ES6 feature provides a clean syntax for handling asynchronous operations?",
            options: ["Callbacks", "Promises / async-await", "Generators only", "Web Workers"],
            correct: 1
        },
        {
            id: "js8",
            category: "JavaScript",
            difficulty: "Hard",
            question: "What does Event Delegation rely on in the JavaScript DOM?",
            options: ["Event Capturing", "Event Bubbling", "DOM Parsing", "Shadow DOM"],
            correct: 1
        },
        {
            id: "js9",
            category: "JavaScript",
            difficulty: "Easy",
            question: "Which method is used to remove the last element from an array?",
            options: ["shift()", "pop()", "slice()", "splice()"],
            correct: 1
        },
        {
            id: "js10",
            category: "JavaScript",
            difficulty: "Medium",
            question: "What is the value of 'this' inside a standard arrow function?",
            options: ["The global object always", "The object calling the function", "Inherited lexically from the enclosing execution context", "undefined"],
            correct: 2
        }
    ],

    dbms: [
        {
            id: "db1",
            category: "DBMS",
            difficulty: "Easy",
            question: "What does SQL stand for?",
            options: ["Structured Query Language", "Sequential Query List", "Simple Query Logic", "System Query Link"],
            correct: 0
        },
        {
            id: "db2",
            category: "DBMS",
            difficulty: "Easy",
            question: "Which SQL command is used to retrieve data from a database table?",
            options: ["GET", "FETCH", "SELECT", "EXTRACT"],
            correct: 2
        },
        {
            id: "db3",
            category: "DBMS",
            difficulty: "Medium",
            question: "Which key uniquely identifies each record in a relational database table?",
            options: ["Foreign Key", "Candidate Key", "Primary Key", "Composite Key"],
            correct: 2
        },
        {
            id: "db4",
            category: "DBMS",
            difficulty: "Medium",
            question: "What does ACID stand for in Database Transaction Management?",
            options: ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Control, Integration, Data", "Access, Concurrency, Index, Database", "Action, Constraint, Isolation, Domain"],
            correct: 0
        },
        {
            id: "db5",
            category: "DBMS",
            difficulty: "Medium",
            question: "Which JOIN type returns all records when there is a match in either left or right table?",
            options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
            correct: 3
        },
        {
            id: "db6",
            category: "DBMS",
            difficulty: "Hard",
            question: "Which Normal Form eliminates partial dependency on a composite key?",
            options: ["1NF", "2NF", "3NF", "BCNF"],
            correct: 1
        },
        {
            id: "db7",
            category: "DBMS",
            difficulty: "Hard",
            question: "Which SQL clause is used to filter records after an aggregate GROUP BY operation?",
            options: ["WHERE", "HAVING", "ORDER BY", "FILTER"],
            correct: 1
        },
        {
            id: "db8",
            category: "DBMS",
            difficulty: "Easy",
            question: "Which command is used to add new rows of data into a database table?",
            options: ["ADD", "INSERT INTO", "UPDATE", "CREATE"],
            correct: 1
        },
        {
            id: "db9",
            category: "DBMS",
            difficulty: "Medium",
            question: "Which command permanently saves transaction changes into the database?",
            options: ["ROLLBACK", "SAVEPOINT", "COMMIT", "GRANT"],
            correct: 2
        },
        {
            id: "db10",
            category: "DBMS",
            difficulty: "Hard",
            question: "What is a Foreign Key in a relational database?",
            options: ["A primary key of another table used to enforce referential integrity", "A secondary index", "A key generated from external files", "A key that accepts duplicate values only"],
            correct: 0
        }
    ],

    oop: [
        {
            id: "o1",
            category: "OOP",
            difficulty: "Easy",
            question: "Which OOP concept wraps data (variables) and code (methods) together into a single unit?",
            options: ["Abstraction", "Encapsulation", "Inheritance", "Polymorphism"],
            correct: 1
        },
        {
            id: "o2",
            category: "OOP",
            difficulty: "Easy",
            question: "Which OOP concept allows a subclass to acquire properties and behaviors of a parent class?",
            options: ["Polymorphism", "Encapsulation", "Inheritance", "Overloading"],
            correct: 2
        },
        {
            id: "o3",
            category: "OOP",
            difficulty: "Medium",
            question: "What is Method Overloading?",
            options: ["Same method name with different parameters in the same class", "Same method name with same parameters in sub class", "Calling superclass constructor", "Deleting a method"],
            correct: 0
        },
        {
            id: "o4",
            category: "OOP",
            difficulty: "Medium",
            question: "Which concept hides complex implementation details and shows only essential features to the user?",
            options: ["Abstraction", "Encapsulation", "Polymorphism", "Inheritance"],
            correct: 0
        },
        {
            id: "o5",
            category: "OOP",
            difficulty: "Medium",
            question: "What is runtime polymorphism achieved through in Object-Oriented Programming?",
            options: ["Method Overloading", "Method Overriding", "Operator Overloading", "Static Binding"],
            correct: 1
        },
        {
            id: "o6",
            category: "OOP",
            difficulty: "Hard",
            question: "Can an abstract class in Java have concrete methods with implementation?",
            options: ["Yes", "No", "Only static methods", "Only private methods"],
            correct: 0
        },
        {
            id: "o7",
            category: "OOP",
            difficulty: "Hard",
            question: "What is the primary difference between an Interface and an Abstract Class?",
            options: ["A class can implement multiple interfaces but extend only one abstract class", "Interfaces can hold instance variables", "Abstract classes cannot have constructors", "Interfaces allow private instance fields"],
            correct: 0
        },
        {
            id: "o8",
            category: "OOP",
            difficulty: "Easy",
            question: "What is an Object in Object-Oriented Programming?",
            options: ["An instance of a class containing state and behavior", "A data type keyword", "A database table field", "A compiler instruction"],
            correct: 0
        },
        {
            id: "o9",
            category: "OOP",
            difficulty: "Medium",
            question: "Which access modifier restricts access strictly to within the declaring class itself?",
            options: ["public", "protected", "default", "private"],
            correct: 3
        },
        {
            id: "o10",
            category: "OOP",
            difficulty: "Hard",
            question: "What is Composition in OOP design?",
            options: ["A 'has-a' relationship where a complex object is composed of other objects", "An 'is-a' inheritance hierarchy", "Overriding superclass methods", "Global variable binding"],
            correct: 0
        }
    ],

    cs: [
        {
            id: "cs1",
            category: "Computer Science",
            difficulty: "Easy",
            question: "What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?",
            options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
            correct: 1
        },
        {
            id: "cs2",
            category: "Computer Science",
            difficulty: "Easy",
            question: "Which data structure operates on a Last-In, First-Out (LIFO) principle?",
            options: ["Queue", "Stack", "LinkedList", "Heap"],
            correct: 1
        },
        {
            id: "cs3",
            category: "Computer Science",
            difficulty: "Medium",
            question: "In Computer Networks, which layer of the OSI model handles routing and IP addressing?",
            options: ["Data Link Layer", "Network Layer", "Transport Layer", "Session Layer"],
            correct: 1
        },
        {
            id: "cs4",
            category: "Computer Science",
            difficulty: "Medium",
            question: "What is a Deadlock in Operating Systems?",
            options: ["A state where a set of processes are blocked because each process holds a resource and waits for another", "A process consuming 100% CPU", "A memory overflow condition", "A network disconnection"],
            correct: 0
        },
        {
            id: "cs5",
            category: "Computer Science",
            difficulty: "Medium",
            question: "Which sorting algorithm has a worst-case time complexity of O(N^2) but average O(N log N)?",
            options: ["Merge Sort", "Quick Sort", "Heap Sort", "Counting Sort"],
            correct: 1
        },
        {
            id: "cs6",
            category: "Computer Science",
            difficulty: "Hard",
            question: "Which CPU scheduling algorithm gives minimum average waiting time for a given set of processes?",
            options: ["First-Come, First-Served (FCFS)", "Shortest Job First (SJF)", "Round Robin (RR)", "Priority Scheduling"],
            correct: 1
        },
        {
            id: "cs7",
            category: "Computer Science",
            difficulty: "Hard",
            question: "In TCP/IP, which protocol guarantees reliable, connection-oriented data delivery?",
            options: ["UDP", "IP", "TCP", "ICMP"],
            correct: 2
        },
        {
            id: "cs8",
            category: "Computer Science",
            difficulty: "Easy",
            question: "Which data structure uses First-In, First-Out (FIFO) ordering?",
            options: ["Stack", "Queue", "Binary Tree", "Graph"],
            correct: 1
        },
        {
            id: "cs9",
            category: "Computer Science",
            difficulty: "Medium",
            question: "What does RAM stand for in computer hardware?",
            options: ["Read Access Memory", "Random Access Memory", "Run Application Module", "Rapid Access Storage"],
            correct: 1
        },
        {
            id: "cs10",
            category: "Computer Science",
            difficulty: "Hard",
            question: "What is Virtual Memory in Operating Systems?",
            options: ["A memory management capability that uses secondary storage to simulate additional RAM", "GPU VRAM allocation", "Cloud storage sync", "ROM cache"],
            correct: 0
        }
    ]
};
