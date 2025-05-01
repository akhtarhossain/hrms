import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './shared/Sidebar';
import Employees from './components/pages/employees/employees';
import EmployeeForm from './components/pages/employees/employeeForm';

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <div className="w-60 bg-red text-white">
          <Sidebar />
        </div>
        <div className="flex-1 bg-gray-100 py-9 px-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Employees />} />
            <Route path="/employee-form" element={<EmployeeForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
