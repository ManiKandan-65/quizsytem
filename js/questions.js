/* ==========================================================================
   QuizSystem - Advanced Learning-Focused Question Dataset
   Categorized by: Java, HTML & CSS, JavaScript, DBMS, OOP, Computer Science
   Each question includes:
   - hint: Educational clue (doesn't give away the answer directly)
   - explanation: WHY the correct answer matches
   - solution: Step-by-step resolution array (HOW TO SOLVE)
   - concept: Core underlying CS/programming concept
   - quickTip: Memory tip / rule of thumb
   ========================================================================== */

const QUESTION_DATABASE = {
    java: [
        {
            id: "j1",
            category: "Java",
            difficulty: "Easy",
            question: "Which keyword is used to declare a class in Java?",
            options: ["struct", "class", "interface", "define"],
            correct: 1,
            hint: "Think about the foundational keyword used in Java to encapsulate data and methods into a blueprint.",
            explanation: "The 'class' keyword is used in Java to define a user-defined blueprint from which individual objects are instantiated.",
            solution: [
                "Step 1: Identify that Java is a pure class-based Object-Oriented language.",
                "Step 2: Recognize that 'struct' belongs to C/C++, 'define' is a C preprocessor directive, and 'interface' declares abstract contracts.",
                "Step 3: Conclude that 'class' is the correct keyword for defining a class blueprint."
            ],
            concept: "Classes & Blueprint Definition in Object-Oriented Java.",
            quickTip: "Every standalone Java program requires at least one class definition."
        },
        {
            id: "j2",
            category: "Java",
            difficulty: "Easy",
            question: "What is the size of a standard primitive 'int' data type in Java?",
            options: ["8 bits", "16 bits", "32 bits", "64 bits"],
            correct: 2,
            hint: "Java primitive integer sizes are fixed regardless of operating system architecture. It uses 4 bytes.",
            explanation: "In Java, an 'int' is a signed 32-bit primitive data type with a range from -2^31 to 2^31 - 1.",
            solution: [
                "Step 1: Recall primitive sizes in Java: byte (8-bit), short (16-bit), int (32-bit), long (64-bit).",
                "Step 2: 4 bytes equal 4 * 8 = 32 bits.",
                "Step 3: Therefore, Java 'int' occupies exactly 32 bits."
            ],
            concept: "Fixed Primitive Data Types in Java Virtual Machine (JVM).",
            quickTip: "Remember byte (1), short (2), int (4), long (8) bytes."
        },
        {
            id: "j3",
            category: "Java",
            difficulty: "Medium",
            question: "Which Java Collection class guarantees unique elements and does not allow duplicates?",
            options: ["ArrayList", "Vector", "HashSet", "LinkedList"],
            correct: 2,
            hint: "Think of the set data structure in mathematics where duplicate elements are automatically excluded.",
            explanation: "HashSet implements the Set interface, backed by a hashtable. It stores unique elements by using hashCode() and equals() to prevent duplicates.",
            solution: [
                "Step 1: Analyze ArrayList, Vector, and LinkedList: all allow duplicate elements.",
                "Step 2: Recognize that Set interface implementations forbid duplicate elements.",
                "Step 3: HashSet checks element equality using hashCode() and equals() to ensure uniqueness."
            ],
            concept: "Java Collections Framework - Set vs List interfaces.",
            quickTip: "List allows duplicates; Set enforces uniqueness."
        },
        {
            id: "j4",
            category: "Java",
            difficulty: "Medium",
            question: "Which exception is thrown when an array is accessed with an invalid or negative index?",
            options: ["NullPointerException", "ArrayIndexOutOfBoundsException", "IllegalArgumentException", "ClassNotFoundException"],
            correct: 1,
            hint: "Consider what happens when you try to access an index outside the valid range [0, length - 1].",
            explanation: "ArrayIndexOutOfBoundsException is an unchecked RuntimeException thrown to indicate that an array has been accessed with an illegal index.",
            solution: [
                "Step 1: Note that arrays in Java are zero-indexed from 0 to length - 1.",
                "Step 2: Accessing index < 0 or index >= length triggers an unchecked runtime error.",
                "Step 3: The JVM throws ArrayIndexOutOfBoundsException to prevent memory corruption."
            ],
            concept: "Java Exception Handling & Array Index Boundaries.",
            quickTip: "Valid array indices always satisfy: 0 <= index < array.length."
        },
        {
            id: "j5",
            category: "Java",
            difficulty: "Hard",
            question: "What happens if a thread calls Object.wait() without holding the target object's monitor lock?",
            options: ["InterruptedException", "IllegalMonitorStateException", "ThreadDeath", "Deadlock"],
            correct: 1,
            hint: "To call wait(), notify(), or notifyAll(), a thread must first enter a synchronized block on that object.",
            explanation: "If a thread invokes wait() or notify() without owning the specified object's monitor lock (i.e. outside synchronized code), the JVM throws IllegalMonitorStateException.",
            solution: [
                "Step 1: Understand that wait() releases the monitor lock of an object.",
                "Step 2: If the current thread does not own the monitor lock, it cannot release or wait on it.",
                "Step 3: The JVM immediately throws an IllegalMonitorStateException at runtime."
            ],
            concept: "Java Concurrency & Inter-thread Communication Locks.",
            quickTip: "Always wrap wait() and notify() calls inside synchronized(object) blocks."
        }
    ],

    html_css: [
        {
            id: "hc1",
            category: "HTML & CSS",
            difficulty: "Easy",
            question: "Which HTML tag is used to create an inline hyperlink?",
            options: ["<link>", "<a>", "<href>", "<url>"],
            correct: 1,
            hint: "The tag stands for 'anchor' and uses the 'href' attribute to point to the destination URL.",
            explanation: "The <a> (anchor) element defines a hyperlink that links one page to another or to an anchor within the same page.",
            solution: [
                "Step 1: Identify that <link> is used in <head> for external CSS stylesheets.",
                "Step 2: Recognize that href is an attribute, not an HTML tag name.",
                "Step 3: Conclude that <a> (Anchor tag) is the correct HTML element."
            ],
            concept: "HTML Links & Hypertext Navigation.",
            quickTip: "Use <a href='url'>Link Text</a> to build clickable web links."
        },
        {
            id: "hc2",
            category: "HTML & CSS",
            difficulty: "Medium",
            question: "In CSS Flexbox, which property aligns flex items along the cross axis?",
            options: ["justify-content", "align-items", "flex-direction", "align-content"],
            correct: 1,
            hint: "justify-content handles alignment along the main axis, while this property handles alignment along the perpendicular cross axis.",
            explanation: "align-items sets the align-self value on all direct flex children, aligning them along the cross axis (vertically by default in row layout).",
            solution: [
                "Step 1: Differentiate main axis vs. cross axis in Flexbox.",
                "Step 2: justify-content controls main axis alignment (e.g. horizontal in row mode).",
                "Step 3: align-items controls cross axis alignment (e.g. vertical in row mode)."
            ],
            concept: "CSS Flexible Box Layout Model (Flexbox Alignment).",
            quickTip: "justify-content = Main Axis | align-items = Cross Axis."
        },
        {
            id: "hc3",
            category: "HTML & CSS",
            difficulty: "Medium",
            question: "In the CSS Box Model, which space sits directly between the element content and its border?",
            options: ["margin", "padding", "outline", "gap"],
            correct: 1,
            hint: "This space creates inner clearance inside the border around an element's content.",
            explanation: "Padding is the space inside the border surrounding the content area. Margin is the outer space outside the border.",
            solution: [
                "Step 1: Review Box Model order from inside out: Content -> Padding -> Border -> Margin.",
                "Step 2: Identify that padding sits directly between Content and Border.",
                "Step 3: Margin sits outside the border to separate adjacent elements."
            ],
            concept: "CSS Box Model Architecture (Content, Padding, Border, Margin).",
            quickTip: "Padding is INNER space; Margin is OUTER space."
        },
        {
            id: "hc4",
            category: "HTML & CSS",
            difficulty: "Hard",
            question: "What is the specificity calculation score of a single ID selector in CSS?",
            options: ["(0, 0, 0, 1)", "(0, 0, 1, 0)", "(0, 1, 0, 0)", "(1, 0, 0, 0)"],
            correct: 2,
            hint: "Specificity is expressed as (Inline, ID, Class/Attr/Pseudo, Element). An ID fills the second column.",
            explanation: "An ID selector (e.g. #header) has a specificity value of (0, 1, 0, 0), overriding class selectors (0, 0, 1, 0) and element selectors (0, 0, 0, 1).",
            solution: [
                "Step 1: Recall specificity tuple format (Inline, ID, Class, Type).",
                "Step 2: Element selectors = (0,0,0,1); Class/Pseudo = (0,0,1,0); ID selectors = (0,1,0,0); Inline = (1,0,0,0).",
                "Step 3: Therefore, a single ID selector scores (0, 1, 0, 0)."
            ],
            concept: "CSS Cascade & Specificity Weight Hierarchy.",
            quickTip: "ID > Class > Element selector."
        }
    ],

    javascript: [
        {
            id: "js1",
            category: "JavaScript",
            difficulty: "Easy",
            question: "Which keyword is used to declare a variable in JavaScript that cannot be reassigned?",
            options: ["var", "let", "const", "static"],
            correct: 2,
            hint: "This ES6 keyword creates a block-scoped immutable binding that prevents re-assignment.",
            explanation: "Variables declared with 'const' are block-scoped and cannot be reassigned once bound to a value.",
            solution: [
                "Step 1: 'var' is function-scoped and reassignable.",
                "Step 2: 'let' is block-scoped and reassignable.",
                "Step 3: 'const' is block-scoped and forbids reassignment."
            ],
            concept: "ES6 Variable Declarations (var vs let vs const).",
            quickTip: "Use 'const' by default unless you know the variable value will change."
        },
        {
            id: "js2",
            category: "JavaScript",
            difficulty: "Medium",
            question: "What is the evaluated output of typeof NaN in JavaScript?",
            options: ["undefined", "null", "number", "nan"],
            correct: 2,
            hint: "Despite standing for 'Not-a-Number', its underlying primitive type classification in JavaScript is numeric.",
            explanation: "In JavaScript, NaN (Not-a-Number) is a special numeric value defined by the IEEE 754 floating-point standard, so typeof NaN returns 'number'.",
            solution: [
                "Step 1: Recognize NaN as a special result of failed mathematical operations (e.g. 'abc' / 2).",
                "Step 2: Check the ECMAScript spec specification for typeof NaN.",
                "Step 3: In ES specifications, typeof NaN evaluates to 'number'."
            ],
            concept: "JavaScript Type System Gotchas & IEEE 754 Floating Point Representation.",
            quickTip: "Use Number.isNaN(val) to reliably check for NaN."
        },
        {
            id: "js3",
            category: "JavaScript",
            difficulty: "Medium",
            question: "What is a Closure in JavaScript?",
            options: [
                "A function bundled together with references to its lexical scope environment",
                "A built-in method to close DOM event streams",
                "A private class keyword",
                "An event loop termination handler"
            ],
            correct: 0,
            hint: "Focus on how an inner function retains access to variables declared in its outer scope even after the outer function finishes executing.",
            explanation: "A closure gives an inner function access to its outer function's scope variables, preserving them even after the outer function execution context is popped off the call stack.",
            solution: [
                "Step 1: Understand lexical scoping in JS: inner functions have access to variables in outer scopes.",
                "Step 2: When an inner function outlives its outer function, it retains references to those outer variables.",
                "Step 3: This bundle of function + lexical environment is called a Closure."
            ],
            concept: "JavaScript Execution Context, Lexical Scoping & Closures.",
            quickTip: "Closures = Inner Function + Outer Lexical Scope Memory."
        },
        {
            id: "js4",
            category: "JavaScript",
            difficulty: "Hard",
            question: "What does Event Delegation rely on in the JavaScript DOM event architecture?",
            options: ["Event Capturing", "Event Bubbling", "DOM Re-parsing", "Shadow DOM"],
            correct: 1,
            hint: "Events triggered on child elements propagate upwards through parent ancestors in the DOM tree.",
            explanation: "Event Delegation uses Event Bubbling to attach a single event listener to a common parent element, catching events triggered by child elements as they bubble up.",
            solution: [
                "Step 1: Understand Event Bubbling: event triggers on target, then travels up to parent, grandparent, and window.",
                "Step 2: Instead of adding 100 listeners to 100 list items, add 1 listener to the parent <ul>.",
                "Step 3: The parent catches events as they bubble up, checking e.target."
            ],
            concept: "DOM Event Propagation & Event Delegation Pattern.",
            quickTip: "Event Delegation = Single Parent Listener + Event Bubbling."
        }
    ],

    dbms: [
        {
            id: "db1",
            category: "DBMS",
            difficulty: "Easy",
            question: "Which SQL clause is used to filter rows returned by a SELECT query?",
            options: ["GROUP BY", "WHERE", "ORDER BY", "HAVING"],
            correct: 1,
            hint: "This clause specifies condition filters before any grouping or aggregation takes place.",
            explanation: "The WHERE clause is used to filter records and extract only those records that fulfill a specified condition.",
            solution: [
                "Step 1: Identify that WHERE filters individual rows before grouping.",
                "Step 2: HAVING filters groups after GROUP BY.",
                "Step 3: Therefore, WHERE is used for row-level filtering."
            ],
            concept: "Relational Database SQL Query Execution Order.",
            quickTip: "WHERE filters rows; HAVING filters aggregated groups."
        },
        {
            id: "db2",
            category: "DBMS",
            difficulty: "Medium",
            question: "What does ACID stand for in Database Transaction Management?",
            options: [
                "Atomicity, Consistency, Isolation, Durability",
                "Accuracy, Control, Integration, Data",
                "Access, Concurrency, Index, Database",
                "Action, Constraint, Isolation, Domain"
            ],
            correct: 0,
            hint: "These four properties guarantee that database transactions are processed reliably.",
            explanation: "ACID stands for Atomicity (all or nothing), Consistency (valid state transitions), Isolation (independent concurrent execution), and Durability (committed data persists).",
            solution: [
                "Step 1: Atomicity = All operations complete or none do.",
                "Step 2: Consistency = Database constraints remain valid.",
                "Step 3: Isolation = Concurrent transactions do not interfere.",
                "Step 4: Durability = Committed transactions survive system crashes."
            ],
            concept: "Relational DBMS Transaction ACID Guarantees.",
            quickTip: "Remember: All-or-nothing (Atomicity) + Reliable Storage (Durability)."
        },
        {
            id: "db3",
            category: "DBMS",
            difficulty: "Hard",
            question: "Which SQL JOIN type returns all records when there is a match in either left or right table?",
            options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
            correct: 3,
            hint: "Think of the set union operation that combines results from both tables regardless of match location.",
            explanation: "FULL OUTER JOIN combines the results of both LEFT and RIGHT joins, returning all matching records from both tables and NULL for non-matching sides.",
            solution: [
                "Step 1: INNER JOIN returns only matching rows.",
                "Step 2: LEFT JOIN returns all rows from left + matching right.",
                "Step 3: FULL OUTER JOIN returns all rows from both tables, filling NULLs where no match exists."
            ],
            concept: "Relational Algebra & SQL Set Join Types.",
            quickTip: "FULL OUTER JOIN = Union of Left and Right Joins."
        }
    ],

    oop: [
        {
            id: "o1",
            category: "OOP",
            difficulty: "Easy",
            question: "Which OOP principle bundles data (attributes) and methods operating on that data into a single class unit while restricting direct access?",
            options: ["Abstraction", "Encapsulation", "Inheritance", "Polymorphism"],
            correct: 1,
            hint: "Think of a protective capsule that hides internal variables behind getter and setter methods.",
            explanation: "Encapsulation is the bundling of data and methods operating on that data within a single class, hiding internal implementation details using private access modifiers.",
            solution: [
                "Step 1: Identify key goal: Data hiding and bundling inside a class unit.",
                "Step 2: Private fields + Public Getters/Setters = Encapsulation.",
                "Step 3: Conclude that Encapsulation is the correct OOP pillar."
            ],
            concept: "Object-Oriented Programming (OOP) Data Encapsulation.",
            quickTip: "Encapsulation = Data Hiding + Protective Access Modifiers."
        },
        {
            id: "o2",
            category: "OOP",
            difficulty: "Medium",
            question: "Which OOP concept allows the same method call to exhibit different behaviors depending on the runtime object instance?",
            options: ["Polymorphism", "Encapsulation", "Inheritance", "Abstraction"],
            correct: 0,
            hint: "The word comes from Greek meaning 'many forms'. It enables method overriding.",
            explanation: "Polymorphism allows objects of different classes to respond to the same method invocation in their own unique way (e.g. Shape.draw() called on Circle or Square).",
            solution: [
                "Step 1: Note that 'poly' = many, 'morph' = forms.",
                "Step 2: Method Overriding allows a subclass to provide a specific implementation of a superclass method.",
                "Step 3: At runtime, the JVM calls the overridden version corresponding to the actual instance object."
            ],
            concept: "Dynamic Method Dispatch & Runtime Polymorphism.",
            quickTip: "Polymorphism = One Interface, Multiple Runtime Behaviors."
        },
        {
            id: "o3",
            category: "OOP",
            difficulty: "Hard",
            question: "What is the primary architectural difference between an Interface and an Abstract Class in Java?",
            options: [
                "A class can implement multiple interfaces but extend only one class",
                "Interfaces can store non-final instance fields",
                "Abstract classes cannot declare constructors",
                "Interfaces allow private state instance fields"
            ],
            correct: 0,
            hint: "Consider Java's single inheritance rule for classes versus multiple implementation capability for interfaces.",
            explanation: "Java supports single class inheritance (a class can extend only one abstract class) but multiple interface inheritance (a class can implement multiple interfaces).",
            solution: [
                "Step 1: Abstract class represents an 'is-a' hierarchy with state.",
                "Step 2: Interface represents a 'can-do' contract capability.",
                "Step 3: Java allows extending 1 class, but implementing N interfaces."
            ],
            concept: "Multiple Interface Implementation vs Single Class Inheritance.",
            quickTip: "Extend 1 Abstract Class; Implement Multiple Interfaces."
        }
    ],

    cs: [
        {
            id: "cs1",
            category: "Computer Science",
            difficulty: "Easy",
            question: "Which data structure operates strictly on a Last-In, First-Out (LIFO) principle?",
            options: ["Queue", "Stack", "LinkedList", "Heap"],
            correct: 1,
            hint: "Think of a stack of plates where the last plate placed on top is the first plate removed.",
            explanation: "A Stack is a linear data structure following LIFO order, where push and pop operations occur at the top of the stack.",
            solution: [
                "Step 1: Queue = First-In, First-Out (FIFO).",
                "Step 2: Stack = Last-In, First-Out (LIFO).",
                "Step 3: Pushing puts an item on top; popping removes from the top."
            ],
            concept: "Core Data Structures - Linear Stacks & Call Stack Execution.",
            quickTip: "Stack = LIFO | Queue = FIFO."
        },
        {
            id: "cs2",
            category: "Computer Science",
            difficulty: "Medium",
            question: "In Computer Networks, which layer of the 7-layer OSI model is responsible for logical IP addressing and packet routing?",
            options: ["Data Link Layer", "Network Layer", "Transport Layer", "Session Layer"],
            correct: 1,
            hint: "Routers operate at Layer 3 of the OSI model using IP addresses to route packets across subnets.",
            explanation: "The Network Layer (Layer 3) handles logical IP addressing, packet forwarding, and routing across heterogeneous networks.",
            solution: [
                "Step 1: Layer 2 (Data Link) uses MAC addresses and switches.",
                "Step 2: Layer 3 (Network) uses IP addresses and routers.",
                "Step 3: Layer 4 (Transport) uses TCP/UDP ports."
            ],
            concept: "OSI 7-Layer Reference Model & IP Routing Architecture.",
            quickTip: "Layer 3 = Network Layer (IP Addresses & Routers)."
        },
        {
            id: "cs3",
            category: "Computer Science",
            difficulty: "Hard",
            question: "What is a Deadlock in Operating Systems concurrent processing?",
            options: [
                "A state where a set of processes are permanently blocked because each holds a resource and waits for another held by another process",
                "A process exceeding maximum RAM allocation limit",
                "A network connection timeout exception",
                "A CPU thread starvation condition"
            ],
            correct: 0,
            hint: "Think of Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.",
            explanation: "A Deadlock occurs when two or more processes are unable to proceed because each is waiting for the other to release a resource, causing a circular waiting loop.",
            solution: [
                "Step 1: Process A holds Resource 1 and requests Resource 2.",
                "Step 2: Process B holds Resource 2 and requests Resource 1.",
                "Step 3: Neither process can proceed, creating a permanent Deadlock state."
            ],
            concept: "Operating System Process Concurrency & Deadlock Coffman Conditions.",
            quickTip: "Deadlock = Circular Wait where everyone waits for everyone else."
        }
    ]
};
