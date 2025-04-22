import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SettingsPage from '../../components/Settings/SettingsPage';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';

const SettingsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    </Routes>
  );
};

export default SettingsRoutes;
