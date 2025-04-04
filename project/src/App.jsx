import Home from './components/Home';
import LoginPage from './auth/login';
import RegisterPage from './auth/register';
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/authContexts';

export default function App() {
  return (
    <div className="min-h-screen">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Home />} />
              {/* Add more protected routes here */}
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}