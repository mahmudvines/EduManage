import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClassesDetailPage = () => {
  const { user, loading } = useAuth();
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const res = await axios.get(`${apiUrl}/api/classes`, { headers: { Authorization: `Bearer ${token}` } });
        setClasses(res.data.data);
      } catch (err) { console.error(err); }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-blue-600 mb-6"><ArrowLeft size={20} /> Back to Dashboard</button>
      <h1 className="text-3xl font-bold mb-6">All Classes</h1>
      <div className="glass-card overflow-hidden">
        <table className="glass-table"><thead><tr><th>Class Name</th><th>Teacher</th><th>Subject</th><th>Schedule</th><th>Room</th></tr></thead>
        <tbody>{classes.map(c => (<tr key={c._id} className="border-t"><td className="px-6 py-4">{c.className}</td><td>{c.teacherName}</td><td>{c.subject}</td><td>{c.dayOfWeek} {c.startTime}-{c.endTime}</td><td>{c.room}</td></tr>))}</tbody></table>
      </div>
    </div>
  );
};

export default ClassesDetailPage;
