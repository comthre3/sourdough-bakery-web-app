import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TaskList from '../../components/Tasks/TaskList';
import TaskDetail from '../../components/Tasks/TaskDetail';
import TaskForm from '../../components/Tasks/TaskForm';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';

const TaskRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
      <Route path="/new" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
      <Route path="/edit/:id" element={<ProtectedRoute><TaskForm /></ProtectedRoute>} />
      <Route path="/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
    </Routes>
  );
};

export default TaskRoutes;
