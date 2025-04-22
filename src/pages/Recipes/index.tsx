import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RecipeList from '../../components/Recipes/RecipeList';
import RecipeDetail from '../../components/Recipes/RecipeDetail';
import RecipeForm from '../../components/Recipes/RecipeForm';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';

const RecipeRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <RecipeList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/:id" 
        element={
          <ProtectedRoute>
            <RecipeDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/new" 
        element={
          <ProtectedRoute>
            <RecipeForm />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/:id/edit" 
        element={
          <ProtectedRoute>
            <RecipeForm />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default RecipeRoutes;
