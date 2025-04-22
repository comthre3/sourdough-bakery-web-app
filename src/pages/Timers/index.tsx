import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TimerList from '../../components/Timers/TimerList';
import TimerForm from '../../components/Timers/TimerForm';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';

const TimerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><TimerList /></ProtectedRoute>} />
      <Route path="/new" element={<ProtectedRoute><TimerForm /></ProtectedRoute>} />
      <Route path="/edit/:id" element={<ProtectedRoute><TimerForm /></ProtectedRoute>} />
      <Route path="/presets/new" element={<ProtectedRoute><TimerForm isPreset={true} /></ProtectedRoute>} />
      <Route path="/presets/edit/:id" element={<ProtectedRoute><TimerForm isPreset={true} /></ProtectedRoute>} />
    </Routes>
  );
};

export default TimerRoutes;
