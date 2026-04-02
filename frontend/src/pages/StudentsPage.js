// ============================================================
// pages/StudentsPage.js - Full CRUD for Students
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { studentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import { LoadingSpinner, EmptyState, ErrorAlert } from '../components/common/LoadingSpinner';

// ── Student Form (Add / Edit) ────────────────────────────
const StudentForm = ({ student, onSave, onClose }) => {
  const isEdit = !!student;
  const [form, setForm] = useState({
    name: student?.name || '',
    email: student?.email || '',
    studentId: student?.studentId || '',
    phone: student?.phone || '',
    department: student?.department || '',
    year: student?.year || '1st Year',
    gender: student?.gender || '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await studentService.update(student._id, form);
      else         await studentService.create(form);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name',       label: 'Full Name',    type: 'text',   required: true,  placeholder: 'John Doe' },
    { name: 'email',      label: 'Email',        type: 'email',  required: true,  placeholder: 'student@school.com', disabled: isEdit },
    { name: 'studentId',  label: 'Student ID',   type: 'text',   required: true,  placeholder: 'STU0001', disabled: isEdit },
    { name: 'phone',      label: 'Phone',        type: 'text',   required: false, placeholder: '+1 555-000-0000' },
    { name: 'department', label: 'Department',   type: 'text',   required: false, placeholder: 'Computer Science' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorAlert message={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.name} className={f.name === 'name' ? 'sm:col-span-2' : ''}>
            <label className="label">{f.label} {f.required && <span className="text-red-400">*</span>}</label>
            <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
              required={f.required} placeholder={f.placeholder} disabled={f.disabled}
              className="input disabled:opacity-50 disabled:cursor-not-allowed" />
          </div>
        ))}

        <div>
          <label className="label">Year</label>
          <select name="year" value={form.year} onChange={handleChange} className="input">
            {['1st Year','2nd Year','3rd Year','4th Year'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} className="input">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {!isEdit && (
          <div className="sm:col-span-2">
            <label className="label">Password <span className="text-gray-400 font-normal">(default: Student@123)</span></label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="Leave blank for default" className="input" />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (isEdit ? 'Update Student' : 'Add Student')}
        </button>
      </div>
    </form>
  );
};

// ── Main Page ────────────────────────────────────────────
const StudentsPage = () => {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';

  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [pagination, setPagination] = useState({});
  const [modal, setModal]       = useState({ open: false, student: null });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll({ page, limit: 8, search });
      setStudents(res.data.students);
      setPagination(res.data.pagination);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Debounced search
  useEffect(() => { setPage(1); }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await studentService.delete(id);
      fetchStudents();
    } catch {
      setError('Failed to delete student');
    }
  };

  const openModal  = (student = null) => setModal({ open: true, student });
  const closeModal = () => setModal({ open: false, student: null });
  const handleSave = () => { closeModal(); fetchStudents(); };

  const yearColors = {
    '1st Year': 'badge-blue', '2nd Year': 'badge-green',
    '3rd Year': 'badge-yellow', '4th Year': 'badge-red'
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Students</h2>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.totalStudents || 0} total students</p>
        </div>
        {isAdmin && (
          <button onClick={() => openModal()} className="btn-primary">
            <Plus size={16} /> Add Student
          </button>
        )}
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, ID..."
            className="input pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : students.length === 0 ? (
          <EmptyState icon={Users} title="No students found"
            description={search ? 'Try a different search term' : 'Add your first student to get started'}
            action={isAdmin && <button onClick={() => openModal()} className="btn-primary"><Plus size={16} />Add Student</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['Student','ID','Department','Year','Attendance','GPA', isAdmin && 'Actions'].filter(Boolean).map(h => (
                    <th key={h} className="table-head">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {students.map((s, i) => (
                  <tr key={s._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ background: `hsl(${i * 47 % 360}, 55%, 55%)` }}>
                          {s.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-xs">{s.studentId}</td>
                    <td className="table-cell">{s.department || '—'}</td>
                    <td className="table-cell">
                      <span className={`badge ${yearColors[s.year] || 'badge-gray'}`}>{s.year}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.attendancePercentage >= 75 ? 'bg-green-500' : s.attendancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${s.attendancePercentage}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{s.attendancePercentage}%</span>
                      </div>
                    </td>
                    <td className="table-cell font-semibold">{s.gpa?.toFixed(2) || '0.00'}</td>
                    {isAdmin && (
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openModal(s)}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(s._id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrevPage}
              className="btn-secondary px-3 py-1.5 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage}
              className="btn-secondary px-3 py-1.5 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal.open} onClose={closeModal}
        title={modal.student ? 'Edit Student' : 'Add New Student'} size="lg">
        <StudentForm student={modal.student} onSave={handleSave} onClose={closeModal} />
      </Modal>
    </div>
  );
};

export default StudentsPage;
