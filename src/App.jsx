import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './shared/Sidebar';
import Employees from './components/pages/employees/employees';
import EmployeeForm from './components/pages/employees/employeeForm';

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <div className="w-60">
          <Sidebar />
        </div>
        <div className="flex-1 my-9">
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
