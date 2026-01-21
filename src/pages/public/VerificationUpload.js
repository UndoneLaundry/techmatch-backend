import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const VerificationUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [files, setFiles] = useState({
    identity: null,
    businessDocs: null,
    supportingDocs: null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Guard rules
   */
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Agency technicians are auto-verified and should NEVER see this page
    if (user.role === 'TECHNICIAN' && user.agencyId) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Already active users don't need verification
    if (user.status === 'ACTIVE') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleFileChange = (field, file) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  const getVerificationType = () => {
    if (user.role === 'BUSINESS') return 'BUSINESS_VERIFICATION';
    if (user.role === 'TECHNICIAN') return 'TECHNICIAN_VERIFICATION';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const type = getVerificationType();
    if (!type) {
      setError('Invalid verification type');
      return;
    }

    // Validation rules
    if (type === 'TECHNICIAN_VERIFICATION' && !files.identity) {
      setError('Identity document is required');
      return;
    }

    if (type === 'BUSINESS_VERIFICATION' && !files.businessDocs) {
      setError('Business documents are required');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('type', type);

    if (files.identity) formData.append('identity', files.identity);
    if (files.businessDocs) formData.append('businessDocs', files.businessDocs);
    if (files.supportingDocs) formData.append('supportingDocs', files.supportingDocs);

    try {
      await api.post('/verification/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/pending', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Verification upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <h1>Account Verification</h1>

      {user.role === 'TECHNICIAN' && (
        <p>
          Please upload your identity document. Your account will be reviewed by an administrator.
        </p>
      )}

      {user.role === 'BUSINESS' && (
        <p>
          Please upload your business registration documents. Your account must be approved before
          creating jobs.
        </p>
      )}

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {user.role === 'TECHNICIAN' && (
          <div>
            <label>Identity Document (Passport / ID)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange('identity', e.target.files[0])}
              required
            />
          </div>
        )}

        {user.role === 'BUSINESS' && (
          <div>
            <label>Business Registration Documents</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange('businessDocs', e.target.files[0])}
              required
            />
          </div>
        )}

        <div>
          <label>Supporting Documents (Optional)</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange('supportingDocs', e.target.files[0])}
          />
        </div>

        <button type="submit" disabled={uploading}>
          {uploading ? 'Submitting…' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
};

export default VerificationUpload;
