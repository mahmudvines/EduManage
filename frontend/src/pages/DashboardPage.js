// ============================================================
// pages/DashboardPage.js - Bento Grid Dashboard
// ============================================================
import React, { useState, useEffect } from 'react';
import { Users, UserCheck, BookOpen, ClipboardList, TrendingUp, Plus, GraduationCap, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

// ── Stat Card ────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, trend, to }) => {
  const colors = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'bg-blue-500',   text: 'text-blue-600' },
    green:  { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'bg-green-500',  text: 'text-green-600' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-500', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'bg-orange-500', text: 'text-orange-600' }
  };
  const c = colors[color] || colors.blue;

  const card = (
    <div className={`card ${c.bg} border-0 hover:shadow-soft transition-all duration-200 hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value ?? '—'}</p>
          {trend && <p className="text-xs text-green-600 mt-1 font-medium">↑ {trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );

  return to ? <Link to={to}>{card}</Link> : card;
};

// ── Attendance Ring ──────────────────────────────────────
const AttendanceRing = ({ percentage }) => {
  const r = 40, circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const color = percentage >= 75 ? '#22c55e' : percentage >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div className="mt-2 text-center">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</p>
        <p className="text-xs text-gray-400">Attendance</p>
      </div>
    </div>
  );
};

// Pie chart colors
const PIE_COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res;
        if (user.role === 'admin')        res = await dashboardService.getAdminStats();
        else if (user.role === 'teacher') res = await dashboardService.getTeacherStats();
        else                              res = await dashboardService.getStudentStats();
        setData(res.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  // ── Admin Dashboard ──────────────────────────────────
  if (user.role === 'admin') {
    const { stats = {}, recentStudents = [], gradeDistribution = [], monthlyEnrollment = [] } = data || {};

    const gradeData = gradeDistribution.map(g => ({ name: g._id, value: g.count }));
    const enrollData = monthlyEnrollment.map(m => ({
      name: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short' }),
      students: m.count
    }));

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Good morning, {user.name.split(' ')[0]} 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">Here's what's happening at your school today.</p>
        </div>

        {/* Bento Grid - Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}       label="Total Students" value={stats.totalStudents} color="blue"   to="/students" />
          <StatCard icon={UserCheck}   label="Total Teachers" value={stats.totalTeachers} color="green"  to="/teachers" />
          <StatCard icon={BookOpen}    label="Total Courses"  value={stats.totalCourses}  color="purple" to="/courses" />
          <StatCard icon={ClipboardList} label="Avg Attendance" value={`${stats.attendancePercentage}%`} color="orange" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Enrollment trend */}
          <div className="card lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" /> Student Enrollment (Last 6 Months)
            </h3>
            {enrollData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={enrollData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="students" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-gray-400 text-sm">No enrollment data yet</div>
            )}
          </div>

          {/* Grade distribution */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-purple-500" /> Grade Distribution
            </h3>
            {gradeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={gradeData} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                      dataKey="value" paddingAngle={3}>
                      {gradeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-1 mt-2">
                  {gradeData.slice(0, 6).map((g, i) => (
                    <div key={g.name} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-gray-500">{g.name} ({g.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-44 flex items-center justify-center text-gray-400 text-sm">No grade data yet</div>
            )}
          </div>
        </div>

        {/* Recent students + Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent students */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Students</h3>
              <Link to="/students" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
            </div>
            {recentStudents.length > 0 ? (
              <div className="space-y-3">
                {recentStudents.map((s, i) => (
                  <div key={s._id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: `hsl(${i * 60}, 60%, 55%)` }}>
                      {s.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.department || 'No dept'} · {s.year}</p>
                    </div>
                    <span className="badge badge-blue text-xs">{s.studentId}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No students yet</p>
            )}
          </div>

          {/* Quick actions */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { to: '/students', icon: Users,     label: 'Add Student',   color: 'blue' },
                { to: '/teachers', icon: UserCheck, label: 'Add Teacher',   color: 'green' },
                { to: '/courses',  icon: BookOpen,  label: 'Add Course',    color: 'purple' },
                { to: '/attendance', icon: ClipboardList, label: 'Mark Attendance', color: 'orange' }
              ].map(({ to, icon: Icon, label, color }) => (
                <Link key={label} to={to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <div className={`w-8 h-8 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}>
                    <Icon size={15} className={`text-${color}-600 dark:text-${color}-400`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  <Plus size={14} className="text-gray-300 ml-auto group-hover:text-blue-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Teacher Dashboard ────────────────────────────────
  if (user.role === 'teacher') {
    const { stats = {}, courses = [] } = data || {};
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Welcome, {user.name.split(' ')[0]} 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your courses and students.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={BookOpen}    label="My Courses"   value={stats.totalCourses}     color="blue" />
          <StatCard icon={Users}       label="My Students"  value={stats.totalStudents}    color="green" />
          <StatCard icon={ClipboardList} label="Attendance" value={`${stats.attendancePercentage}%`} color="orange" />
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Assigned Courses</h3>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courses.map(c => (
                <div key={c._id} className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{c.name}</p>
                  <p className="text-xs text-blue-600 mt-0.5">{c.code}</p>
                  <p className="text-sm text-gray-500 mt-1">{c.students?.length || 0} students enrolled</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No courses assigned yet</p>
          )}
        </div>
      </div>
    );
  }

  // ── Student Dashboard ────────────────────────────────
  const { student, grades = [], stats = {} } = data || {};
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hello, {user.name.split(' ')[0]} 👋</h2>
        <p className="text-sm text-gray-500 mt-0.5">Track your academic progress.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={BookOpen}    label="Enrolled Courses" value={stats.totalCourses}        color="blue" />
        <StatCard icon={ClipboardList} label="Attendance"     value={`${stats.attendancePercentage}%`} color="green" />
        <StatCard icon={GraduationCap} label="GPA"            value={stats.gpa?.toFixed(2)}     color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card flex flex-col items-center justify-center py-6">
          <AttendanceRing percentage={stats.attendancePercentage || 0} />
          <p className="text-sm text-gray-500 mt-3">Overall Attendance</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Grades</h3>
          {grades.length > 0 ? (
            <div className="space-y-3">
              {grades.slice(0, 5).map(g => (
                <div key={g._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{g.course?.name}</p>
                    <p className="text-xs text-gray-400">{g.semester} {g.year}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${
                      g.gradePoints >= 3.5 ? 'badge-green' :
                      g.gradePoints >= 2.5 ? 'badge-blue' :
                      g.gradePoints >= 1.5 ? 'badge-yellow' : 'badge-red'
                    }`}>{g.letterGrade}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{g.finalScore}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No grades yet</p>
          )}
        </div>
      </div>

      {/* Enrolled courses */}
      {student?.enrolledCourses?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">My Courses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {student.enrolledCourses.map((c, i) => (
              <div key={c._id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-colors">
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{c.name}</p>
                <p className="text-xs text-blue-600 mt-0.5 font-mono">{c.code}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
