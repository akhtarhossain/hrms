// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Sidebar from './shared/Sidebar';
// import Employees from './components/pages/employees/employees';
// import EmployeeForm from './components/pages/employees/employeeForm';
// import Dashboard from './components/pages/dashboard/Dashboard';
// import Footer from './shared/Footer';
// import { ToastContainer } from 'react-toastify';
// import EmployeePreview from './components/pages/employees/employeePreview';
// import SalaryList from './components/pages/salary/salary';
// import SalaryForm from './components/pages/salary/salaryForm';
// import Login from './auth/Login';
// import LoginPage from './auth/LoginPage';

// function App() {
//   return (
//     <>
//     <ToastContainer
//     position="bottom-left"
//     hideProgressBar
//     draggable
//     autoClose={3000}
//   />
//     <Router>
//       <div className="flex h-screen">
//         <div className="w-60">
//           <Sidebar />
//         </div>
//         <div className="flex-1 my-13">
//           <Routes>
//             <Route path="/" element={<Dashboard />} />
//             <Route path="/employees" element={<Employees />} />
//             <Route path="/employee-form" element={<EmployeeForm />} />
//             <Route path="/employee-preview/:id" element={<EmployeePreview />} />
//             <Route path="/employee-form/:id?" element={<EmployeeForm />} />
//             <Route path="/salary-form" element={<SalaryForm />} />
//             <Route path="/salary" element={<SalaryList />} />
//             <Route path="/login" element={<LoginPage />} />
//           </Routes>
//         <Footer />
//         </div>
//         <div>
//         </div>
//       </div>
//     </Router>
//     </>
//   );
// }

// export default App;



import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './shared/Sidebar';
import Employees from './components/pages/employees/employees';
import EmployeeForm from './components/pages/employees/employeeForm';
import Dashboard from './components/pages/dashboard/Dashboard';
import Footer from './shared/Footer';
import { ToastContainer } from 'react-toastify';
import EmployeePreview from './components/pages/employees/employeePreview';
import SalaryList from './components/pages/salary/salary';
import SalaryForm from './components/pages/salary/salaryForm';
import LoginPage from './auth/LoginPage';
import SignupPage from './auth/SignupPage';
import ForgotPasswordPage from './auth/ForgotPasswordPage';
import OtpPage from './auth/OtpPage';
import ResetPasswordPage from './auth/ResetPasswordPage';
import ChangePasswordPage from './auth/ChangePasswordPage';
import './App.css';

function AppContent() {
  const location = useLocation();
  const hideLayout = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot' || location.pathname === '/otp' || location.pathname === '/reset';

  return (
    <div className="flex h-screen">
      {!hideLayout && <div className="w-60"><Sidebar /></div>}
      <div className="flex-1 my-13">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employee-form" element={<EmployeeForm />} />
          <Route path="/employee-preview/:id" element={<EmployeePreview />} />
          <Route path="/employee-form/:id?" element={<EmployeeForm />} />
          <Route path="/salary-form" element={<SalaryForm />} />
          <Route path="/salary" element={<SalaryList />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/reset" element={<ResetPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Routes>
        {!hideLayout && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <ToastContainer
        position="bottom-left"
        hideProgressBar
        draggable
        autoClose={3000}
      />
      <Router>
        <AppContent />
      </Router>
    </>
  );
}

export default App;
