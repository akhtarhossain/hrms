import React, { useState, useEffect } from 'react';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaEye, FaSearch, FaFileDownload } from 'react-icons/fa';
import { Pagination } from '../../../shared/common/Pagination';
import { toast } from 'react-toastify';
import DeleteModal from '../../../shared/common/DeleteConfirmation';
import PayrollService from '../../../services/PayrollService';

const PayrollList = () => {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState(null);
  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = () => {
    setLoading(true);
    PayrollService.getPayroll()
      .then((data) => {
        setPayrolls(data || []);
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

  return (
    <>
      <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="py-4 px-2 flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Payroll Records</h2>
          <div className="flex space-x-2">
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

        {/* Payroll List Table */}
        <div className="overflow-x-auto p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-600 px-2 py-1 rounded-md">
              Showing <span className="font-semibold text-gray-800">{payrolls.length}</span> payroll records
            </div>
            <div className="mt-4 flex justify-end">
              <Pagination />
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
                    <td className="px-4 py-3">{payroll.status}</td>
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
