import React, { useState, useEffect } from 'react';
import { FiFilter, FiPlus, FiDollarSign } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaEye, FaSearch, FaFileDownload } from 'react-icons/fa';
import { Pagination } from '../../../shared/common/Pagination';
import { toast } from 'react-toastify';
import DeleteModal from '../../../shared/common/DeleteConfirmation';
import EmploySalaryService from '../../../services/EmploySalaryService';
import employeeService from '../../../services/employeeService';
import EmployeeSalaryForm from '../salary/employSalary';

const PayrollForm = () => {
  const navigate = useNavigate();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSalaryId, setSelectedSalaryId] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  const [filters, setFilters] = useState({
    employeeName: '',
    month: '',
    year: ''
  });

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = () => {
    setLoading(true);
    employeeService.getEmployee()
      .then((data) => {
        setSalaries(data || []);
        setSelectedEmployees([]);
        setSelectAll(false);
      })
      .catch((error) => {
        console.error('Error fetching salaries:', error);
        toast.error('Failed to load salary records');
      })
      .finally(() => {
        setLoading(false);
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
    setLoading(true);
    EmploySalaryService.getSalary(filters)
      .then((response) => {
        setSalaries(response.data || []);
        setSelectedEmployees([]);
        setSelectAll(false);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error filtering salaries:', error);
        toast.error('Failed to filter salary records');
        setLoading(false);
      });
    setShowFilter(false);
  };

  const closeFilter = () => {
    setShowFilter(false);
    setFilters({
      employeeName: '',
      month: '',
      year: ''
    });
    fetchSalaries();
  };

  const handleDeleteClick = (salaryId) => {
    setSelectedSalaryId(salaryId);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    EmploySalaryService.deleteSalary(selectedSalaryId)
      .then(() => {
        toast.success("Salary record deleted successfully");
        setSalaries(prev => prev.filter(s => s._id !== selectedSalaryId));
      })
      .catch((error) => {
        console.error('Error deleting salary:', error);
        toast.error('Failed to delete salary record');
      })
      .finally(() => {
        setShowDeleteModal(false);
        setSelectedSalaryId(null);
      });
  };

  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(salaries.map(employee => employee._id));
    }
    setSelectAll(!selectAll);
  };

  const calculateSelectedTotals = () => {
    const selected = salaries.filter(employee => selectedEmployees.includes(employee._id));
    
    const totalAllowance = selected.reduce((sum, employee) => {
      return sum + calculateTotalAllowances(employee);
    }, 0);

    const totalDeduction = selected.reduce((sum, employee) => {
      return sum + calculateTotalDeductions(employee);
    }, 0);

    const totalSalary = selected.reduce((sum, employee) => {
      return sum + calculateTotalSalary(employee);
    }, 0);

    return {
      totalAllowance,
      totalDeduction,
      totalSalary,
      selectedEmployees: selected
    };
  };

  const openEditModal = (employee) => {
    setCurrentEmployee(employee);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setCurrentEmployee(null);
  };

  const handleCreatePayroll = () => {
    if (selectedEmployees.length === 0) {
      toast.warning("Please select at least one employee to create payroll");
      return;
    }

    const payrollData = {
      employees: selectedEmployees.map(empId => {
        const employee = salaries.find(e => e._id === empId);
        return {
          employeeId: empId,
          name: `${employee.firstName} ${employee.lastName}`,
          totalAllowance: calculateTotalAllowances(employee),
          totalDeduction: calculateTotalDeductions(employee),
          totalSalary: calculateTotalSalary(employee)
        };
      }),
      summary: calculateSelectedTotals()
    };

    console.log("Payroll data to be sent:", payrollData);
    toast.success(`Payroll created for ${selectedEmployees.length} employees`);
    setSelectedEmployees([]);
    setSelectAll(false);
  };

  if (loading) {
    return (
      <div className="px-6 pt-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="text-lg text-gray-600">Loading salary records...</div>
      </div>
    );
  }

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
            <button
              title="Create Salary"
              onClick={() => navigate('/employSalaryform')}
              className="p-2 rounded shadow cursor-pointer"
              style={{ backgroundColor: '#A294F9' }}
            >
              <FiPlus className="text-white" />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                >
                  <option value="">All Months</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                >
                  <option value="">All Years</option>
                  {Array.from({ length: 5 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
                  ))}
                </select>
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
              Showing <span className="font-semibold text-gray-800">{salaries.length}</span> salary records
            </div>
            <div className="mt-4 flex justify-end">
              <Pagination />
            </div>
          </div>
          <table className="min-w-full table-auto text-sm">
            <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="form-checkbox h-4 w-4 text-[#A294F9] rounded focus:ring-[#A294F9]"
                  />
                </th>
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
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee._id)}
                        onChange={() => toggleEmployeeSelection(employee._id)}
                        className="form-checkbox h-4 w-4 text-[#A294F9] rounded focus:ring-[#A294F9]"
                      />
                    </td>
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
                          onClick={() => openEditModal(employee)}
                        >
                          <FaEdit className="text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-gray-500">No salary records found</td>
                </tr>
              )}
              
              {/* Summary row for selected employees */}
              {selectedEmployees.length > 0 && (
                <tr className="border-t-2 border-gray-400 font-semibold" style={{ backgroundColor: '#E5D9F2' }}>
                  <td className="px-4 py-3" colSpan="3">Total for {selectedEmployees.length} selected employees</td>
                  <td className="px-4 py-3">{calculateSelectedTotals().totalAllowance.toFixed(2)}</td>
                  <td className="px-4 py-3">{calculateSelectedTotals().totalDeduction.toFixed(2)}</td>
                  <td className="px-4 py-3">{calculateSelectedTotals().totalSalary.toFixed(2)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Create Payroll Button - Added at the bottom of the table */}
          {selectedEmployees.length > 0 && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreatePayroll}
                className="px-6 py-3 rounded-md shadow text-white font-medium flex items-center"
                style={{ backgroundColor: '#A294F9' }}
              >
                <FiDollarSign className="mr-2" />
                Create Payroll for {selectedEmployees.length} Employee(s)
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default PayrollForm;