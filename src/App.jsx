import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/globals.css';

import Login from './components/auth/Login';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import Enrollment from './components/enrollment/Enrollment';
import Payments from './components/payment/Payments';
import Courses from './components/courses/Courses';
import UsersAccess from './components/users/UsersAccess';
import ActivityLogs from './components/shared/ActivityLogs';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Students page (simple list)
import Students from './components/students/Students';

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="enrollment" element={<Enrollment />} />
          <Route path="payments" element={<Payments />} />
          <Route path="courses" element={<Courses />} />
          <Route path="students" element={<Students />} />
          <Route path="activity" element={<ActivityLogs />} />
          <Route
            path="users"
            element={
              <ProtectedRoute superAdminOnly>
                <UsersAccess />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}