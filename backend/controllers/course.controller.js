// ============================================================
// controllers/course.controller.js - Course CRUD Operations
// ============================================================

const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// @route   GET /api/courses
const getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const semester = req.query.semester || '';

    const filters = { isActive: true };
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    if (semester) filters.semester = semester;

    const total = await Course.countDocuments(filters);
    const courses = await Course.find(filters)
      .populate('teacher', 'name department')
      .populate('students', 'name studentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      courses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCourses: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/courses/:id
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email department phone')
      .populate('students', 'name studentId email attendancePercentage');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/courses
const createCourse = async (req, res) => {
  try {
    const { name, code, description, teacher, department, credits, semester, year, schedule, maxStudents } = req.body;

    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course with this code already exists' });
    }

    const course = await Course.create({
      name,
      code: code.toUpperCase(),
      description,
      teacher,
      department,
      credits,
      semester,
      year,
      schedule,
      maxStudents
    });

    // If teacher assigned, update teacher's assignedCourses
    if (teacher) {
      await Teacher.findByIdAndUpdate(teacher, {
        $addToSet: { assignedCourses: course._id }
      });
    }

    const populated = await Course.findById(course._id).populate('teacher', 'name department');

    res.status(201).json({
      message: 'Course created successfully',
      course: populated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/courses/:id
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { name, description, teacher, credits, semester, schedule, maxStudents } = req.body;

    // Handle teacher reassignment
    if (teacher && teacher !== String(course.teacher)) {
      // Remove from old teacher
      if (course.teacher) {
        await Teacher.findByIdAndUpdate(course.teacher, {
          $pull: { assignedCourses: course._id }
        });
      }
      // Add to new teacher
      await Teacher.findByIdAndUpdate(teacher, {
        $addToSet: { assignedCourses: course._id }
      });
      course.teacher = teacher;
    }

    if (name) course.name = name;
    if (description) course.description = description;
    if (credits) course.credits = credits;
    if (semester) course.semester = semester;
    if (schedule) course.schedule = schedule;
    if (maxStudents) course.maxStudents = maxStudents;

    await course.save();

    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.isActive = false;
    await course.save();

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/courses/:id/enroll
// @desc    Enroll a student in a course
const enrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    const student = await Student.findById(studentId);

    if (!course || !student) {
      return res.status(404).json({ message: 'Course or Student not found' });
    }

    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }

    if (course.students.length >= course.maxStudents) {
      return res.status(400).json({ message: 'Course is full' });
    }

    course.students.push(studentId);
    await course.save();

    student.enrolledCourses.push(course._id);
    await student.save();

    res.json({ message: 'Student enrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse, enrollStudent };
