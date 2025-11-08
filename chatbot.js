// ==================== CHATBOT FUNCTIONALITY ====================

// Toggle chatbot window
function toggleChatbot() {
    const chatWindow = document.getElementById('chatbot-window');
    chatWindow.classList.toggle('chatbot-hidden');

    // Focus input when opening
    if (!chatWindow.classList.contains('chatbot-hidden')) {
        document.getElementById('chatbot-input').focus();
    }
}

// Handle Enter key in chatbot input
function handleChatbotKeypress(event) {
    if (event.key === 'Enter') {
        sendChatbotMessage();
    }
}

// Send user message
function sendChatbotMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to chat
    addMessageToChat(message, 'user');

    // Clear input
    input.value = '';

    // Process message with NLP
    setTimeout(() => {
        try {
            const response = processNLPMessage(message);
            addMessageToChat(response, 'bot');
        } catch (error) {
            console.error('Error in sendChatbotMessage:', error);
            addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }, 300);
}

// Add message to chat window
function addMessageToChat(message, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    messageDiv.innerHTML = message;
    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ==================== NLP PROCESSING ====================

function processNLPMessage(message) {
    const messageLower = message.toLowerCase();

    // Use simple pattern matching as fallback if NLP library isn't available
    const useNLP = typeof nlp !== 'undefined';

    let doc = null;
    let numericValues = [];

    if (useNLP) {
        try {
            doc = nlp(messageLower);
            numericValues = doc.numbers().toNumber().out('array');
        } catch (error) {
            console.error('NLP error:', error);
        }
    }

    // Fallback: Extract numbers manually if NLP fails
    if (numericValues.length === 0) {
        const numberMatches = message.match(/\d+\.?\d*/g);
        if (numberMatches) {
            numericValues = numberMatches.map(n => parseFloat(n));
        }
    }

    try {

    // Check for various intents using simple pattern matching

    // INTENT: Detect if message contains course information (grade + credits)
    const hasGradeInfo = /\b(grade\s+)?(a\+?|a-?|b\+?|b-?|c\+?|c-?|d\+?|d-?|f)\b/i.test(messageLower);
    const hasCreditInfo = /(credit|unit|hour)/i.test(messageLower) && numericValues.length > 0;
    const hasCourseInfo = hasGradeInfo && hasCreditInfo;

    // INTENT: Add course with GPA query (e.g., "if I take Math with A and 3 credits what is my gpa")
    if (hasCourseInfo && /(what|how).*(gpa|grade)/i.test(messageLower)) {
        const addResult = handleAddCourse(message, doc, numericValues);
        // If course was added successfully, also return the GPA
        if (addResult.includes("added")) {
            const gpaResult = handleCalculateGPA(message, doc);
            return addResult + "<br><br>" + gpaResult;
        }
        return addResult;
    }

    // INTENT: Add course (semester or hypothetical)
    if (/(add|create|enter|input|take|taking|register)/i.test(messageLower) && hasCourseInfo) {
        return handleAddCourse(message, doc, numericValues);
    }

    if (/(add|create|enter|input|take|taking|register).*(course|class)/i.test(messageLower)) {
        return handleAddCourse(message, doc, numericValues);
    }

    // INTENT: Set previous GPA
    if (/(previous|old|past|cumulative).*(gpa|grade)/i.test(messageLower) ||
        /(my gpa|my grade).*(was|is)/i.test(messageLower)) {
        return handleSetPreviousGPA(message, doc, numericValues);
    }

    // INTENT: Calculate or show GPA
    if (/(gpa|grade)/i.test(messageLower)) {
        if (/(what|show|tell|calculate|compute|get|whats|what is|what's)/i.test(messageLower) ||
            /(my|current|semester|overall|predicted)/i.test(messageLower)) {
            return handleCalculateGPA(message, doc);
        }
    }

    // INTENT: Remove/delete course
    if (/(remove|delete|drop).*(course|class)/i.test(messageLower)) {
        return "To remove a course, please use the remove button next to the course in the list above.";
    }

    // INTENT: Reset
    if (/(reset|clear|delete).*(all|everything)/i.test(messageLower)) {
        return "To reset, please use the reset buttons in each section above.";
    }

    // INTENT: Help
    if (/(help|what can|how do|assist)/i.test(messageLower)) {
        return `I can help you with:
        <br><br>
        <strong>Adding Courses:</strong>
        <br>• "Add Math 101 with grade A and 3 credits"
        <br>• "Add Biology with B+ and 4 credits"
        <br><br>
        <strong>Previous GPA:</strong>
        <br>• "My previous GPA is 3.5 with 60 credits"
        <br>• "Set previous GPA to 3.2 and 45 credits"
        <br><br>
        <strong>Calculate GPA:</strong>
        <br>• "What's my semester GPA?"
        <br>• "Calculate my overall GPA"`;
    }

    // INTENT: Greeting
    if (/(hello|hi|hey|greetings)/i.test(messageLower)) {
        return "Hello! How can I help you with your GPA calculations today?";
    }

    // INTENT: Thanks
    if (/(thank|thanks|thx)/i.test(messageLower)) {
        return "You're welcome! Let me know if you need anything else.";
    }

    // Default response
    return `I'm not sure I understood that. Try saying something like:
    <br>• "Add Math 101 with grade A and 3 credits"
    <br>• "What's my semester GPA?"
    <br>• "My previous GPA is 3.5 with 60 credits"
    <br>• Type "help" for more examples`;

    } catch (error) {
        console.error('Error processing NLP message:', error);
        return "Sorry, I encountered an error processing your message. Please try rephrasing or use the forms above.";
    }
}

// ==================== INTENT HANDLERS ====================

function handleAddCourse(message, doc, numericValues) {

    // Extract course name with improved logic
    let courseName = '';
    const messageLower = message.toLowerCase();

    // Try to find course name pattern (e.g., "math 161A", "CS 101", "biology")
    // Look for text after action words and before credit/grade indicators
    const addWords = ['add', 'create', 'enter', 'input', 'take', 'taking', 'register'];
    const stopWords = ['with', 'grade', 'credit', 'this semester', 'which is', 'that is', 'and i get', 'what'];

    let startIndex = -1;
    let startWord = '';

    for (let word of addWords) {
        const idx = messageLower.indexOf(word);
        if (idx !== -1) {
            startIndex = idx + word.length;
            startWord = word;
            break;
        }
    }

    if (startIndex !== -1) {
        // Find the end index by looking for stop words
        let endIndex = message.length;

        for (let stopWord of stopWords) {
            const stopIdx = messageLower.indexOf(stopWord, startIndex);
            if (stopIdx !== -1 && stopIdx < endIndex) {
                endIndex = stopIdx;
            }
        }

        courseName = message.substring(startIndex, endIndex).trim();

        // Remove common filler words
        courseName = courseName.replace(/\b(course|class|hypothetical|predicted|future|a|an|the|this|that|semester)\b/gi, '').trim();

        // Clean up extra spaces
        courseName = courseName.replace(/\s+/g, ' ').trim();
    }

    // If still no course name, try to extract word + number pattern (e.g., "math 161A")
    if (!courseName || courseName.length < 2) {
        const coursePattern = /\b([a-z]+\s*\d+[a-z]*)\b/i;
        const match = message.match(coursePattern);
        if (match) {
            courseName = match[1];
        }
    }

    if (!courseName || courseName.length < 2) {
        courseName = 'Course ' + Date.now();
    }

    // Extract grade
    const gradeMap = {
        'a+': 4.0, 'a': 4.0, 'a-': 3.7, 'a minus': 3.7,
        'b+': 3.3, 'b plus': 3.3, 'b': 3.0, 'b-': 2.7, 'b minus': 2.7,
        'c+': 2.3, 'c plus': 2.3, 'c': 2.0, 'c-': 1.7, 'c minus': 1.7,
        'd+': 1.3, 'd plus': 1.3, 'd': 1.0, 'd-': 0.7, 'd minus': 0.7,
        'f': 0.0
    };

    let grade = null;

    for (let [key, value] of Object.entries(gradeMap)) {
        // Create pattern that handles "an A", "a B", "get an A", "grade A", etc.
        const gradePattern = new RegExp(`\\b(grade|get|with|receive)\\s+(an?\\s+)?${key}\\b|\\b${key}\\b\\s+(grade|credit)`, 'i');
        if (gradePattern.test(message) ||
            messageLower.includes('grade ' + key) ||
            messageLower.includes('get ' + key) ||
            messageLower.includes('with ' + key)) {
            grade = value;
            break;
        }
    }

    // Extract credits (look for numbers, prefer the one after "credit")
    let credits = null;

    if (numericValues.length > 0) {
        // Try to find credit number
        const creditIndex = messageLower.indexOf('credit');
        if (creditIndex !== -1) {
            // Look for number near 'credit'
            for (let i = 0; i < numericValues.length; i++) {
                const num = numericValues[i];
                if (num > 0 && num <= 10) { // Credits are typically 0-10
                    credits = num;
                    break;
                }
            }
        }

        // If not found, take the first reasonable number
        if (!credits) {
            for (let num of numericValues) {
                if (num > 0 && num <= 10 && num !== grade) {
                    credits = num;
                    break;
                }
            }
        }
    }

    // Validate
    if (!grade && grade !== 0) {
        return "I couldn't find a grade. Please specify a grade like A, B+, C, etc.";
    }

    if (!credits) {
        return "I couldn't find the credit hours. Please specify the number of credits (e.g., 3 credits).";
    }

    // Add the course
    try {
        // Set form values
        document.getElementById('semesterCourseName').value = courseName;
        document.getElementById('semesterGradeSelect').value = grade;
        document.getElementById('semesterCredits').value = credits;

        // Add course
        addSemesterCourse();

        return `Perfect! I've added "<strong>${courseName}</strong>" with grade <strong>${getGradeLetter(grade)}</strong> and <strong>${credits}</strong> credits to your semester courses!`;
    } catch (error) {
        return "Sorry, I encountered an error adding the course. Please try using the form above.";
    }
}

function handleSetPreviousGPA(message, doc, numericValues) {
    if (numericValues.length < 2) {
        return "Please provide both your previous GPA and total credits. For example: 'My previous GPA is 3.5 with 60 credits'";
    }

    // First number is likely GPA (0-4), second is credits
    let gpa = null;
    let credits = null;

    for (let num of numericValues) {
        if (num >= 0 && num <= 4 && !gpa) {
            gpa = num;
        } else if (num > 4 && !credits) {
            credits = num;
        }
    }

    // If we couldn't identify, take first two
    if (!gpa || !credits) {
        gpa = numericValues[0];
        credits = numericValues[1];
    }

    if (gpa > 4) {
        // Swap if needed
        [gpa, credits] = [credits, gpa];
    }

    try {
        document.getElementById('previousGpa').value = gpa;
        document.getElementById('previousCredits').value = credits;
        calculateOverallGPA();

        return `Got it! I've set your previous GPA to <strong>${gpa.toFixed(2)}</strong> with <strong>${credits}</strong> credits. Your overall GPA has been updated!`;
    } catch (error) {
        return "Sorry, I encountered an error setting the previous GPA. Please try using the form above.";
    }
}

function handleCalculateGPA(message, doc) {
    const messageLower = message.toLowerCase();

    // Determine which GPA to show
    if (messageLower.includes('semester') || messageLower.includes('current')) {
        const gpa = document.getElementById('semesterGpaResult').textContent;
        const credits = document.getElementById('semesterTotalCredits').textContent;
        const courses = document.getElementById('semesterTotalCourses').textContent;

        return `Your <strong>Semester GPA</strong> is <strong>${gpa}</strong> based on ${courses} course(s) and ${credits} credits.`;
    } else if (messageLower.includes('overall') || messageLower.includes('cumulative') || messageLower.includes('total')) {
        const gpa = document.getElementById('overallGpaResult').textContent;
        const totalCredits = document.getElementById('overallTotalCredits').textContent;

        return `Your <strong>Overall GPA</strong> is <strong>${gpa}</strong> with a total of ${totalCredits} credits.`;
    } else {
        // Default to semester GPA
        const semesterGpa = document.getElementById('semesterGpaResult').textContent;
        const overallGpa = document.getElementById('overallGpaResult').textContent;

        return `Here are your GPAs:
        <br>• <strong>Semester GPA:</strong> ${semesterGpa}
        <br>• <strong>Overall GPA:</strong> ${overallGpa}
        <br><br>Ask me about a specific one for more details!`;
    }
}

// ==================== INITIALIZATION ====================

// Make sure chatbot starts hidden
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('chatbot-window').classList.add('chatbot-hidden');
});
