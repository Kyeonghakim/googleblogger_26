import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewPost from './pages/NewPost';
import DraftDetail from './pages/DraftDetail';
import Settings from './pages/Settings';
import History from './pages/History';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('auth_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewPost />} />
          <Route path="/drafts/:id" element={<DraftDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
