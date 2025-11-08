# CS152Project

## GPA Calculator Web Application

A modern, interactive GPA calculator with an AI-powered chatbot assistant that helps students calculate their semester and overall GPAs using natural language processing.

## Features

- **Semester GPA Calculator**: Add courses with grades and credits to calculate your current semester GPA
- **Overall GPA Calculator**: Combine your previous cumulative GPA with your current semester to get your overall GPA
- **NLP-Powered Chatbot**: Use natural language to add courses and get GPA information
  - Example: "Add Math 101 with grade A and 3 credits"
  - Example: "What's my semester GPA?"
  - Example: "My previous GPA is 3.5 with 60 credits"

## Technologies Used

- HTML5, CSS3, JavaScript (Vanilla)
- compromise.js (NLP library)
- Python HTTP Server

## How to Run the Application

### Prerequisites

- Python 3.x installed on your system
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Steps

1. **Navigate to the project directory**:
   ```bash
   cd /path/to/CS152Project
   ```

2. **Start the Python HTTP server**:
   ```bash
   python3 -m http.server 8000
   ```

   You should see output like:
   ```
   Serving HTTP on :: port 8000 (http://[::]:8000/) ...
   ```

3. **Open the application in your browser**:
   - Go to: `http://localhost:8000`
   - Or: `http://127.0.0.1:8000`

4. **Start using the GPA calculator**:
   - Add courses manually using the form
   - Or click the chatbot icon in the bottom right to use natural language

### Stopping the Server

To stop the server, press `Ctrl+C` in the terminal window where the server is running.

## Usage Examples

### Adding Courses via Form
1. Enter the course name (e.g., "Math 101")
2. Select a grade from the dropdown (A, B+, C, etc.)
3. Enter the number of credits (e.g., 3)
4. Click "add course"

### Using the Chatbot
1. Click the chatbot icon in the bottom right corner
2. Type natural language commands like:
   - "Add Biology with B+ and 4 credits"
   - "Add CS 161A with grade A and 3 credits"
   - "My previous GPA is 3.2 with 45 credits"
   - "What's my overall GPA?"
   - "Calculate my semester GPA"

### Calculating Overall GPA
1. Scroll to the "overall GPA calculator" section
2. Enter your previous cumulative GPA (0.0 - 4.0)
3. Enter your previous total credits
4. Your overall GPA will automatically update based on your current semester courses

## Color Scheme

The application uses a blue and yellow gradient theme:
- Primary: Blue (#0066cc)
- Secondary: Yellow (#ffb600)

## Font

Times New Roman serif font throughout the application for a classic academic look.
