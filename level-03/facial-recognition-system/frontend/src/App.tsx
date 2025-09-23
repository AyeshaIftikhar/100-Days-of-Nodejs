import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UserRegistration from './pages/UserRegistration';
import FaceRecognition from './pages/FaceRecognition';
import AttendanceTracker from './pages/AttendanceTracker';
import UserManagement from './pages/UserManagement';
import AttendanceReports from './pages/AttendanceReports';
import './index.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/recognition" element={<FaceRecognition />} />
          <Route path="/attendance" element={<AttendanceTracker />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/reports" element={<AttendanceReports />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
