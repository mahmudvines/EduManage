import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SystemLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } });
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div>Loading logs...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">System Logs</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr><th>Time</th><th>Action</th><th>Entity</th><th>User</th><th>Details</th></tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id} className="border-t">
                <td className="p-2 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="p-2">{log.action}</td>
                <td className="p-2">{log.entity}</td>
                <td className="p-2">{log.performedByName}</td>
                <td className="p-2 text-xs">{JSON.stringify(log.changes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemLogsPage;
