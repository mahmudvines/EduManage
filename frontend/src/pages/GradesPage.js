// pages/GradesPage.js
import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Save } from 'lucide-react';
import { gradeService, courseService, studentService } from '../services/api';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, EmptyState, ErrorAlert, SuccessAlert } from '../components/common/LoadingSpinner';

const GRADE_COLORS = {
  'A+': 'badge-green', 'A': 'badge-green', 'A-': 'badge-green',
  'B+': 'badge-blue',  'B': 'badge-blue',  'B-': 'badge-blue',
  'C+': 'badge-yellow','C': 'badge-yellow','C-': 'badge-yellow',
  'D':  'badge-red',   'F': 'badge-red',   'N/A': 'badge-gray'
};

// ── Student Grades View ──────────────────────────────────
const StudentGradesView = ({ studentId }) => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    gradeService.getByStudent(studentId)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <LoadingSpinner />;
  if (!data)   return null;

  return (
    <div className="space-y-5">
      {/* GPA banner */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Cumulative GPA</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{data.gpa?.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-gray-500 mt-1">Out of 4.00</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
            <BarChart3 size={28} className="text-blue-600" />
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Grade Report</h3>
        </div>
        {data.grades?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['Course','Code','Final Score','Grade','Points','Semester'].map(h => (
                    <th key={h} className="table-head">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {data.grades.map(g => (
                  <tr key={g._id} className="table-row">
                    <td className="table-cell font-medium text-gray-800 dark:text-gray-200">{g.course?.name}</td>
                    <td className="table-cell font-mono text-xs text-blue-600">{g.course?.code}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${g.finalScore >= 70 ? 'bg-green-500' : g.finalScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${g.finalScore}%` }} />
                        </div>
                        <span className="text-sm">{g.finalScore}%</span>
                      </div>
                    </td>
                    <td className="table-cell"><span className={`badge ${GRADE_COLORS[g.letterGrade] || 'badge-gray'}`}>{g.letterGrade}</span></td>
                    <td className="table-cell font-semibold">{g.gradePoints?.toFixed(1)}</td>
                    <td className="table-cell text-gray-500">{g.semester} {g.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={BarChart3} title="No grades recorded" description="Your grades will appear here once they are uploaded" />
        )}
      </div>
    </div>
  );
};

// ── Upload Grades Form (Teacher/Admin) ───────────────────
const UploadGradesForm = () => {
  const [courses, setCourses]   = useState([]);
  const [courseStudents, setCourseStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [semester, setSemester] = useState('Spring');
  const [year, setYear]         = useState(new Date().getFullYear());
  const [assessments, setAssessments] = useState([
    { name: 'Midterm',   score: '', maxScore: 100, weight: 30 },
    { name: 'Assignment', score: '', maxScore: 100, weight: 20 },
    { name: 'Final Exam', score: '', maxScore: 100, weight: 50 }
  ]);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    courseService.getAll({ limit: 100 }).then(r => setCourses(r.data.courses)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCourse) return setCourseStudents([]);
    const course = courses.find(c => c._id === selectedCourse);
    setCourseStudents(course?.students || []);
    setSelectedStudent('');
  }, [selectedCourse, courses]);

  const updateAssessment = (i, field, val) => {
    setAssessments(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: val } : a));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!selectedCourse || !selectedStudent) return setError('Please select course and student');
    const hasEmptyScore = assessments.some(a => a.score === '');
    if (hasEmptyScore) return setError('Please fill in all scores');
    const totalWeight = assessments.reduce((s, a) => s + Number(a.weight), 0);
    if (totalWeight !== 100) return setError(`Assessment weights must total 100% (currently ${totalWeight}%)`);

    setSaving(true);
    try {
      await gradeService.upload({
        studentId: selectedStudent, courseId: selectedCourse,
        assessments: assessments.map(a => ({ ...a, score: Number(a.score), maxScore: Number(a.maxScore), weight: Number(a.weight) })),
        semester, year: Number(year)
      });
      setSuccess('Grades uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload grades');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {error   && <ErrorAlert message={error} onDismiss={() => setError('')} />}
      {success && <SuccessAlert message={success} />}

      {/* Course & Student selection */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Select Student & Course</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">Course</label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="input">
              <option value="">— Select Course —</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Student</label>
            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="input" disabled={!selectedCourse}>
              <option value="">— Select Student —</option>
              {courseStudents.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Semester</label>
            <select value={semester} onChange={e => setSemester(e.target.value)} className="input">
              {['Fall','Spring','Summer'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)}
              min="2020" max="2030" className="input" />
          </div>
        </div>
      </div>

      {/* Assessment inputs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Assessments</h3>
          <button type="button" onClick={() => setAssessments(p => [...p, { name: 'Assessment', score: '', maxScore: 100, weight: 0 }])}
            className="btn-secondary text-xs px-2 py-1">
            <Plus size={13} /> Add
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Assessment Name','Score','Max Score','Weight (%)','Contribution'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {assessments.map((a, i) => {
                const contribution = a.score !== '' ? ((a.score / a.maxScore) * a.weight).toFixed(1) : '—';
                return (
                  <tr key={i}>
                    <td className="py-2 px-3">
                      <input value={a.name} onChange={e => updateAssessment(i, 'name', e.target.value)} className="input text-sm py-1.5" />
                    </td>
                    <td className="py-2 px-3">
                      <input type="number" value={a.score} onChange={e => updateAssessment(i, 'score', e.target.value)}
                        min="0" max={a.maxScore} placeholder="0" className="input text-sm py-1.5 w-20" />
                    </td>
                    <td className="py-2 px-3">
                      <input type="number" value={a.maxScore} onChange={e => updateAssessment(i, 'maxScore', e.target.value)}
                        min="1" className="input text-sm py-1.5 w-20" />
                    </td>
                    <td className="py-2 px-3">
                      <input type="number" value={a.weight} onChange={e => updateAssessment(i, 'weight', e.target.value)}
                        min="0" max="100" className="input text-sm py-1.5 w-20" />
                    </td>
                    <td className="py-2 px-3 font-mono text-blue-600">{contribution}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                <td className="py-2 px-3 font-semibold">Total</td>
                <td />
                <td />
                <td className="py-2 px-3 font-semibold">{assessments.reduce((s, a) => s + Number(a.weight), 0)}%</td>
                <td className="py-2 px-3 font-semibold text-blue-600">
                  {assessments.some(a => a.score !== '')
                    ? assessments.reduce((s, a) => s + (a.score !== '' ? (a.score / a.maxScore) * a.weight : 0), 0).toFixed(1)
                    : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving || !selectedCourse || !selectedStudent} className="btn-primary">
          {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Upload Grades'}
        </button>
      </div>
    </div>
  );
};

const GradesPage = () => {
  const { user }  = useAuth();
  const isStudent = user?.role === 'student';

  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    if (!isStudent) return;
    authService.getMe().then(r => {
      setStudentId(r.data.profile?._id);
    }).catch(() => {});
  }, [isStudent]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Grades</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {isStudent ? 'View your academic performance' : 'Upload and manage student grades'}
        </p>
      </div>

      {isStudent
        ? <StudentGradesView studentId={studentId} />
        : <UploadGradesForm />
      }
    </div>
  );
};

export default GradesPage;
