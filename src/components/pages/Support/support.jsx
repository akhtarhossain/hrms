import React, { useState, useEffect } from 'react';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaEye, FaSearch, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DeleteModal from '../../../shared/common/DeleteConfirmation';
import SupportService from '../../../services/SupportService';
import { Pagination } from '../../../shared/common/Pagination';

const Support = () => {
  const navigate = useNavigate();
  const [supportTickets, setSupportTickets] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState({
    name: '',
    subject: '',
    status: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({ 
    name: '',
    subject: '',
    status: ''
  });

  useEffect(() => {
    fetchSupportTickets();
  }, [currentPage , appliedFilters]);

  const fetchSupportTickets = () => {
    const queryParams = {
      l: pageSize,
      o: (currentPage - 1) * pageSize,
    };
    if (appliedFilters.name) {
      queryParams.name = appliedFilters.name;
    }
    if (appliedFilters.subject) {
      queryParams.subject = appliedFilters.subject;
    }

    SupportService.getSupport(queryParams)
      .then((data) => {
        setSupportTickets(data.list || []);
        setTotalCount(data.count || 0); // ✅ Set total count
      })
      .catch((error) => {
        console.error('Error fetching support tickets:', error);
        toast.error('Failed to load support tickets');
      });
  };


  const handleDeleteClick = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    SupportService.deleteSupport(selectedTicketId)
      .then(() => {
        toast.success("Support ticket deleted successfully");
        setSupportTickets(prev => prev.filter(t => t._id !== selectedTicketId));
      })
      .catch((error) => {
        console.error('Error deleting support ticket:', error);
        toast.error('Failed to delete support ticket');
      })
      .finally(() => {
        setShowDeleteModal(false);
        setSelectedTicketId(null);
        fetchSupportTickets()
      });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <FaCheckCircle className="text-green-500" />;
      case 'Pending':
        return <FaClock className="text-yellow-500" />;
      case 'Rejected':
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
    setAppliedFilters(filters)
    setCurrentPage(1);
  };

  const closeFilter = () => {
    setShowFilter(false);
    setFilters({
      name: '',
      subject: '',
    });
    setAppliedFilters({
    name: '',
    subject: '',
    status: ''
    });
    setCurrentPage(1);
  };


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <>
      <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="py-4 px-2 flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Support Tickets</h2>
          <div className="flex space-x-2">
            <button
              title="filter"
              className="p-2 bg-[#A294F9] rounded shadow cursor-pointer"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FiFilter className="text-white" />
            </button>
            <button
              title="Create Ticket"
              onClick={() => navigate('/support-form')}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  placeholder="Search by subject"
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

        {/* Support List Table */}
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
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">createdAt</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {supportTickets.length > 0 ? (
                supportTickets.map((ticket) => (
                  <tr key={ticket._id} className="border-t hover:bg-[#CDC1FF] text-gray-600">
                    <td className="px-4 py-3">{ticket.name}</td>
                    <td className="px-4 py-3">{ticket.subject}</td>
                    <td className="px-4 py-3">{new Date(ticket.createdAt).toISOString().split('T')[0]}</td>                   
                    <td className="px-4 py-3">  {getStatusIcon(ticket.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          title="Edit"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#A294F9' }}
                          onClick={() => navigate(`/support-form/${ticket._id}`)}
                        >
                          <FaEdit className="text-white" />
                        </button>
                          <button
                          title="View"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#34D399' }}
                          // onClick={() => navigate(`/support-details/${ticket._id}`)}
                        >
                          <FaEye className="text-white" />
                        </button>
                        <button
                          title="Delete"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#F44336' }}
                          onClick={() => handleDeleteClick(ticket._id)}
                        >
                          <FaTrashAlt className="text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">No support tickets found</td>
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

export default Support;