import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './shared/Sidebar';
import Employees from './components/pages/employees/employees';
import EmployeeForm from './components/pages/employees/employeeForm';
import Dashboard from './components/pages/dashboard/Dashboard';
import Footer from './shared/Footer';
import { ToastContainer } from 'react-toastify';
import EmployeePreview from './components/pages/employees/employeePreview';
import SalaryList from './components/pages/salary/salary';
import SalaryForm from './components/pages/salary/salaryForm';

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
      <div className="flex h-screen">
        <div className="w-60">
          <Sidebar />
        </div>
        <div className="flex-1 my-13">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employee-form" element={<EmployeeForm />} />
            <Route path="/employee-preview/:id" element={<EmployeePreview />} />
            <Route path="/employee-form/:id?" element={<EmployeeForm />} />
            <Route path="/salary-form" element={<SalaryForm />} />
            <Route path="/salary-form/:id" element={<SalaryForm />} />
            <Route path="/salary" element={<SalaryList />} />
          </Routes>
        <Footer />
        </div>
        <div>
        </div>
      </div>
    </Router>
    </>
  );
}

export default App;
