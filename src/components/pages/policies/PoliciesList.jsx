import React, { useState, useEffect, useCallback } from 'react';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { FaEdit, FaTrashAlt, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DeleteModal from '../../../shared/common/DeleteConfirmation';
import { toast } from 'react-toastify';
import PolicyService from '../../../services/PolicyService';
import { Pagination } from '../../../shared/common/Pagination';

const policyCategories = [
    "All Categories", "Work Environment", "Development", "Security", "HR", "Compliance", "Benefits",
];

const policyStatusOptions = ["", "Draft", "Active", "Archived"];

const PoliciesList = () => {
    const navigate = useNavigate();
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPolicyId, setSelectedPolicyId] = useState(null);

    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // 10 records per page, same as TransactionList

    const [filters, setFilters] = useState({
        title: '',
        category: '',
        status: '',
        effectiveDate: '',
    });

    const [appliedFilters, setAppliedFilters] = useState({
        title: '',
        category: '',
        status: '',
        effectiveDate: '',
    });

    // useEffect hook jo currentPage aur appliedFilters change hone par data fetch karega
    useEffect(() => {
        fetchPolicies();
    }, [currentPage, appliedFilters]); // Dependecy array mein appliedFilters aur currentPage shamil kiye gaye hain

    const fetchPolicies = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                title: appliedFilters.title,
                category: appliedFilters.category === "All Categories" ? "" : appliedFilters.category, // "All Categories" ko empty string banaya
                status: appliedFilters.status,
                effectiveDate: appliedFilters.effectiveDate,
                l: pageSize, // Limit
                o: (currentPage - 1) * pageSize, // Offset
            };

            // Filters mein se empty values remove karein, jaisa TransactionList mein tha
            const paramsToSend = Object.keys(params).reduce((acc, key) => {
                const value = params[key];
                if (value !== '' && value !== undefined && value !== null) {
                    acc[key] = value;
                }
                return acc;
            }, {});
            
            const response = await PolicyService.getPolicies(paramsToSend);

            setPolicies(response.list || []);
            setTotalCount(response.count || 0); // Total count API se lenge, jaisa TransactionList mein hai
        } catch (error) {
            console.error('Error fetching policies:', error);
            toast.error('Failed to load policies.');
            setPolicies([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, appliedFilters, pageSize]); // Dependencies for useCallback

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const applyFilters = () => {
        setAppliedFilters(filters);
        setCurrentPage(1); // Filters apply hone par page 1 par set karein
    };

    const closeAndResetFilters = () => {
        const initialFilters = {
            title: '',
            category: '',
            status: '',
            effectiveDate: '',
        };
        setFilters(initialFilters);
        setAppliedFilters(initialFilters); // Applied filters ko bhi reset karein
        setCurrentPage(1); // Filters reset hone par page 1 par set karein
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
            // Delete hone ke baad transactions list ko re-fetch karein
            // TransactionList mein filter function ke andar setTransactions mein filter laga tha,
            // yahan hum poori list re-fetch karenge to maintain consistency.
            fetchPolicies(); 
        } catch (error) {
            console.error('Error deleting policy:', error);
            toast.error('Failed to delete policy.');
        } finally {
            setShowDeleteModal(false);
            setSelectedPolicyId(null);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // `currentPolicies` ko remove kiya hai kyunki pagination server-side ho rahi hai `fetchPolicies` mein
    // Ab policies state mein current page ke policies hi honge
    
    return (
        <>
            <div className="px-6 pt-6 min-h-screen font-inter" style={{ backgroundColor: '#F5EFFF' }}>
                <div className="py-4 px-2 flex justify-between items-center mb-3">
                    <h2 className="text-3xl font-bold text-gray-800">Company Policies</h2>
                    <div className="flex space-x-2">
                        <button
                            className="p-2 bg-[#A294F9] rounded shadow cursor-pointer"
                            onClick={() => setShowFilter(!showFilter)}
                            title="Filter Policies"
                        >
                            <FiFilter className="text-white text-xl" />
                        </button>
                        <button
                            className="p-2 rounded shadow cursor-pointer"
                            onClick={() => navigate('/policy-form')}
                            title="Add New Policy"
                            style={{ backgroundColor: '#A294F9' }}
                        >
                            <FiPlus className="text-white text-xl" />
                        </button>
                    </div>
                </div>

                {/* Filter Section */}
                <div className={`overflow-hidden transition-all duration-400 ease-in-out ${showFilter ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                            <div>
                                <label htmlFor="filterTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    id="filterTitle"
                                    name="title"
                                    value={filters.title}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                                    placeholder="Search by title"
                                />
                            </div>
                            <div>
                                <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    id="filterCategory"
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none appearance-non"
                                >
                                    {policyCategories.map((cat, idx) => (
                                        <option key={idx} value={cat === "All Categories" ? "" : cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    id="filterStatus"
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none appearance-none"
                                >
                                    {policyStatusOptions.map((status, idx) => (
                                        <option key={idx} value={status}>{status === "" ? "All Statuses" : status}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="filterEffectiveDate" className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                                <input
                                    type="date"
                                    id="filterEffectiveDate"
                                    name="effectiveDate"
                                    value={filters.effectiveDate}
                                    onChange={handleFilterChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={closeAndResetFilters}
                                className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white border border-gray-300 cursor-pointer"
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

                {/* Policies Table */}
                <div className="overflow-x-auto p-3">
                    <div className="flex justify-between items-center mb-3">
                        <div className="text-sm text-gray-600 px-2 py-1 rounded-md">
                            Showing <span className="font-semibold text-gray-800">
                                {/* Pagination indexing TransactionList ki tarah */}
                                {policies.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                            </span> to <span className="font-semibold text-gray-800">
                                {Math.min(currentPage * pageSize, totalCount)}
                            </span> of <span className="font-semibold text-gray-800">
                                {totalCount}
                            </span> entries
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Pagination
                                currentPage={currentPage}
                                totalCount={totalCount} // Ab totalCount state se aayega
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                    <table className="min-w-full table-auto text-sm">
                        <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
                            <tr>
                                <th className="px-4 py-3 text-left">Title</th>
                                <th className="px-4 py-3 text-left">Category</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Last Updated</th>
                                <th className="px-4 py-3 text-left">Effective Date</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-6 text-center text-gray-500 text-lg">Loading policies...</td>
                                </tr>
                            ) : (
                                policies.length > 0 ? (
                                    policies.map((policy) => (
                                        <tr key={policy._id} className="border-t hover:bg-[#CDC1FF] text-gray-600">
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
                                                        className="p-2 rounded shadow cursor-pointer"
                                                        style={{ backgroundColor: '#A294F9' }}
                                                        onClick={() => navigate(`/policy-form/${policy._id}`)}
                                                        title="Edit Policy"
                                                    >
                                                        <FaEdit className="text-white text-lg" />
                                                    </button>
                                                    <button
                                                        className="p-2 rounded shadow cursor-pointer"
                                                        style={{ backgroundColor: '#F87171' }}
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
                                        <td colSpan="6" className="px-4 py-6 text-center text-gray-500 text-lg">No policies found.</td>
                                    </tr>
                                )
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

export default PoliciesList;