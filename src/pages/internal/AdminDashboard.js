import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { notifications, clearNotifications } = useSocket();

  const [activeTab, setActiveTab] = useState('verifications');
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [pendingSkills, setPendingSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'verifications') {
        const res = await api.get('/admin/verifications?status=PENDING');
        setPendingVerifications(res.data.items || []);
      } else {
        const res = await api.get('/admin/skills?status=PENDING');
        setPendingSkills(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const approveVerification = async (id) => {
    await api.post(`/admin/verifications/${id}/approve`);
    loadData();
  };

  const rejectVerification = async (id) => {
    const notes = prompt('Rejection reason:');
    if (!notes) return;
    await api.post(`/admin/verifications/${id}/reject`, { notes });
    loadData();
  };

  const approveSkill = async (submission) => {
    // Block admin from approving agency technician skills
    if (submission.userId?.agencyId) {
      alert('This skill must be approved by the technician’s agency.');
      return;
    }
    await api.post(`/admin/skills/${submission._id}/approve`);
    loadData();
  };

  const rejectSkill = async (submission) => {
    if (submission.userId?.agencyId) {
      alert('This skill must be rejected by the technician’s agency.');
      return;
    }
    const notes = prompt('Rejection reason:');
    if (!notes) return;
    await api.post(`/admin/skills/${submission._id}/reject`, { notes });
    loadData();
  };

  if (user?.role !== 'ADMIN') {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div style={{ background: '#f3f3f3', padding: 10 }}>
          <h3>Notifications</h3>
          <button onClick={clearNotifications}>Clear</button>
          {notifications.map((n, i) => (
            <div key={i}>
              [{new Date(n.timestamp).toLocaleTimeString()}] {n.type}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div>
        <button onClick={() => setActiveTab('verifications')}>
          Pending Verifications
        </button>
        <button onClick={() => setActiveTab('skills')}>
          Pending Skills
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div>Loading…</div>
      ) : activeTab === 'verifications' ? (
        <ul>
          {pendingVerifications.map((v) => (
            <li key={v._id}>
              <div><strong>User:</strong> {v.userId.email}</div>
              <div><strong>Type:</strong> {v.type}</div>

              <button onClick={() => approveVerification(v._id)}>Approve</button>
              <button onClick={() => rejectVerification(v._id)}>Reject</button>
            </li>
          ))}
        </ul>
      ) : (
        <ul>
          {pendingSkills.map((s) => (
            <li key={s._id}>
              <div><strong>Technician:</strong> {s.userId.email}</div>
              <div><strong>Skill:</strong> {s.skillName}</div>

              {s.userId.agencyId && (
                <div style={{ color: 'orange' }}>
                  Managed by Agency (read-only)
                </div>
              )}

              <button onClick={() => approveSkill(s)}>Approve</button>
              <button onClick={() => rejectSkill(s)}>Reject</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDashboard;
