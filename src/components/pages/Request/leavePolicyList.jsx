import React, { useState, useEffect } from 'react';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaEye, FaSearch, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DeleteModal from '../../../shared/common/DeleteConfirmation';
import LeavePolicyService from '../../../services/LeavePolicyService';
import { Pagination } from '../../../shared/common/Pagination';

const LeavePolicyList = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [leaveBalances, setLeaveBalances] = useState({});

  const [filters, setFilters] = useState({
    title: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    title: '',
  });

  useEffect(() => {
    fetchPolicies();
  }, [currentPage , appliedFilters]);

  const fetchPolicies = () => {
    const queryParams = {
      l: pageSize,
      o: (currentPage - 1) * pageSize,
      title : appliedFilters.title
    };

    LeavePolicyService.getLeavePolicies(queryParams)
      .then((data) => {
        setPolicies(data.list || []);
        setTotalCount(data.count || 0);
      })
      .catch((error) => {
        console.error('Error fetching leave policies:', error);
        toast.error('Failed to load leave policies');
      });
  };

  const handleDeleteClick = (policyId) => {
    setSelectedPolicyId(policyId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    LeavePolicyService.deleteLeavePolicy(selectedPolicyId)
      .then(() => {
        toast.success("Leave policy deleted successfully");
        setPolicies(prev => prev.filter(p => p._id !== selectedPolicyId));
      })
      .catch((error) => {
        console.error('Error deleting leave policy:', error);
        toast.error('Failed to delete leave policy');
      })
      .finally(() => {
        setShowDeleteModal(false);
        setSelectedPolicyId(null);
      });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <FaCheckCircle className="text-green-500" />;
      case 'Inactive':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
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
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const closeFilter = () => {
    setShowFilter(false)
    setFilters({
      title: '',
    }); 
    setAppliedFilters({
      title: '',
    });
    setCurrentPage(1)
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="py-4 px-2 flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Leave Policies</h2>
          <div className="flex space-x-2">
            <button
              title="Filter"
              className="p-2 bg-[#A294F9] rounded shadow cursor-pointer"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FiFilter className="text-white" />
            </button>
            <button
              title="Create Policy"
              onClick={() => navigate('/leave-policy-form')}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={filters.title}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  placeholder="Search by policy name"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <input
                  type="text"
                  name="leaveType"
                  value={filters.leaveType}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  placeholder="Search by leave type"
                />
              </div> */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                >
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div> */}
            </div>
             <div className="flex justify-end space-x-2">
              <button
                onClick={closeFilter}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow cursor-pointer"
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

        {/* Leave Policy Table */}
        <div className="overflow-x-auto p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-600 px-2 py-1 rounded-md">
              Showing <span className="font-semibold text-gray-800">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-gray-800">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-gray-800">{totalCount}</span> entries
            </div>
            <Pagination
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>

          <table className="min-w-full table-auto text-sm">
            <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
              <tr>
                <th className="px-4 py-3 text-left">Policy Name</th>
                <th className="px-4 py-3 text-left">Annual Leave</th>
                <th className="px-4 py-3 text-left">Sick Leave</th>
                <th className="px-4 py-3 text-left">Maternity Leave</th>
                <th className="px-4 py-3 text-left">Paternity Leave</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.length > 0 ? (
                policies.map(policy => (
                  <tr key={policy._id} className="border-t hover:bg-[#CDC1FF] text-gray-600">
                    <td className="px-4 py-3">{policy.title}</td>
                    <td className="px-4 py-3">{policy.annualLeave}</td>
                    <td className="px-4 py-3">{policy.sickLeave}</td>
                    <td className="px-4 py-3">{policy.maternityLeave}</td>
                    <td className="px-4 py-3">{policy.paternityLeave}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                                      <button
                          title="Edit"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#A294F9' }}
                          onClick={() => navigate(`/leave-policy-form/${policy._id}`)}
                        >
                          <FaEdit className="text-white" />
                        </button>
                        <button
                          title="View"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#34D399' }}
                          // onClick={() => navigate(`/leave-policy-details/${policy._id}`)}
                        >
                          <FaEye className="text-white" />
                        </button>
                        <button
                          title="Delete"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#F44336' }}
                          onClick={() => handleDeleteClick(policy._id)}
                        >
                          <FaTrashAlt className="text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500">No leave policies found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this leave policy?"
      />
    </>
  );
};

export default LeavePolicyList;
