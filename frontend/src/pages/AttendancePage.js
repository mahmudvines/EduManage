// pages/AttendancePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Save, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { attendanceService, courseService, studentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, EmptyState, ErrorAlert, SuccessAlert } from '../components/common/LoadingSpinner';

const STATUS_CONFIG = {
  present: { label: 'Present', icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20 border-green-200' },
  absent:  { label: 'Absent',  icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200' },
  late:    { label: 'Late',    icon: Clock,        color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200' },
  excused: { label: 'Excused', icon: AlertCircle,  color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' }
};

const AttendancePage = () => {
  const { user }  = useAuth();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const [courses, setCourses]       = useState([]);
  const [students, setStudents]     = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({}); // { studentId: status }
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  // Student view
  const [studentAttendance, setStudentAttendance] = useState(null);
  const [studentLoading, setStudentLoading]       = useState(false);

  // Load courses
  useEffect(() => {
    courseService.getAll({ limit: 100 }).then(r => setCourses(r.data.courses)).catch(() => {});
  }, []);

  // Load students for selected course
  useEffect(() => {
    if (!selectedCourse || !isTeacher) return;
    setLoading(true);
    const course = courses.find(c => c._id === selectedCourse);
    if (course?.students?.length > 0) {
      setStudents(course.students);
      const initialAttendance = {};
      course.students.forEach(s => { initialAttendance[s._id] = 'present'; });
      setAttendance(initialAttendance);
    } else {
      setStudents([]);
    }
    setLoading(false);
  }, [selectedCourse, courses, isTeacher]);

  // Load student's own attendance
  useEffect(() => {
    if (!isStudent) return;
    const fetchStudentAttendance = async () => {
      setStudentLoading(true);
      try {
        // Get student profile first, then attendance
        const meRes = await import('../services/api').then(m => m.authService.getMe());
        const studentProfile = meRes.data.profile;
        if (studentProfile) {
          const attRes = await attendanceService.getByStudent(studentProfile._id, { courseId: selectedCourse || undefined });
          setStudentAttendance(attRes.data);
        }
      } catch (err) {
        console.error('Student attendance fetch error:', err);
      } finally {
        setStudentLoading(false);
      }
    };
    fetchStudentAttendance();
  }, [isStudent, selectedCourse]);

  const setStatus = (studentId, status) => {
    setAttendance(p => ({ ...p, [studentId]: status }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s._id] = status; });
    setAttendance(updated);
  };

  const handleSubmit = async () => {
    if (!selectedCourse) return setError('Please select a course');
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const attendanceData = students.map(s => ({ studentId: s._id, status: attendance[s._id] || 'present' }));
      await attendanceService.mark({ courseId: selectedCourse, date, attendanceData });
      setSuccess(`Attendance marked for ${students.length} students`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present' || s === 'late').length;

  // ── Student View ─────────────────────────────────────
  if (isStudent) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Attendance</h2>
          <p className="text-sm text-gray-500 mt-0.5">View your attendance records</p>
        </div>

        {/* Course filter */}
        <div className="card p-4">
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="input max-w-xs">
            <option value="">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
          </select>
        </div>

        {studentLoading ? <LoadingSpinner /> : studentAttendance ? (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Classes', value: studentAttendance.summary?.total, color: 'blue' },
                { label: 'Present', value: studentAttendance.summary?.present, color: 'green' },
                { label: 'Absent', value: studentAttendance.summary?.absent, color: 'red' },
                { label: 'Percentage', value: `${studentAttendance.summary?.percentage}%`, color: studentAttendance.summary?.percentage >= 75 ? 'green' : 'red' }
              ].map(({ label, value, color }) => (
                <div key={label} className="card">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className={`text-2xl font-bold mt-1 text-${color}-600`}>{value ?? '—'}</p>
                </div>
              ))}
            </div>

            {/* Attendance list */}
            <div className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Attendance History</h3>
              </div>
              {studentAttendance.attendance?.length > 0 ? (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {studentAttendance.attendance.slice(0, 20).map(a => {
                    const cfg = STATUS_CONFIG[a.status];
                    const Icon = cfg.icon;
                    return (
                      <div key={a._id} className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Icon size={16} className={cfg.color} />
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{a.course?.name}</p>
                            <p className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>
                        <span className={`badge ${a.status === 'present' ? 'badge-green' : a.status === 'absent' ? 'badge-red' : a.status === 'late' ? 'badge-yellow' : 'badge-blue'} capitalize`}>
                          {a.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={ClipboardList} title="No attendance records" description="Your attendance records will appear here" />
              )}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // ── Teacher / Admin View ──────────────────────────────
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mark Attendance</h2>
        <p className="text-sm text-gray-500 mt-0.5">Record student attendance for your courses</p>
      </div>

      {error   && <ErrorAlert message={error} onDismiss={() => setError('')} />}
      {success && <SuccessAlert message={success} />}

      {/* Controls */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="label">Course <span className="text-red-400">*</span></label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="input">
              <option value="">— Select Course —</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date <span className="text-red-400">*</span></label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} className="input" />
          </div>
        </div>
      </div>

      {selectedCourse && (
        <>
          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">Mark all as:</span>
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button key={status} onClick={() => markAll(status)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${cfg.bg} ${cfg.color}`}>
                  <Icon size={13} /> {cfg.label}
                </button>
              );
            })}
            <div className="ml-auto text-sm text-gray-500">
              Present: <strong className="text-green-600">{presentCount}</strong> / {students.length}
            </div>
          </div>

          {/* Student list */}
          <div className="card p-0 overflow-hidden">
            {loading ? <LoadingSpinner /> : students.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No students enrolled"
                description="Enroll students in this course to mark attendance" />
            ) : (
              <>
                <div className="px-6 py-3 border-b border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                  <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-6">Student</div>
                    <div className="col-span-6">Status</div>
                  </div>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {students.map((s, i) => {
                    const currentStatus = attendance[s._id] || 'present';
                    return (
                      <div key={s._id} className="px-6 py-3 grid grid-cols-12 items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="col-span-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ background: `hsl(${i * 53 % 360}, 50%, 55%)` }}>
                            {s.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.name}</p>
                            <p className="text-xs text-gray-400">{s.studentId}</p>
                          </div>
                        </div>
                        <div className="col-span-6 flex gap-2 flex-wrap">
                          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                            <button key={status} onClick={() => setStatus(s._id, status)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                                ${currentStatus === status ? `${cfg.bg} ${cfg.color} font-semibold` : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                              {cfg.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Save button */}
          {students.length > 0 && (
            <div className="flex justify-end">
              <button onClick={handleSubmit} disabled={saving} className="btn-primary">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          )}
        </>
      )}

      {!selectedCourse && (
        <EmptyState icon={ClipboardList} title="Select a course"
          description="Choose a course above to start marking attendance" />
      )}
    </div>
  );
};

export default AttendancePage;
