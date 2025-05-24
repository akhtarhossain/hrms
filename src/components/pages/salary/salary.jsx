import React, { useState, useEffect } from 'react';
import { FiFilter, FiPlus, FiDollarSign } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaEye, FaSearch, FaFileDownload } from 'react-icons/fa';
import { Pagination } from '../../../shared/common/Pagination';
import { toast } from 'react-toastify';
import employeeService from '../../../services/employeeService';

const EmploySalaryList = () => {
  const navigate = useNavigate();
  const [salaries, setSalaries] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 10 records per page

  const [filters, setFilters] = useState({
    employeeName: '',
  });

  useEffect(() => {
    fetchSalaries();
  }, [currentPage]);

  const fetchSalaries = () => {
    employeeService.getEmployee({
      firstName: filters.employeeName,
      l: pageSize,
      o: (currentPage - 1) * pageSize,
    })
      .then((data) => {
        setSalaries(data.list || []);
        setTotalCount(data.count);
      })
      .catch((error) => {
        console.error('Error fetching salaries:', error);
        toast.error('Failed to load salary records');
      })
      .finally(() => {
      });
  };

  const calculateTotalAllowances = (employee) => {
    if (!employee.allowances || employee.allowances.length === 0) return 0;
    return employee.allowances.reduce((total, allowance) => {
      return total + (allowance.newSalary || 0);
    }, 0);
  };

  const calculateTotalDeductions = (employee) => {
    if (!employee.deductions || employee.deductions.length === 0) return 0;
    return employee.deductions.reduce((total, deduction) => {
      return total + (deduction.newSalary || 0);
    }, 0);
  };

  const calculateTotalSalary = (employee) => {
    const totalAllowances = calculateTotalAllowances(employee);
    const totalDeductions = calculateTotalDeductions(employee);
    return totalAllowances - totalDeductions;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const applyFilters = () => {
    setCurrentPage(1);
    fetchSalaries();
  };

  const closeFilter = () => {
    setShowFilter(false);
    setFilters({
      employeeName: '',
    });
    fetchSalaries();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="py-4 px-2 flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Salary Records</h2>
          <div className="flex space-x-2">
            <button
              title="filter"
              className="p-2 bg-[#A294F9] rounded shadow cursor-pointer"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FiFilter className="text-white" />
            </button>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className={`overflow-hidden transition-all duration-400 ease-in-out ${showFilter ? 'max-h-96' : 'max-h-0'}`}>
          <div className="p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <input
                  type="text"
                  name="employeeName"
                  value={filters.employeeName}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  placeholder="Search by name"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeFilter}
                className="px-4 py-2 rounded shadow text-gray-700 border border-gray-300 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 rounded shadow text-white cursor-pointer flex items-center"
                style={{ backgroundColor: '#A294F9' }}
              >
                <FaSearch className="mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Salary List Table */}
        <div className="overflow-x-auto p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-600 px-2 py-1 rounded-md">
              Showing <span className="font-semibold text-gray-800">
                {(currentPage - 1) * pageSize + 1}
              </span> to <span className="font-semibold text-gray-800">
                {Math.min(currentPage * pageSize, totalCount)}
              </span> of <span className="font-semibold text-gray-800">
                {totalCount}
              </span> entries
            </div>
            <div className="mt-4 flex justify-end">
              <Pagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
          <table className="min-w-full table-auto text-sm">
            <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
              <tr>
                <th className="px-4 py-3 text-left">Profile</th>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Total Allowance</th>
                <th className="px-4 py-3 text-left">Total Deduction</th>
                <th className="px-4 py-3 text-left">Total Salary</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.length > 0 ? (
                salaries.map((employee) => (
                  <tr key={employee._id} className="border-t hover:bg-[#CDC1FF] text-gray-600">
                    <td className="px-4 py-3">
                      {employee?.profilePicture ? (
                        <img
                          src={employee.profilePicture}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      ) : (
                        <span className="text-gray-400 italic">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{employee.firstName} {employee.lastName}</td>
                    <td className="px-4 py-3">{calculateTotalAllowances(employee).toFixed(2)}</td>
                    <td className="px-4 py-3">{calculateTotalDeductions(employee).toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold">
                      {calculateTotalSalary(employee).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          title="Edit"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#A294F9' }}
                          onClick={() => navigate(`/employSalaryform/${employee._id}`)}
                        >
                          <FaEdit className="text-white" />
                        </button>
                        <button
                          title="Download Payslip"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#4CAF50' }}
                          onClick={() => navigate(`/payslip/${employee._id}`)}
                        >
                          <FaFileDownload className="text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500">No salary records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default EmploySalaryList;