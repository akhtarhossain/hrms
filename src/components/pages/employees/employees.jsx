import React, { useState, useEffect } from 'react';
import { FiDownload, FiUpload, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import employeeService from '../../../services/employeeService';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa'; // Import required icons
import { Pagination } from '../../../shared/common/Pagination';

const Employees = () => {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    employeeService.getEmployee()
      .then((response) => {
        console.log('Employee Data:', response);
        setEmployees(response);
        console.log(employees, "test employess");

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
          // Remove employee from the state after deletion
          setEmployees((prevEmployees) =>
            prevEmployees.filter((employee) => employee.employeeId !== employeeId)
          );
        })
        .catch((error) => {
          console.error('Error deleting employee:', error);
        });
    }
  };
  return (
    <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
      <div className="py-4 px-2 flex justify-between items-center mb-3">
        <h2 className="text-3xl font-bold text-gray-800">Employees</h2>
        <div className="flex space-x-2">
          <button
            title="Import"
            className="p-2 rounded shadow"
            style={{ backgroundColor: '#A294F9' }}
          >
            <FiUpload className="text-white" />
          </button>
          <button
            title="Export"
            className="p-2 rounded shadow"
            style={{ backgroundColor: '#A294F9' }}
          >
            <FiDownload className="text-white" />
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
      <div className="overflow-x-auto p-3 border-radius-100px">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-600 px-2 py-1 rounded-md">
            Showing <span className="font-semibold text-gray-800">1</span> to <span className="font-semibold text-gray-800">10</span> of <span className="font-semibold text-gray-800">50</span> entries
          </div>
          {/* Search (Right) */}
          {/* Pagination Section */}
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
