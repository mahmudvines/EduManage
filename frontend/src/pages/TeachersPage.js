// pages/TeachersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { teacherService } from '../services/api';
import Modal from '../components/common/Modal';
import { LoadingSpinner, EmptyState, ErrorAlert } from '../components/common/LoadingSpinner';

const TeacherForm = ({ teacher, onSave, onClose }) => {
  const isEdit = !!teacher;
  const [form, setForm] = useState({
    name: teacher?.name || '', email: teacher?.email || '',
    teacherId: teacher?.teacherId || '', phone: teacher?.phone || '',
    department: teacher?.department || '', specialization: teacher?.specialization || '',
    qualification: teacher?.qualification || '', password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await teacherService.update(teacher._id, form);
      else         await teacherService.create(form);
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
        {[
          { name: 'name',           label: 'Full Name',       type: 'text',  required: true,  placeholder: 'Dr. Jane Smith', span: true },
          { name: 'email',          label: 'Email',           type: 'email', required: true,  placeholder: 'teacher@school.com', disabled: isEdit },
          { name: 'teacherId',      label: 'Teacher ID',      type: 'text',  required: true,  placeholder: 'TCH0001', disabled: isEdit },
          { name: 'phone',          label: 'Phone',           type: 'text',  required: false, placeholder: '+1 555-000-0000' },
          { name: 'department',     label: 'Department',      type: 'text',  required: true,  placeholder: 'Computer Science' },
          { name: 'specialization', label: 'Specialization',  type: 'text',  required: false, placeholder: 'Machine Learning' },
          { name: 'qualification',  label: 'Qualification',   type: 'text',  required: false, placeholder: 'PhD Computer Science' }
        ].map(f => (
          <div key={f.name} className={f.span ? 'sm:col-span-2' : ''}>
            <label className="label">{f.label} {f.required && <span className="text-red-400">*</span>}</label>
            <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
              required={f.required} placeholder={f.placeholder} disabled={f.disabled}
              className="input disabled:opacity-50 disabled:cursor-not-allowed" />
          </div>
        ))}
        {!isEdit && (
          <div className="sm:col-span-2">
            <label className="label">Password <span className="text-gray-400 font-normal">(default: Teacher@123)</span></label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="Leave blank for default" className="input" />
          </div>
        )}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (isEdit ? 'Update Teacher' : 'Add Teacher')}
        </button>
      </div>
    </form>
  );
};

const TeachersPage = () => {
  const [teachers, setTeachers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({});
  const [modal, setModal]         = useState({ open: false, teacher: null });

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await teacherService.getAll({ page, limit: 8, search });
      setTeachers(res.data.teachers);
      setPagination(res.data.pagination);
    } catch { setError('Failed to load teachers'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);
  useEffect(() => { setPage(1); }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try { await teacherService.delete(id); fetchTeachers(); }
    catch { setError('Failed to delete teacher'); }
  };

  const deptColors = ['badge-blue','badge-green','badge-purple','badge-yellow','badge-red'];
  const deptMap = {};
  let colorIdx = 0;
  const getDeptColor = (dept) => {
    if (!deptMap[dept]) deptMap[dept] = deptColors[colorIdx++ % deptColors.length];
    return deptMap[dept];
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Teachers</h2>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.totalTeachers || 0} total teachers</p>
        </div>
        <button onClick={() => setModal({ open: true, teacher: null })} className="btn-primary">
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, dept, ID..." className="input pl-9" />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <LoadingSpinner /> : teachers.length === 0 ? (
          <EmptyState icon={UserCheck} title="No teachers found"
            description={search ? 'Try a different search term' : 'Add your first teacher'}
            action={<button onClick={() => setModal({ open: true, teacher: null })} className="btn-primary"><Plus size={16} />Add Teacher</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['Teacher','ID','Department','Specialization','Courses','Actions'].map(h => (
                    <th key={h} className="table-head">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {teachers.map((t, i) => (
                  <tr key={t._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                          style={{ background: `hsl(${i * 73 % 360}, 50%, 55%)` }}>
                          {t.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-xs">{t.teacherId}</td>
                    <td className="table-cell">
                      <span className={`badge ${getDeptColor(t.department)}`}>{t.department}</span>
                    </td>
                    <td className="table-cell text-gray-500">{t.specialization || '—'}</td>
                    <td className="table-cell">
                      <span className="badge badge-gray">{t.assignedCourses?.length || 0} courses</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ open: true, teacher: t })}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(t._id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">Page {pagination.currentPage} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrevPage} className="btn-secondary px-3 py-1.5 disabled:opacity-40"><ChevronLeft size={16} /></button>
            <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage} className="btn-secondary px-3 py-1.5 disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, teacher: null })}
        title={modal.teacher ? 'Edit Teacher' : 'Add New Teacher'} size="lg">
        <TeacherForm teacher={modal.teacher}
          onSave={() => { setModal({ open: false, teacher: null }); fetchTeachers(); }}
          onClose={() => setModal({ open: false, teacher: null })} />
      </Modal>
    </div>
  );
};

export default TeachersPage;
