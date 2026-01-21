import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const PendingPage = () => {
  const { user, refreshUser } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (user.status === 'ACTIVE') {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (!socket) return;

    const handler = async (data) => {
      if (data.status === 'ACTIVE') {
        await refreshUser();
        navigate('/dashboard', { replace: true });
      }
    };

    socket.on('verification:statusChanged', handler);

    return () => {
      socket.off('verification:statusChanged', handler);
    };
  }, [user, socket, refreshUser, navigate]);

  if (!user) return null;

  const getMessage = () => {
    if (user.role === 'BUSINESS') {
      return {
        title: 'Business Verification Pending',
        body:
          'Your business documents are being reviewed by an administrator. ' +
          'You will not be able to create or manage jobs until your account is approved.',
      };
    }

    if (user.role === 'TECHNICIAN') {
      return {
        title: 'Verification Pending',
        body:
          'Your identity documents are under review. ' +
          'You will not be able to accept jobs until your account is approved.',
      };
    }

    return {
      title: 'Account Pending',
      body: 'Your account is awaiting approval.',
    };
  };

  const { title, body } = getMessage();

  return (
    <div>
      <h1>{title}</h1>
      <p>{body}</p>

      {user.status === 'REJECTED' && (
        <div>
          <p style={{ color: 'red' }}>
            Your verification was rejected. Please resubmit your documents.
          </p>
          <button onClick={() => navigate('/verify')}>
            Resubmit Verification
          </button>
        </div>
      )}

      {user.status === 'PENDING_VERIFICATION' && (
        <div>
          <p>Please wait. You will be redirected automatically once approved.</p>
        </div>
      )}
    </div>
  );
};

export default PendingPage;
