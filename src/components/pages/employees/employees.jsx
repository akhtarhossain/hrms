import React, { useState, useEffect } from 'react';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import employeeService from '../../../services/employeeService';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';
import { Pagination } from '../../../shared/common/Pagination';
import { toast } from 'react-toastify';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    department: '',
    designation: ''
  });

  

  useEffect(() => {
    employeeService.getEmployee()
      .then((response) => {
        console.log('Employee Data:', response);
        setEmployees(response);
      })
      .catch((error) => {
        console.error('Error fetching employee data:', error);
      });
  }, []);

    const deleteEmployee = (employeeId) => {
      if (window.confirm("Are you sure you want to delete this employee?")) {
        employeeService.deleteEmployee(employeeId)
          .then((response) => {
            console.log("Employee deleted successfully", response);
            toast.success("Employee deleted successfully");
    
            // Use correct property name (_id)
            setEmployees((prevEmployees) =>
              prevEmployees.filter((employee) => employee._id !== employeeId)
            );
          })
          .catch((error) => {
            console.error('Error deleting employee:', error);
            toast.error('Failed to delete employee');
          });
      }
    };
  

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
  };

  const closeFilter = () => {
    setShowFilter(false);
    setFilters({
      name: '',
      department: '',
      designation: ''
    });
  };

  return (
    <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
      <div className="py-4 px-2 flex justify-between items-center mb-3">
        <h2 className="text-3xl font-bold text-gray-800">Employees</h2>
        <div className="flex space-x-2">
          <button
            title="filter"
            className="p-2 bg-[#A294F9] rounded shadow"
            onClick={() => setShowFilter(!showFilter)}
          >
            <FiFilter className="text-white" />
          </button>
          <button
            title="Create"
            onClick={() => navigate('/employee-form')}
            className="p-2 rounded shadow"
            style={{ backgroundColor: '#A294F9' }}
          >
            <FiPlus className="text-white" />
          </button>
        </div>
      </div>

      {/* Filter Dropdown with Transition */}
      <div className={`overflow-hidden transition-all duration-400 ease-in-out ${showFilter ? 'max-h-96' : 'max-h-0'}`}>
        <div className="p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9]"
                placeholder="Search by name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:border-transparent"
                placeholder="Search by department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input
                type="text"
                name="designation"
                value={filters.designation}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:border-transparent"
                placeholder="Search by designation"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={closeFilter}
              className="px-4 py-2 rounded shadow text-gray-700 border border-gray-300 cursor-pointer"
            >
              <div className="flex items-center">
                Close
              </div>
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 rounded shadow text-white cursor-pointer"
              style={{ backgroundColor: '#A294F9' }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto p-3 border-radius-100px">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-600 px-2 py-1 rounded-md">
            Showing <span className="font-semibold text-gray-800">1</span> to <span className="font-semibold text-gray-800">10</span> of <span className="font-semibold text-gray-800">50</span> entries
          </div>
          <div className="mt-4 flex justify-end">
            <Pagination />
          </div>
        </div>
        <table className="min-w-full table-auto text-sm">
          <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
            <tr>
              <th className="px-4 py-3 text-left">Profile</th>
              <th className="px-4 py-3 text-left">Employee ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Designation</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr key={index} className="border-t hover:bg-[#CDC1FF] text-gray-600">
                <td className="px-4 py-3">
                  {employee.profilePicture ? (
                    <img
                      src={employee.profilePicture}
                      alt="Profile"
                      className="w-15 h-15 rounded-full object-cover border"
                    />
                  ) : (
                    <span className="text-gray-400 italic">No image</span>
                  )}
                </td>
                <td className="px-4 py-3">{employee.employeeId || `EMP${index + 1}`}</td>
                <td className="px-4 py-3">{employee.firstName} {employee.lastName} </td>
                <td className="px-4 py-3">{employee.email}</td>
                <td className="px-4 py-3">{employee.department}</td>
                <td className="px-4 py-3">{employee.designation}</td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      title="Edit"
                      className="p-2 rounded shadow"
                      style={{ backgroundColor: '#A294F9' }}
                    >
                      <FaEdit className="text-white" />
                    </button>
                    <button
                      title="Delete"
                      className="p-2 rounded shadow"
                      style={{ backgroundColor: '#F87171' }}
                      onClick={() => deleteEmployee(employee._id)}
                    >
                      <FaTrashAlt className="text-white" />
                    </button>
                    <button
                      title="Preview"
                      className="p-2 rounded shadow"
                      style={{ backgroundColor: '#34D399' }}
                      onClick={() => navigate(`/employee-preview/${employee._id}`)}
                    >
                      <FaEye className="text-white" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employees;