import React, { useState, useEffect } from 'react';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import employeeService from '../../../services/employeeService';
import { FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';
import { Pagination } from '../../../shared/common/Pagination';
import { toast } from 'react-toastify';
import DeleteModal from '../../../shared/common/DeleteConfirmation';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 10 records per page
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState({
    name: '',
    department: '',
    designation: ''
  });
 useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchQuery]);

  // useEffect(() => {
  //   employeeService.getEmployee()
  //     .then((response) => {
  //        setEmployees(response.list);
  //     setTotalCount(response.count);
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching employee data:', error);
  //     });
  // }, []);
  const fetchEmployees = () => {
    employeeService.getEmployee({
      s: searchQuery,
      l: pageSize,
      o: (currentPage - 1) * pageSize, // Calculate offset
    })
    .then((response) => {
      setEmployees(response.list);
      setTotalCount(response.count);
    })
    .catch((error) => {
      console.error('Error fetching employee data:', error);
    });
  };

  const handleDeleteClick = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    employeeService.deleteEmployee(selectedEmployeeId)
      .then(() => {
        toast.success("Employee deleted successfully");
        setEmployees(prev => prev.filter(s => s._id !== selectedEmployeeId));
      })
      .catch((error) => {
        console.error('Error deleting Employee:', error);
        toast.error('Failed to delete Employee record');
      })
      .finally(() => {
        setShowDeleteModal(false);
        setSelectedEmployeeId(null);
      });
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
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <>
      <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="py-4 px-2 flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Employees</h2>
          <div className="flex space-x-2">
            <button
              title="filter"
              className="p-2 bg-[#A294F9] rounded shadow cursor-pointer"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FiFilter className="text-white" />
            </button>
            <button
              title="Create"
              onClick={() => navigate('/employee-form')}
              className="p-2 rounded shadow cursor-pointer"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
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
                <th className="px-4 py-3 text-left">Employee ID</th>
                {/* <th className="px-4 py-3 text-left">Name</th> */}
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
                    <div className="flex items-center gap-3">
                      {employee.profilePicture ? (
                        <img
                          src={employee.profilePicture}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 text-sm italic">
                          No Img
                        </div>
                      )}
                      <span className="text-gray-800">
                        {employee.firstName} {employee.lastName}
                      </span>
                    </div>
                  </td>


                  <td className="px-4 py-3">{employee.employeeId || `EMP${index + 1}`}</td>
                  {/* <td className="px-4 py-3"> </td> */}
                  <td className="px-4 py-3">{employee.email}</td>
                  <td className="px-4 py-3">{employee.department}</td>
                  <td className="px-4 py-3">{employee.designation}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        title="Edit"
                        className="p-2 rounded shadow cursor-pointer"
                        style={{ backgroundColor: '#A294F9' }}
                        onClick={() => navigate(`/employee-form/${employee._id}`)}
                      >
                        <FaEdit className="text-white" />
                      </button>
                      <button
                        title="Delete"
                        className="p-2 rounded shadow cursor-pointer"
                        style={{ backgroundColor: '#F87171' }}
                        onClick={() => handleDeleteClick(employee._id)}
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
              ))}
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

export default Employees;