import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OngoingCoursesPage = () => {
  const { user, loading } = useAuth();
  const [ongoing, setOngoing] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const res = await axios.get(`${apiUrl}/api/classes`, { headers: { Authorization: `Bearer ${token}` } });
        // Filter active classes (status Active or default)
        setOngoing(res.data.data.filter(c => c.status !== 'Completed'));
      } catch (err) { console.error(err); }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-blue-600 mb-6"><ArrowLeft size={20} /> Back to Dashboard</button>
      <h1 className="text-3xl font-bold mb-6">Ongoing Courses</h1>
      <div className="glass-card overflow-hidden">
        <table className="glass-table"><thead><tr><th>Course</th><th>Teacher</th><th>Schedule</th><th>Students Enrolled</th></tr></thead>
        <tbody>{ongoing.map(c => (<tr key={c._id} className="border-t"><td className="px-6 py-4">{c.className}</td><td>{c.teacherName}</td><td>{c.dayOfWeek} {c.startTime}-{c.endTime}</td><td>{c.maxStudents || 0}</td></tr>))}</tbody></table>
      </div>
    </div>
  );
};

export default OngoingCoursesPage;
