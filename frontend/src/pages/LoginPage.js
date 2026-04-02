// ============================================================
// pages/LoginPage.js
// ============================================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [form, setForm]           = useState({ email: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const { login }                 = useAuth();
  const navigate                  = useNavigate();

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  // Quick-fill demo credentials
  const fillDemo = (role) => {
    const creds = {
      admin:   { email: 'admin@school.com',  password: 'Admin@123' },
      teacher: { email: 'sarah@school.com',  password: 'Teacher@123' },
      student: { email: 'alice@student.com', password: 'Student@123' }
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: `${80+i*40}px`, height: `${80+i*40}px`,
                top: `${10+i*15}%`, left: `${5+i*10}%`, opacity: 0.3 - i*0.04 }} />
          ))}
        </div>
        <div className="relative text-white text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">EduManage</h1>
          <p className="text-blue-200 text-lg max-w-xs">
            A complete school management system for modern education.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[['Students', 'Track progress & grades'],['Teachers','Manage classes & attendance'],
              ['Courses','Organize curriculum'],['Analytics','Data-driven insights']].map(([t, d]) => (
              <div key={t} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="font-semibold text-white">{t}</p>
                <p className="text-blue-200 text-sm">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
              <GraduationCap size={28} className="text-white" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-6">Sign in to your account to continue</p>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="label dark:text-gray-300">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" name="email" value={form.email}
                    onChange={handleChange} required placeholder="you@school.com"
                    className="input pl-9"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label dark:text-gray-300">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'} name="password" value={form.password}
                    onChange={handleChange} required placeholder="••••••••"
                    className="input pl-9 pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-2.5 text-base mt-2">
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
            </p>

            {/* Demo credentials */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 text-center mb-3">Quick demo login</p>
              <div className="grid grid-cols-3 gap-2">
                {['admin','teacher','student'].map(role => (
                  <button key={role} onClick={() => fillDemo(role)}
                    className="py-2 px-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium
                               text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800
                               hover:border-blue-300 transition-all capitalize">
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
