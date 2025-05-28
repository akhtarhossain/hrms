import React, { useState, useEffect, useCallback } from 'react';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { FaEdit, FaTrashAlt, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DeleteModal from '../../../shared/common/DeleteConfirmation';
import { toast } from 'react-toastify';
import PolicyService from '../../../services/PolicyService'; // Frontend PolicyService

const policyCategories = [
  "All Categories",
  "Work Environment",
  "Development",
  "Security",
  "HR",
  "Compliance",
  "Benefits",
];

const policyStatusOptions = ["", "Draft", "Active", "Archived"];

const PoliciesList = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);

  // Filters state mein se 'q' (General Search) ko remove kar diya gaya hai
  const [filters, setFilters] = useState({
    title: '',
    category: '',
    status: '',
    effectiveDate: '',
  });

  const fetchPolicies = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const paramsToSend = Object.keys(currentFilters).reduce((acc, key) => {
        const value = currentFilters[key];
        if (value !== '' && value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await PolicyService.getPolicies(paramsToSend);

      setPolicies(response.list || []);

    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to load policies.');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies(filters);
  }, [fetchPolicies]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchPolicies(filters);
    setShowFilter(false);
  };

  const resetFilters = () => {
    // initialFilters mein se bhi 'q' ko remove kar diya gaya hai
    const initialFilters = {
      title: '',
      category: '',
      status: '',
      effectiveDate: '',
    };
    setFilters(initialFilters);
    fetchPolicies(initialFilters);
    setShowFilter(false);
  };

  const handleDeleteClick = (id) => {
    setSelectedPolicyId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await PolicyService.deletePolicy(selectedPolicyId);
      toast.success("Policy deleted successfully!");
      fetchPolicies(filters);
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast.error('Failed to delete policy.');
    } finally {
      setShowDeleteModal(false);
      setSelectedPolicyId(null);
    }
  };

  if (loading) {
    return (
      <div className="px-6 pt-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="text-lg text-gray-600">Loading policies...</div>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 pt-6 min-h-screen font-inter" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="py-4 px-2 flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Company Policies</h2>
          <div className="flex space-x-2">
            <button
              className="p-2 bg-[#A294F9] rounded-lg shadow-md hover:bg-[#8e7be0] transition-colors duration-200"
              onClick={() => setShowFilter(!showFilter)}
              title="Filter Policies"
            >
              <FiFilter className="text-white text-xl" />
            </button>
            <button
              className="p-2 bg-[#A294F9] rounded-lg shadow-md hover:bg-[#8e7be0] transition-colors duration-200"
              onClick={() => navigate('/policy-form')}
              title="Add New Policy"
            >
              <FiPlus className="text-white text-xl" />
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className={`bg-white rounded-lg shadow-lg p-6 mb-6 overflow-hidden transition-all duration-400 ease-in-out ${showFilter ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
            <div>
              <label htmlFor="filterTitle" className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                id="filterTitle"
                name="title"
                value={filters.title}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A294F9] focus:outline-none transition-all duration-200"
                placeholder="Search by title"
              />
            </div>
            <div>
              <label htmlFor="filterCategory" className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select
                id="filterCategory"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A294F9] focus:outline-none appearance-none bg-white transition-all duration-200"
              >
                {policyCategories.map((cat, idx) => (
                  <option key={idx} value={cat === "All Categories" ? "" : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filterStatus" className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select
                id="filterStatus"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A294F9] focus:outline-none appearance-none bg-white transition-all duration-200"
              >
                {policyStatusOptions.map((status, idx) => (
                  <option key={idx} value={status}>{status === "" ? "All Statuses" : status}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filterEffectiveDate" className="block text-sm font-semibold text-gray-700 mb-1">Effective Date</label>
              <input
                type="date"
                id="filterEffectiveDate"
                name="effectiveDate"
                value={filters.effectiveDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A294F9] focus:outline-none transition-all duration-200"
              />
            </div>
            {/* 'General Search' input field yahan se remove kar diya gaya hai */}
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={resetFilters}
              className="px-5 py-2 rounded-lg shadow-md text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors duration-200 font-semibold"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-5 py-2 rounded-lg shadow-md text-white flex items-center bg-[#A294F9] hover:bg-[#8e7be0] transition-colors duration-200 font-semibold"
            >
              <FaSearch className="mr-2" />
              Search
            </button>
          </div>
        </div>

        {/* Policies Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm">
              <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
                <tr>
                  <th className="px-4 py-3 text-left rounded-tl-lg">ID</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Last Updated</th>
                  <th className="px-4 py-3 text-left">Effective Date</th>
                  <th className="px-4 py-3 text-left rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.length > 0 ? (
                  policies.map((policy) => (
                    <tr key={policy._id} className="border-t border-gray-200 hover:bg-[#F5EFFF] text-gray-700 transition-colors duration-150">
                      <td className="px-4 py-3">{policy._id}</td>
                      <td className="px-4 py-3">{policy.title}</td>
                      <td className="px-4 py-3">{policy.category}</td>
                      <td className="px-4 py-3">{policy.status}</td>
                      <td className="px-4 py-3">
                        {policy.updatedAt ? new Date(policy.updatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            className="p-2 rounded-lg shadow-md bg-[#A294F9] hover:bg-[#8e7be0] transition-colors duration-200"
                            onClick={() => navigate(`/policy-form/${policy._id}`)}
                            title="Edit Policy"
                          >
                            <FaEdit className="text-white text-lg" />
                          </button>
                          <button
                            className="p-2 rounded-lg shadow-md bg-[#F87171] hover:bg-[#ef4444] transition-colors duration-200"
                            onClick={() => handleDeleteClick(policy._id)}
                            title="Delete Policy"
                          >
                            <FaTrashAlt className="text-white text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500 text-lg">No policies found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

export default PoliciesList;