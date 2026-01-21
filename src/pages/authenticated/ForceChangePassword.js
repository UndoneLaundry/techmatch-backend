import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ForceChangePassword = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user || user.role !== 'TECHNICIAN' || !user.agencyId) {
    return <div>Access denied</div>;
  }

  const submit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/change-password', { password });

      // Mark password as changed (frontend flag)
      localStorage.setItem('passwordChanged', 'true');

      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Change Your Password</h1>
      <p>
        This is your first login. You must change your temporary password
        before continuing.
      </p>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <form onSubmit={submit}>
        <div>
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        <button disabled={loading}>
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ForceChangePassword;
