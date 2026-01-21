import React from 'react';
import { useAuth } from '../context/AuthContext';

const RoleBasedRoute = ({ technician, business, admin, agency }) => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'TECHNICIAN':
      return technician;
    case 'BUSINESS':
      return business;
    case 'ADMIN':
      return admin;
    case 'AGENCY':
      return agency;
    default:
      return <div>Invalid role</div>;
  }
};

export default RoleBasedRoute;