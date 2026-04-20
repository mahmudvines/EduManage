import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentsDetailPage = () => {
  const { user, loading } = useAuth();
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, graduated: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const res = await axios.get(`${apiUrl}/api/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data.data;
        setStudents(data);
        setStats({
          total: data.length,
          active: data.filter(s => s.status === 'Active').length,
          inactive: data.filter(s => s.status === 'Inactive').length,
          graduated: data.filter(s => s.status === 'Graduated').length
        });
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <div>Redirecting...</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-blue-600 mb-6">
        <ArrowLeft size={20} /> Back to Dashboard
      </button>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Details</h1>
      <p className="text-gray-500 mb-6">Comprehensive overview of all students</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6"><p className="text-gray-500">Total Students</p><p className="text-3xl font-bold">{stats.total}</p></div>
        <div className="glass-card p-6"><p className="text-gray-500">Active</p><p className="text-3xl font-bold text-green-600">{stats.active}</p></div>
        <div className="glass-card p-6"><p className="text-gray-500">Inactive</p><p className="text-3xl font-bold text-red-600">{stats.inactive}</p></div>
        <div className="glass-card p-6"><p className="text-gray-500">Graduated</p><p className="text-3xl font-bold text-purple-600">{stats.graduated}</p></div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50"><h2 className="text-xl font-semibold">All Students</h2></div>
        <div className="overflow-x-auto">
          <table className="glass-table">
            <thead><tr><th>Name</th><th>Roll No</th><th>Class</th><th>Email</th><th>Status</th></tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} className="border-t border-gray-100"><td className="px-6 py-4">{s.name}</td><td>{s.rollNumber}</td><td>{s.class}{s.section && `-${s.section}`}</td><td>{s.email}</td><td><span className={`badge ${s.status === 'Active' ? 'badge-active' : s.status === 'Graduated' ? 'badge-graduated' : 'badge-inactive'}`}>{s.status}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsDetailPage;
