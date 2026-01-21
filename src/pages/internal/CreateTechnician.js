import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const CreateTechnician = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user?.role !== 'AGENCY') {
    return <div>Access denied</div>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitTechnician = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/users/create-technician', {
        role: 'TECHNICIAN',
        email: form.email,
        password: form.password, // temporary password
        profile: {
          fullName: form.fullName,
          phone: form.phone,
        },
      });

      navigate('/agency/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create technician');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Technician</h1>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <form onSubmit={submitTechnician}>
        <div>
          <label>Full Name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Temporary Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <button disabled={loading}>
          {loading ? 'Creating…' : 'Create Technician'}
        </button>
      </form>
    </div>
  );
};

export default CreateTechnician;
