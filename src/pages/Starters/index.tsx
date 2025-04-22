import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StarterList from '../../components/Starters/StarterList';
import StarterForm from '../../components/Starters/StarterForm';
import StarterDetail from '../../components/Starters/StarterDetail';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';

const StarterRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><StarterList /></ProtectedRoute>} />
      <Route path="/new" element={<ProtectedRoute><StarterForm /></ProtectedRoute>} />
      <Route path="/edit/:id" element={<ProtectedRoute><StarterForm /></ProtectedRoute>} />
      <Route path="/detail/:id" element={<ProtectedRoute><StarterDetail /></ProtectedRoute>} />
    </Routes>
  );
};

export default StarterRoutes;
