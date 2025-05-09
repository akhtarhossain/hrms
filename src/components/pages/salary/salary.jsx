import React, { useState, useEffect } from 'react';
import { FiFilter, FiPlus, FiDollarSign } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaEye, FaSearch } from 'react-icons/fa';
import { Pagination } from '../../../shared/common/Pagination';
import { toast } from 'react-toastify';
import salaryService from '../../../services/SalaryService';
import DeleteModal from '../../../shared/common/DeleteConfirmation';

const SalaryList = () => {
  const navigate = useNavigate();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSalaryId, setSelectedSalaryId] = useState(null);

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
    salaryService.getSalary()
      .then((data) => {
        setSalaries(data || []);
        console.log(data ,  "data"); // Log the actual data
      })
      .catch((error) => {
        console.error('Error fetching salaries:', error);
        toast.error('Failed to load salary records');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  const fetchEmployees = () => {
    employeeService
      .getEmployee()
      .then((response) => setEmployees(response))
      .catch((error) => console.error("Error fetching employees:", error));
      console.log(fetchEmployees);
      
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
    salaryService.getSalary(filters)
      .then((response) => {
        setSalaries(response.data || []);
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
    fetchSalaries(); // Reset to all records
  };

  const handleDeleteClick = (salaryId) => {
    setSelectedSalaryId(salaryId);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    salaryService.deleteSalary(selectedSalaryId)
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
            onClick={() => navigate('/salary-form')}
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
              <th className="px-4 py-3 text-left">Profile</th>
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Basic Salary</th>
              <th className="px-4 py-3 text-left">Allowances</th>
              <th className="px-4 py-3 text-left">Deductions</th>
              <th className="px-4 py-3 text-left">Net Salary</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {salaries.length > 0 ? (
              salaries.map((salary) => (
                <tr key={salary._id} className="border-t hover:bg-[#CDC1FF] text-gray-600">
                  <td className="px-4 py-3">
                    {salary?.employeeId?.profilePicture ? (
                      <img
                        src={salary.employeeId.profilePicture}
                        alt="Profile"
                      className="w-15 h-15 rounded-full object-cover border"
                      />
                    ) : (
                      <span className="text-gray-400 italic">No image</span>
                    )}
                  </td>           
                  <td className="px-4 py-3">{salary.employeeId.firstName} {salary.employeeId.lastName}</td>
                  <td className="px-4 py-3">{new Date(salary.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{salary.salaryAmount.toFixed(2)}</td>
                  <td className="px-4 py-4">
                    {salary.allowances.map((a, index) => (
                      <div key={index}>{a.type}: {a.amount}</div>
                    ))}
                  </td>

                  <td className="px-5 py-4">
                    {salary.deductions.map((d, index) => (
                      <div key={index}>{d.type}: {d.amount}</div>
                    ))}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#A294F9]">{salary.totalSalary.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        title="Edit"
                        className="p-2 rounded shadow cursor-pointer"
                        style={{ backgroundColor: '#A294F9' }}
                        onClick={() => navigate(`/salary-form/${salary._id}`)}
                      >
                        <FaEdit className="text-white" />
                      </button>
                      <button
                        title="Delete"
                        className="p-2 rounded shadow cursor-pointer"
                        style={{ backgroundColor: '#F87171' }}
                        onClick={() => handleDeleteClick(salary._id)}
                      >
                        <FaTrashAlt className="text-white" />
                      </button>
                      <button
                        title="Preview"
                        className="p-2 rounded shadow cursor-pointer"
                        style={{ backgroundColor: '#34D399' }}
                        onClick={() => navigate(`/employee-preview/${employee._id}`)}
                      >
                        <FaEye className="text-white" />
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
          </tbody>
        </table>
      </div>
    </div>
    <DeleteModal
    isOpen={showDeleteModal}
    onClose={() => setShowDeleteModal(false)}
    onConfirm={confirmDelete}
  />
  </>
  );
};

export default SalaryList;