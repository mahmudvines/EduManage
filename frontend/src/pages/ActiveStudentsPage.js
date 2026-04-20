import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActiveStudentsPage = () => {
  const { user, loading } = useAuth();
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const res = await axios.get(`${apiUrl}/api/students`, { headers: { Authorization: `Bearer ${token}` } });
        setStudents(res.data.data.filter(s => s.status === 'Active'));
      } catch (err) { console.error(err); }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-blue-600 mb-6"><ArrowLeft size={20} /> Back to Dashboard</button>
      <h1 className="text-3xl font-bold mb-6">Active Students</h1>
      <div className="glass-card overflow-hidden">
        <table className="glass-table"><thead><tr><th>Name</th><th>Roll No</th><th>Class</th><th>Email</th></tr></thead>
        <tbody>{students.map(s => (<tr key={s._id} className="border-t"><td className="px-6 py-4">{s.name}</td><td>{s.rollNumber}</td><td>{s.class}{s.section && `-${s.section}`}</td><td>{s.email}</td></tr>))}</tbody></table>
      </div>
    </div>
  );
};

export default ActiveStudentsPage;
