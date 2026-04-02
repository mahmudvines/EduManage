// pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Save, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { ErrorAlert, SuccessAlert } from '../components/common/LoadingSpinner';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile]     = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    authService.getMe().then(r => setProfile(r.data.profile)).catch(() => {});
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return setError('New passwords do not match');
    if (passwordForm.newPassword.length < 6) return setError('New password must be at least 6 characters');
    setSaving(true);
    try {
      await authService.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const roleColors = { admin: 'bg-purple-100 text-purple-700', teacher: 'bg-blue-100 text-blue-700', student: 'bg-green-100 text-green-700' };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account settings</p>
      </div>

      {/* Profile header card */}
      <div className="card">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0 shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className={`badge mt-2 capitalize ${roleColors[user?.role]}`}>{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 max-w-xs">
        {['profile','security'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {error   && <ErrorAlert message={error} onDismiss={() => setError('')} />}
      {success && <SuccessAlert message={success} />}

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5">Account Information</h3>
          <div className="space-y-4">
            {[
              { icon: User,     label: 'Full Name',   value: user?.name },
              { icon: Mail,     label: 'Email',       value: user?.email },
              { icon: Shield,   label: 'Role',        value: user?.role, className: 'capitalize' },
              { icon: Calendar, label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' }
            ].map(({ icon: Icon, label, value, className }) => (
              <div key={label} className="flex items-center gap-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className={`text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5 ${className || ''}`}>{value || '—'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Role-specific profile data */}
          {profile && (
            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {user?.role === 'student' ? 'Student Details' : user?.role === 'teacher' ? 'Teacher Details' : 'Admin Details'}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {user?.role === 'student' && [
                  ['Student ID', profile.studentId],
                  ['Department', profile.department || '—'],
                  ['Year', profile.year || '—'],
                  ['GPA', profile.gpa?.toFixed(2) || '0.00'],
                  ['Attendance', `${profile.attendancePercentage || 0}%`],
                  ['Enrolled Courses', profile.enrolledCourses?.length || 0]
                ].map(([k, v]) => (
                  <div key={k} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-400">{k}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{v}</p>
                  </div>
                ))}

                {user?.role === 'teacher' && [
                  ['Teacher ID', profile.teacherId],
                  ['Department', profile.department || '—'],
                  ['Specialization', profile.specialization || '—'],
                  ['Qualification', profile.qualification || '—'],
                  ['Courses', profile.assignedCourses?.length || 0]
                ].map(([k, v]) => (
                  <div key={k} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-400">{k}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
            {[
              { name: 'currentPassword', label: 'Current Password', placeholder: 'Your current password' },
              { name: 'newPassword',     label: 'New Password',     placeholder: 'Min 6 characters' },
              { name: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' }
            ].map(f => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" name={f.name} value={passwordForm[f.name]}
                    onChange={e => setPasswordForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                    placeholder={f.placeholder} required className="input pl-9" />
                </div>
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
