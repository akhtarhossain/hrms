import React, { useState, useEffect } from 'react';
import { FiFilter, FiPlus, FiDollarSign } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaEye, FaSearch } from 'react-icons/fa';
import { Pagination } from '../../shared/common/Pagination';
import { toast } from 'react-toastify';
import DeleteModal from '../../shared/common/DeleteConfirmation';
import TransactionTypeService from '../../services/TransactionTypeService';

const TransactionList = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  const [filters, setFilters] = useState({
    name: '',
    transactionType: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    setLoading(true);
    TransactionTypeService.getTransactionTypes()
      .then((data) => {
        setTransactions(data || []);
      })
      .catch((error) => {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transaction records');
      })
      .finally(() => {
        setLoading(false);
      });
    console.log(transactions);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      // Prepare filters - only include non-empty values
      const apiFilters = {
        ...(filters.name && { name: filters.name }),
        ...(filters.transactionType && { transactionType: filters.transactionType })
      };

      const data = await TransactionTypeService.getTransactionTypes(apiFilters);
      setTransactions(data || []);
    } catch (error) {
      console.error('Filter error:', error);
      toast.error(error.response?.data?.message || 'Filtering failed');
    } finally {
      setLoading(false);
      setShowFilter(false);
    }
  };

  const closeFilter = () => {
    setShowFilter(false);
    setFilters({
      name: '',
      transactionType: ''
    });
    fetchTransactions(); // Reset to all records
  };

  const handleDeleteClick = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    TransactionTypeService.deleteTransactionType(selectedTransactionId)
      .then(() => {
        toast.success("Transaction record deleted successfully");
        setTransactions(prev => prev.filter(t => t._id !== selectedTransactionId));
      })
      .catch((error) => {
        console.error('Error deleting transaction:', error);
        toast.error('Failed to delete transaction record');
      })
      .finally(() => {
        setShowDeleteModal(false);
        setSelectedTransactionId(null);
      });
  };

  if (loading) {
    return (
      <div className="px-6 pt-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="text-lg text-gray-600">Loading transaction records...</div>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="py-4 px-2 flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Transaction Records</h2>
          <div className="flex space-x-2">
            <button
              title="filter"
              className="p-2 bg-[#A294F9] rounded shadow cursor-pointer"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FiFilter className="text-white" />
            </button>
            <button
              title="Create Transaction"
              onClick={() => navigate('/transaction-form')}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <select
                  name="transactionType"
                  value={filters.transactionType}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="allowance">Allowance</option>
                  <option value="deduction">Deduction</option>
                  <option value="bonus">Bonus</option>
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

        {/* Transaction List Table */}
        <div className="overflow-x-auto p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-600 px-2 py-1 rounded-md">
              Showing <span className="font-semibold text-gray-800">{transactions.length}</span> transaction records
            </div>
            <div className="mt-4 flex justify-end">
              <Pagination />
            </div>
          </div>
          <table className="min-w-full table-auto text-sm">
            <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
              <tr>
                <th className="px-4 py-3 text-left">Transaction Type</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(transactions) && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-t hover:bg-[#CDC1FF] text-gray-600">
                    <td className="px-4 py-3 capitalize">{transaction.transactionType}</td>
                    <td className="px-4 py-3">{transaction.name}</td>
                    <td className="px-4 py-3">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          title="Edit"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#A294F9' }}
                          onClick={() => navigate(`/transaction-form/${transaction._id}`)}
                        >
                          <FaEdit className="text-white" />
                        </button>
                        <button
                          title="Delete"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#F87171' }}
                          onClick={() => handleDeleteClick(transaction._id)}
                        >
                          <FaTrashAlt className="text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">No transaction records found</td>
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

export default TransactionList;