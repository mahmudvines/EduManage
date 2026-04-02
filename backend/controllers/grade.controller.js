// ============================================================
// controllers/grade.controller.js
// ============================================================

const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// @route   POST /api/grades
// @desc    Upload/set grades for a student in a course
const uploadGrades = async (req, res) => {
  try {
    const { studentId, courseId, assessments, semester, year, remarks } = req.body;
    const teacher = await Teacher.findOne({ user: req.user._id });

    // Calculate weighted final score
    let totalWeight = 0;
    let weightedScore = 0;

    for (const assessment of assessments) {
      const score = (assessment.score / assessment.maxScore) * 100;
      weightedScore += score * (assessment.weight / 100);
      totalWeight += assessment.weight;
    }

    const finalScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

    // Create a temp grade doc to get letter grade
    const tempGrade = new Grade({ finalScore });
    const { letter, points } = tempGrade.calculateLetterGrade();

    const grade = await Grade.findOneAndUpdate(
      { student: studentId, course: courseId, semester, year },
      {
        student: studentId,
        course: courseId,
        uploadedBy: teacher?._id,
        assessments,
        finalScore,
        letterGrade: letter,
        gradePoints: points,
        semester,
        year,
        remarks
      },
      { upsert: true, new: true }
    );

    // Update student GPA
    await updateStudentGPA(studentId);

    res.json({ message: 'Grades uploaded successfully', grade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: Update student's GPA
const updateStudentGPA = async (studentId) => {
  const grades = await Grade.find({ student: studentId });
  if (grades.length === 0) return;

  const totalPoints = grades.reduce((sum, g) => sum + g.gradePoints, 0);
  const gpa = parseFloat((totalPoints / grades.length).toFixed(2));
  await Student.findByIdAndUpdate(studentId, { gpa });
};

// @route   GET /api/grades/:studentId
const getStudentGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.params.studentId })
      .populate('course', 'name code credits')
      .sort({ year: -1, semester: 1 });

    const totalCredits = grades.reduce((sum, g) => sum + (g.course?.credits || 3), 0);
    const totalPoints = grades.reduce((sum, g) => sum + g.gradePoints * (g.course?.credits || 3), 0);
    const gpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;

    res.json({ grades, gpa });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/grades/course/:courseId
const getCourseGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ course: req.params.courseId })
      .populate('student', 'name studentId')
      .sort({ finalScore: -1 });

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadGrades, getStudentGrades, getCourseGrades };
