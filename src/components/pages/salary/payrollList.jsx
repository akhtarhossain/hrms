import React, { useState, useEffect } from 'react';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaEye, FaSearch, FaFileDownload, FaPaypal } from 'react-icons/fa';
import { Pagination } from '../../../shared/common/Pagination';
import { toast } from 'react-toastify';
import DeleteModal from '../../../shared/common/DeleteConfirmation';
import PayrollService from '../../../services/PayrollService';
import { MdPayments } from 'react-icons/md';

const PayrollList = () => {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    payrollDate: '',
    status: '',
    year: '',
    month: '',
  });

  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchPayrolls();
  }, [currentPage]);


  const fetchPayrolls = () => {
    setLoading(true);
    const queryParams = {
      l: pageSize,
      o: (currentPage - 1) * pageSize,
    };
    if (filters.payrollDate) {
      // Convert to YYYY-MM-DD format that backend expects
      const date = new Date(filters.payrollDate);
      const formattedDate = date.toISOString().split('T')[0];
      queryParams.payrollDate = formattedDate;
    }

    if (filters.status) {
      queryParams.status = filters.status;
    }
    if (filters.year) {
      queryParams.year = filters.year;
    }
    if (filters.month) {
      queryParams.month = filters.month;
    }
    PayrollService.getPayroll(queryParams)
      .then((response) => {
        setPayrolls(response.list || []);
        setTotalCount(response.count);
      })
      .catch((error) => {
        console.error('Error fetching payrolls:', error);
        toast.error('Failed to load payroll records');
      })
      .finally(() => {
        setLoading(false);
      });

  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getPayrollDate = (month, year) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const handleDeleteClick = (payrollId) => {
    setSelectedPayrollId(payrollId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    PayrollService.deletePayroll(selectedPayrollId)
      .then(() => {
        toast.success("Payroll record deleted successfully");
        setPayrolls(prev => prev.filter(p => p._id !== selectedPayrollId));
      })
      .catch((error) => {
        console.error('Error deleting payroll:', error);
        toast.error('Failed to delete payroll record');
      })
      .finally(() => {
        setShowDeleteModal(false);
        setSelectedPayrollId(null);
      });
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    setSelectedDate({
      month: date.getMonth() + 1,
      year: date.getFullYear()
    });
  };

  const handleCreatePayroll = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[selectedDate.month - 1];
    navigate(`/payroll-form/${monthName}-${selectedDate.year}`);
  };

  if (loading) {
    return (
      <div className="px-6 pt-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="text-lg text-gray-600">Loading payroll records...</div>
      </div>
    );
  }
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === 'payrollDate') {
      // Convert to ISO string for backend validation
      setFilters(prev => ({
        ...prev,
        [name]: value ? new Date(value).toISOString() : ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchPayrolls();
  };

  // Reset filters handler
  const closeFilter = () => {
    setFilters({
      payrollDate: '',
      status: ''
    });
    setCurrentPage(1);
    fetchPayrolls();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <>
      <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="py-4 px-2 flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Payroll Records</h2>
          <div className="flex space-x-2">
            <button
              title="filter"
              className="p-2 bg-[#A294F9] rounded shadow cursor-pointer"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FiFilter className="text-white" />
            </button>
            <button
              title="Create Payroll"
              onClick={() => setShowDateModal(true)}
              className="p-2 rounded shadow cursor-pointer"
              style={{ backgroundColor: '#A294F9' }}
            >
              <FiPlus className="text-white" />
            </button>
          </div>
        </div>
        <div className={`overflow-hidden transition-all duration-400 ease-in-out ${showFilter ? 'max-h-96' : 'max-h-0'}`}>
          <div className="p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              {/* Month Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                >
                  <option value="">Select month</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                >
                  <option value="">Select status</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REVIEWONGOING">REVIEWONGOING</option>
                </select>
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
        {/* Payroll List Table */}
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
                <th className="px-4 py-3 text-left">No. of Employees</th>
                <th className="px-4 py-3 text-left">Payroll Date</th>
                <th className="px-4 py-3 text-left">Creation Date</th>
                <th className="px-4 py-3 text-left">Total Volume</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length > 0 ? (
                payrolls.map((payroll) => (
                  <tr key={payroll._id} className="border-t hover:bg-[#CDC1FF] text-gray-600">
                    <td className="px-4 py-3">{payroll.employees?.length || 0}</td>
                    <td className="px-4 py-3">{getPayrollDate(payroll.month, payroll.year)}</td>
                    <td className="px-4 py-3">{formatDate(payroll.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold">
                      {payroll.summary?.totalSalary?.toFixed(2) || '0.00'}
                    </td>
                    <td className="">
                      <span
                        className={`
                            text-xs font-medium ms-3 px-3.5 py-1.5 rounded-sm border
                            ${payroll.status === 'PAID' ? 'bg-green-100 text-green-800 border-green-400' : ''}
                            ${payroll.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800 border-yellow-400' : ''}
                            ${payroll.status === 'PENDING' ? 'bg-blue-100 text-blue-800 border-blue-400' : ''}
                            ${payroll.status === 'reviewOngoing' ? 'bg-red-100 text-red-800 border-red-400' : ''}
                            dark:bg-gray-700 dark:text-white
                          `}
                      >
                        {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1).toLowerCase()}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          title="Edit"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#A294F9' }}
                          onClick={() => navigate(`/payroll-form/${getPayrollDate(payroll.month, payroll.year).replace(' ', '-')}`)}
                        >
                          <FaEdit className="text-white" />
                        </button>
                        <button
                          title="Payments"
                          style={{ backgroundColor: '#A294F9' }}
                          className="p-2 rounded shadow cursor-pointer"
                          onClick={() => navigate(`/payments/${payroll._id}`)}
                        >
                          <MdPayments className="text-white" />
                        </button>
                        <button
                          title="payrollslip"
                          style={{ backgroundColor: '#A294F9' }}
                          className="p-2 rounded shadow cursor-pointer"
                          onClick={() => navigate(`/payrollslip/${payroll._id}`)}
                        >
                          <FaEye className="text-white" />
                        </button>
                        <button
                          title="Delete"
                          className="p-2 rounded shadow cursor-pointer bg-red-500"
                          onClick={() => handleDeleteClick(payroll._id)}
                        >
                          <FaTrashAlt className="text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500">No payroll records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />

      {/* Date Selection Modal */}
      {showDateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: "20px 30px",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h3 className="text-xl font-semibold mb-4">Select Payroll Date</h3>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Date</label>
              <input
                type="month"
                className="w-full p-2 border rounded"
                onChange={handleDateChange}
                value={`${selectedDate.year}-${selectedDate.month.toString().padStart(2, '0')}`}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border rounded text-gray-700"
                onClick={() => setShowDateModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#A294F9] text-white rounded"
                onClick={handleCreatePayroll}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default PayrollList;