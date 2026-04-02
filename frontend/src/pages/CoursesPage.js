// pages/CoursesPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, BookOpen, Users, Clock } from 'lucide-react';
import { courseService, teacherService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import { LoadingSpinner, EmptyState, ErrorAlert } from '../components/common/LoadingSpinner';

const CourseForm = ({ course, onSave, onClose }) => {
  const isEdit = !!course;
  const [form, setForm] = useState({
    name: course?.name || '', code: course?.code || '',
    description: course?.description || '', teacher: course?.teacher?._id || '',
    department: course?.department || '', credits: course?.credits || 3,
    semester: course?.semester || 'Spring', maxStudents: course?.maxStudents || 30
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    teacherService.getAll({ limit: 100 }).then(r => setTeachers(r.data.teachers)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm(p => ({ ...p, [e.target.name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await courseService.update(course._id, form);
      else         await courseService.create(form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorAlert message={error} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Course Name <span className="text-red-400">*</span></label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required
            placeholder="Introduction to Programming" className="input" />
        </div>
        <div>
          <label className="label">Course Code <span className="text-red-400">*</span></label>
          <input type="text" name="code" value={form.code} onChange={handleChange} required
            placeholder="CS101" className="input uppercase" disabled={isEdit} />
        </div>
        <div>
          <label className="label">Department</label>
          <input type="text" name="department" value={form.department} onChange={handleChange}
            placeholder="Computer Science" className="input" />
        </div>
        <div>
          <label className="label">Assigned Teacher</label>
          <select name="teacher" value={form.teacher} onChange={handleChange} className="input">
            <option value="">— Unassigned —</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.department})</option>)}
          </select>
        </div>
        <div>
          <label className="label">Semester</label>
          <select name="semester" value={form.semester} onChange={handleChange} className="input">
            {['Fall','Spring','Summer'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Credits</label>
          <input type="number" name="credits" value={form.credits} onChange={handleChange} min="1" max="6" className="input" />
        </div>
        <div>
          <label className="label">Max Students</label>
          <input type="number" name="maxStudents" value={form.maxStudents} onChange={handleChange} min="1" max="200" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            placeholder="Brief course description..." className="input resize-none" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (isEdit ? 'Update Course' : 'Create Course')}
        </button>
      </div>
    </form>
  );
};

// Course Card
const CourseCard = ({ course, isAdmin, onEdit, onDelete }) => {
  const semColors = { Fall: 'badge-orange', Spring: 'badge-green', Summer: 'badge-yellow' };
  return (
    <div className="card hover:shadow-soft transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{course.code}</span>
            <span className={`badge ${semColors[course.semester] || 'badge-gray'}`}>{course.semester}</span>
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-2 leading-snug">{course.name}</h3>
          {course.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{course.description}</p>}
        </div>
        {isAdmin && (
          <div className="flex gap-1 ml-3 flex-shrink-0">
            <button onClick={() => onEdit(course)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit2 size={14} /></button>
            <button onClick={() => onDelete(course._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Users size={12} />
          <span>{course.students?.length || 0} / {course.maxStudents} students</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{course.credits} credits</span>
        </div>
      </div>

      {course.teacher && (
        <div className="mt-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {course.teacher.name?.charAt(0)}
          </div>
          <span className="text-xs text-gray-500">{course.teacher.name}</span>
        </div>
      )}

      {/* Enrollment bar */}
      <div className="mt-3">
        <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${Math.min((course.students?.length / course.maxStudents) * 100, 100)}%` }} />
        </div>
      </div>
    </div>
  );
};

const CoursesPage = () => {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';

  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [semester, setSemester] = useState('');
  const [modal, setModal]       = useState({ open: false, course: null });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await courseService.getAll({ search, semester, limit: 50 });
      setCourses(res.data.courses);
    } catch { setError('Failed to load courses'); }
    finally { setLoading(false); }
  }, [search, semester]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try { await courseService.delete(id); fetchCourses(); }
    catch { setError('Failed to delete course'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Courses</h2>
          <p className="text-sm text-gray-500 mt-0.5">{courses.length} courses available</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModal({ open: true, course: null })} className="btn-primary">
            <Plus size={16} /> Add Course
          </button>
        )}
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search courses..." className="input pl-9" />
          </div>
          <select value={semester} onChange={e => setSemester(e.target.value)} className="input max-w-[160px]">
            <option value="">All Semesters</option>
            {['Fall','Spring','Summer'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses found"
          description={search ? 'Try a different search term' : 'Create your first course'}
          action={isAdmin && <button onClick={() => setModal({ open: true, course: null })} className="btn-primary"><Plus size={16} />Add Course</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(c => (
            <CourseCard key={c._id} course={c} isAdmin={isAdmin}
              onEdit={(c) => setModal({ open: true, course: c })}
              onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, course: null })}
        title={modal.course ? 'Edit Course' : 'Create New Course'} size="lg">
        <CourseForm course={modal.course}
          onSave={() => { setModal({ open: false, course: null }); fetchCourses(); }}
          onClose={() => setModal({ open: false, course: null })} />
      </Modal>
    </div>
  );
};

export default CoursesPage;
