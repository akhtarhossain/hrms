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
import TransactionTypeForm from '../components/Transaction/transactionForm';
import TransactionList from '../components/Transaction/transactionList';
import EmployeePayslip from '../components/pages/salary/payslip';
import RequestForm from '../components/pages/Request/requestForm';
import RequestList from '../components/pages/Request/requestList';
import SupportForm from '../components/pages/Support/supportForm';
import Support from '../components/pages/Support/support';
import AttendenceEmployees from '../components/pages/attendence/AttendenceEmployees';
import AdminAttendanceView from '../components/pages/attendence/AdminAttendanceView';
import PayrollList from '../components/pages/salary/payrollList';
import PaymentForm from '../components/pages/salary/payments';
import PoliciesList from '../components/pages/policies/PoliciesList';
import PoliciesForm from '../components/pages/policies/PoliciesForm';
import LeavePolicyForm from '../components/pages/Request/leavePolicyForm';
import LeavePolicyList from '../components/pages/Request/leavePolicyList';
import EventsForm from '../components/pages/events/EventsForm';
import EventsList from '../components/pages/events/EventsList';
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
          { path: 'employSalaryform/:id', element: <EmploySalaryForm /> },
          { path: 'change-password', element: <ChangePasswordPage /> },
          { path: 'payslip/:id', element: <EmployeePayslip /> },
          { path: 'payments/:id', element: <PaymentForm /> },
          { path: 'transaction-form', element: <TransactionTypeForm /> },
          { path: 'transaction-form/:id', element: <TransactionTypeForm /> },
          { path: 'transaction', element: <TransactionList /> },
          { path: 'transaction', element: <TransactionList /> },
          { path: 'request-form', element: <RequestForm /> },
          { path: 'request-form/:id', element: <RequestForm /> },
          { path: 'request-list', element: <RequestList /> },
          { path: 'support-form', element: <SupportForm /> },
          { path: 'support-form/:id', element: <SupportForm /> },

          { path: 'support-list', element: <Support/> },
          { path: 'leave-policy-form', element:<LeavePolicyForm/>},
          { path: 'leave-policy-List', element:<LeavePolicyList/>},
          { path: 'leave-policy-form/:id', element:<LeavePolicyForm/>},





          { path: 'attendence', element: <AttendenceEmployees /> },
          { path: 'admin-attendence', element: <AdminAttendanceView /> },
          { path: 'payroll', element: <PayrollList /> },
          { path: 'payroll-form/:monthYear', element: <PayrollForm /> },
          { path: 'policies-list', element: <PoliciesList /> },
          { path: 'policy-form', element: <PoliciesForm /> },
          { path: 'policy-form/:id', element: <PoliciesForm /> },
          { path: 'events-list', element: <EventsList /> },
          { path: 'events-form', element: <EventsForm /> },
          { path: 'events-form/:id', element: <EventsForm /> }
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
