import React, { useState, useEffect } from 'react';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaEye, FaSearch, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { Pagination } from '../../../shared/common/Pagination';
import { toast } from 'react-toastify';
import DeleteModal from '../../../shared/common/DeleteConfirmation';
import LeaveService from '../../../services/LeaveService';

const requestList = () => {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);


  const [filters, setFilters] = useState({
    employeeName: '',
    subject: '',
    leaveType: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({
    employeeName: '',
    subject: '',
    leaveType: ''
  });

  useEffect(() => {
    fetchLeaveRequests();
  }, [currentPage, appliedFilters]);

  const fetchLeaveRequests = () => {
    LeaveService.getLeaves({
      employeeName: appliedFilters.employeeName,
      leaveType: appliedFilters.leaveType,
      l: pageSize,
      o: (currentPage - 1) * pageSize,
    })
      .then((response) => {
        setLeaveRequests(response.list);
        setTotalCount(response.count);
      })
      .catch((error) => {
        console.error('Error fetching employee data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      await LeaveService.updateLeave(id, status);
      toast.success(`Leave ${status.toLowerCase()} successfully`);
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error updating leave status:', error);
      toast.error(error.response?.data?.message || `Failed to ${status.toLowerCase()} leave`);
    }
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
  };

  const closeFilter = () => {
    setShowFilter(false);
    setFilters({
      employeeName: '',
      subject: '',
      leaveType: '',
    });
    setAppliedFilters({
      employeeName: '',
      subject: '',
      leaveType: '',
    });
    setCurrentPage(1);
  };

  const handleDeleteClick = (leaveId) => {
    setSelectedLeaveId(leaveId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    LeaveService.deleteLeave(selectedLeaveId)
      .then(() => {
        toast.success("Leave request deleted successfully");
        setLeaveRequests(prev => prev.filter(l => l._id !== selectedLeaveId));
      })
      .catch((error) => {
        console.error('Error deleting leave request:', error);
        toast.error('Failed to delete leave request');
      })
      .finally(() => {
        setShowDeleteModal(false);
        setSelectedLeaveId(null);
      });
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <FaCheckCircle className="text-green-500" />;
      case 'Pending':
        return <FaClock className="text-yellow-500" />;
      case 'Rejected':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  return (
    <>
      <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="py-4 px-2 flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Leave Requests</h2>
          <div className="flex space-x-2">
            <button
              title="Filter"
              className="p-2 bg-[#A294F9] rounded shadow cursor-pointer"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FiFilter className="text-white" />
            </button>
            <button
              title="Create Leave Request"
              onClick={() => navigate('/request-form')}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  name="leaveType"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  placeholder="Search by Subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <input
                  type="text"
                  name="leaveType"
                  value={filters.leaveType}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  placeholder="Search by leave type"
                />
              </div>

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

        {/* Leave Requests Table */}
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
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Leave Type</th>
                <th className="px-4 py-3 text-left">Start Date</th>
                <th className="px-4 py-3 text-left">End Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.length > 0 ? (
                leaveRequests.map((leave) => (
                  <tr key={leave._id} className="border-t hover:bg-[#CDC1FF] text-gray-600">
                    <td className="px-4 py-3">{leave.employeeName}</td>
                    <td className="px-4 py-3">{leave.subject}</td>
                    <td className="px-4 py-3">{leave.leaveType}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        const date = new Date(leave.startDate);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = String(date.getFullYear()).slice(-2);
                        return `${day}-${month}-${year}`;
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const date = new Date(leave.endDate);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = String(date.getFullYear()).slice(-2);
                        return `${day}-${month}-${year}`;
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                            leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {leave.status === 'approved' ? (
                            <FaCheckCircle className="mr-1" />
                          ) : leave.status === 'pending' ? (
                            <FaClock className="mr-1" />
                          ) : (
                            <FaTimesCircle className="mr-1" />
                          )}
                          {leave.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          title="Edit"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#A294F9' }}
                          onClick={() => navigate(`/request-form/${leave._id}`)}
                        >
                          <FaEdit className="text-white" />
                        </button>
                        <button
                          title="View"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#34D399' }}
                          onClick={() => navigate(`/leave-details/${leave._id}`)}
                        >
                          <FaEye className="text-white" />
                        </button>
                        <button
                          title="Delete"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#F44336' }}
                          onClick={() => handleDeleteClick(leave._id)}
                        >
                          <FaTrashAlt className="text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-500">No leave requests found</td>
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

export default requestList;
