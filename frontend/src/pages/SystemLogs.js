import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const res = await axios.get(`${apiUrl}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data.data.recentLogs || []);
      } catch (err) {
        console.error('Failed to fetch logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading logs...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">System Logs</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Entity</th>
              <th className="p-3 text-left">Performed By</th>
              <th className="p-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-t">
                <td className="p-3">{log.action}</td>
                <td className="p-3">{log.entity}</td>
                <td className="p-3">{log.performedByName || 'System'}</td>
                <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="4" className="p-3 text-center text-gray-500">No logs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemLogs;
