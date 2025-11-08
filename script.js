// ==================== SECTION 1: SEMESTER GPA CALCULATOR ====================

// Store semester courses
let semesterCourses = [];

// Add a semester course
function addSemesterCourse() {
    const courseName = document.getElementById('semesterCourseName').value.trim();
    const grade = parseFloat(document.getElementById('semesterGradeSelect').value);
    const credits = parseFloat(document.getElementById('semesterCredits').value);

    // Validation
    if (!courseName) {
        alert('Please enter a course name');
        return;
    }

    if (isNaN(grade)) {
        alert('Please select a grade');
        return;
    }

    if (isNaN(credits) || credits <= 0) {
        alert('Please enter valid credits');
        return;
    }

    // Create course object
    const course = {
        id: Date.now(),
        name: courseName,
        grade: grade,
        credits: credits
    };

    // Add to semester courses array
    semesterCourses.push(course);

    // Clear inputs
    document.getElementById('semesterCourseName').value = '';
    document.getElementById('semesterGradeSelect').value = '';
    document.getElementById('semesterCredits').value = '';

    // Update display
    displaySemesterCourses();
    calculateSemesterGPA();
    calculateOverallGPA();
}

// Display semester courses
function displaySemesterCourses() {
    const coursesList = document.getElementById('semesterCoursesList');

    if (semesterCourses.length === 0) {
        coursesList.innerHTML = '<div class="empty-message">No courses added yet. Add your first course above!</div>';
        return;
    }

    coursesList.innerHTML = semesterCourses.map(course => `
        <div class="course-item">
            <div class="course-info">
                <div class="course-name">${course.name}</div>
                <div class="course-details">
                    Grade: ${getGradeLetter(course.grade)} (${course.grade.toFixed(1)}) |
                    Credits: ${course.credits}
                </div>
            </div>
            <button class="btn-remove" onclick="removeSemesterCourse(${course.id})">Remove</button>
        </div>
    `).join('');
}

// Remove a semester course
function removeSemesterCourse(id) {
    semesterCourses = semesterCourses.filter(course => course.id !== id);
    displaySemesterCourses();
    calculateSemesterGPA();
    calculateOverallGPA();
}

// Calculate semester GPA
function calculateSemesterGPA() {
    if (semesterCourses.length === 0) {
        document.getElementById('semesterGpaResult').textContent = '0.00';
        document.getElementById('semesterTotalCredits').textContent = '0';
        document.getElementById('semesterTotalCourses').textContent = '0';
        return;
    }

    // Calculate total grade points and total credits
    let totalGradePoints = 0;
    let totalCredits = 0;

    semesterCourses.forEach(course => {
        totalGradePoints += course.grade * course.credits;
        totalCredits += course.credits;
    });

    // Calculate GPA
    const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    // Update display
    document.getElementById('semesterGpaResult').textContent = gpa.toFixed(2);
    document.getElementById('semesterTotalCredits').textContent = totalCredits.toFixed(1);
    document.getElementById('semesterTotalCourses').textContent = semesterCourses.length;

    return { gpa, credits: totalCredits };
}

// Reset semester calculator
function resetSemesterCalculator() {
    if (semesterCourses.length === 0) {
        alert('No courses to reset!');
        return;
    }

    if (confirm('Are you sure you want to remove all semester courses?')) {
        semesterCourses = [];
        displaySemesterCourses();
        calculateSemesterGPA();
        calculateOverallGPA();
    }
}

// ==================== SECTION 2: OVERALL GPA CALCULATOR ====================

// Calculate overall GPA (combining previous GPA with current semester)
function calculateOverallGPA() {
    const previousGpa = parseFloat(document.getElementById('previousGpa').value) || 0;
    const previousCredits = parseFloat(document.getElementById('previousCredits').value) || 0;

    // Get semester data
    const semesterData = calculateSemesterGPA();
    const semesterGpa = semesterData ? semesterData.gpa : 0;
    const semesterCredits = semesterData ? semesterData.credits : 0;

    // Calculate overall GPA
    const previousGradePoints = previousGpa * previousCredits;
    const semesterGradePoints = semesterGpa * semesterCredits;
    const totalCredits = previousCredits + semesterCredits;

    const overallGpa = totalCredits > 0 ? (previousGradePoints + semesterGradePoints) / totalCredits : 0;

    // Update display
    document.getElementById('overallGpaResult').textContent = overallGpa.toFixed(2);
    document.getElementById('overallTotalCredits').textContent = totalCredits.toFixed(1);
    document.getElementById('overallPreviousCredits').textContent = previousCredits.toFixed(1);
    document.getElementById('overallSemesterCredits').textContent = semesterCredits.toFixed(1);

    return { gpa: overallGpa, credits: totalCredits };
}

// ==================== UTILITY FUNCTIONS ====================

// Get letter grade from GPA value
function getGradeLetter(gpa) {
    if (gpa >= 4.0) return 'A';
    if (gpa >= 3.7) return 'A-';
    if (gpa >= 3.3) return 'B+';
    if (gpa >= 3.0) return 'B';
    if (gpa >= 2.7) return 'B-';
    if (gpa >= 2.3) return 'C+';
    if (gpa >= 2.0) return 'C';
    if (gpa >= 1.7) return 'C-';
    if (gpa >= 1.3) return 'D+';
    if (gpa >= 1.0) return 'D';
    return 'F';
}

// ==================== INITIALIZATION ====================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Semester section Enter key support
    const semesterInputs = document.querySelectorAll('#semesterCourseName, #semesterGradeSelect, #semesterCredits');
    semesterInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addSemesterCourse();
            }
        });
    });

    // Overall section auto-calculate on input
    const overallInputs = document.querySelectorAll('#previousGpa, #previousCredits');
    overallInputs.forEach(input => {
        input.addEventListener('input', calculateOverallGPA);
    });

    // Initialize displays
    displaySemesterCourses();
    calculateSemesterGPA();
    calculateOverallGPA();
});
