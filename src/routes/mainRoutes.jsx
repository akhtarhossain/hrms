import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

// Synchronously imported components
import Sidebar from '../shared/Sidebar';
import Dashboard from '../components/pages/dashboard/Dashboard';
import Employees from '../components/pages/employees/employees';
import EmployeeForm from '../components/pages/employees/employeeForm';
import EmployeePreview from '../components/pages/employees/employeePreview';
import SalaryList from '../components/pages/salary/salary';
import EmploySalaryForm from '../components/pages/salary/employSalary';
import LoginPage from '../auth/LoginPage';
import SignupPage from '../auth/SignupPage';
import ForgotPasswordPage from '../auth/ForgotPasswordPage';
import OtpPage from '../auth/OtpPage';
import ResetPasswordPage from '../auth/ResetPasswordPage';
import ChangePasswordPage from '../auth/ChangePasswordPage';
import PayslipList from '../components/pages/salary/payslip';
import PayrollForm from '../components/pages/salary/payrollForm';
// import PageNotFound from '../components/pages/PageNotFound';

// Authentication check
const isAuthenticated = () => !!localStorage.getItem('FCCE');

// Protected route wrapper
const ProtectedRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

// Public route wrapper
const PublicRoute = () => {
  return isAuthenticated() ? <Navigate to="/" replace /> : <Outlet />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Sidebar/>,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'employees', element: <Employees /> },
          { path: 'employee-form', element: <EmployeeForm /> },
          { path: 'employee-form/:id', element: <EmployeeForm /> },
          { path: 'employee-preview/:id', element: <EmployeePreview /> },
          { path: 'salary', element: <SalaryList /> },         
          { path: 'employSalaryform', element: <EmploySalaryForm /> },
          { path: 'change-password', element: <ChangePasswordPage /> },
          { path: 'payslip', element: <PayslipList /> },
          { path: 'payroll-form', element: <PayrollForm /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <PublicRoute />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'forgot', element: <ForgotPasswordPage /> },
      { path: 'otp', element: <OtpPage /> },
      { path: 'reset', element: <ResetPasswordPage /> },
    ],
  },

]);

export default router;
