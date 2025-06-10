import React, { useState, useEffect } from 'react';
import { FiPlus, FiList, FiCalendar, FiUser, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import employeeService from '../../../services/employeeService';
import LeaveService from '../../../services/LeaveService';
import SessionService from '../../../services/SessionService';
import LeavePolicyService from '../../../services/LeavePolicyService';

const LeaveRequestForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [allEmployees, setAllEmployees] = useState([]);
    const [employeeData, setEmployeeData] = useState(null);
    const [files, setFiles] = useState([]);
    const [leavePoliciesData, setLeavePoliciesData] = useState([]);
    const [currentEmployeeLeavePolicy, setCurrentEmployeeLeavePolicy] = useState(null);
    const [leaveBalances, setLeaveBalances] = useState({});
    const [employeeLeaves, setEmployeeLeaves] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        employeeId: '',
        employeeName: '',
        subject: '',
        status: '',
        leaveType: '',
        startDate: '',
        endDate: '',
        leaveReason: '',
    });

    const GetUser = () => {
        return SessionService.getLoggedIn();
    };

    const calculateLeaveDays = (startDate, endDate= false) => {        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Calculate difference in days (inclusive of both dates)
        const timeDiff = end - start;
        const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
        
        return dayDiff;
    };

    const calculateLeaveBalances = (employeeId, policy, leaves) => {
        if (!policy || !employeeId) return {};
        
        const currentYear = new Date().getFullYear();
        const balances = {};
        
        // Filter approved leaves for this employee in current year
        const employeeLeavesThisYear = leaves.filter(leave => 
            leave.employeeId === employeeId && 
            new Date(leave.startDate).getFullYear() === currentYear &&
            leave.status === 'approved'
        );
        
        // Initialize used leaves counters from policy
        const usedLeaves = {};
        Object.keys(policy).forEach(key => {
            if (key.endsWith('Leave') && policy[key] !== undefined) {
                const leaveType = key.replace('Leave', '');
                usedLeaves[leaveType] = 0;
            }
        });
        
        // Calculate used leaves for each type
        employeeLeavesThisYear.forEach(leave => {
            if (leave.leaveType in usedLeaves) {
                const days = calculateLeaveDays(leave.startDate, leave.endDate,);
                usedLeaves[leave.leaveType] += days;
            }
        });
        
        // Calculate remaining balances based on policy
        Object.keys(policy).forEach(key => {
            if (key.endsWith('Leave') && policy[key] !== undefined) {
                const leaveType = key.replace('Leave', '');
                balances[leaveType] = Math.max(0, policy[key] - (usedLeaves[leaveType] || 0));
            }
        });
        
        return balances;
    };

    useEffect(() => {
        let isMounted = true;

        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch all required data in parallel
                const [policiesRes, employeesRes, leavesRes] = await Promise.all([
                    LeavePolicyService.getLeavePolicies(),
                    employeeService.getEmployee(),
                    LeaveService.getLeaves()
                ]);

                if (!isMounted) return;

                // Process policies
                const policies = policiesRes.list || policiesRes;
                setLeavePoliciesData(Array.isArray(policies) ? policies : [policies]);

                // Process employees
                const employees = employeesRes.list || employeesRes;
                setAllEmployees(Array.isArray(employees) ? employees : [employees]);

                // Process leaves
                const leaves = leavesRes.list || leavesRes;
                setEmployeeLeaves(Array.isArray(leaves) ? leaves : [leaves]);

                const formatDateForInput = (dateString) => {
                    if (!dateString) return '';
                    const date = new Date(dateString);
                    return date.toISOString().split('T')[0];
                };

                if (id) {
                    // Editing existing leave
                    const leaveResponse = await LeaveService.getLeaveById(id);
                    if (!isMounted) return;

                    const data = leaveResponse.data || leaveResponse;
                    const newFormData = {
                        employeeId: data.employeeId,
                        employeeName: data.employeeName,
                        subject: data.subject,
                        status: data.status,
                        leaveType: data.leaveType,
                        startDate: formatDateForInput(data.startDate),
                        endDate: formatDateForInput(data.endDate),
                        leaveReason: data.leaveReason,
                    };
                    setFormData(newFormData);
                    
                    // Find employee and policy
                    const employee = Array.isArray(employees) ? 
                        employees.find(emp => emp._id === data.employeeId) : 
                        (employees._id === data.employeeId ? employees : null);
                        
                    if (employee?.leavePolicy) {
                        const policy = policies.find(lp => lp._id === employee.leavePolicy);
                        if (policy) {
                            setCurrentEmployeeLeavePolicy(policy);
                            const balances = calculateLeaveBalances(
                                data.employeeId, 
                                policy, 
                                leaves
                            );
                            setLeaveBalances(balances);
                        }
                    }
                } else {
                    // Creating new leave
                    const user = GetUser();
                    if (user?.data) {
                        const { _id, firstName, lastName, leavePolicy } = user.data;
                        const newFormData = {
                            employeeId: _id,
                            employeeName: `${firstName} ${lastName}`,
                            subject: '',
                            status: 'pending',
                            leaveType: '',
                            startDate: '',
                            endDate: '',
                            leaveReason: '',
                        };
                        setFormData(newFormData);
                        
                        // Find policy for logged-in user
                        const policy = policies.find(lp => lp._id === leavePolicy);
                        if (policy) {
                            setCurrentEmployeeLeavePolicy(policy);
                            const balances = calculateLeaveBalances(
                                _id, 
                                policy, 
                                leaves
                            );
                            setLeaveBalances(balances);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load required data');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchInitialData();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmployeeSelect = async (e) => {
        const selectedId = e.target.value;
        const selectedEmployee = allEmployees.find(emp => emp._id === selectedId);

        if (!selectedEmployee) return;

        const newFormData = {
            ...formData,
            employeeId: selectedId,
            employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
            leaveType: ''
        };
        setFormData(newFormData);

        // Find and set the leave policy for the selected employee
        if (selectedEmployee.leavePolicy) {
            const policy = leavePoliciesData.find(lp => lp._id === selectedEmployee.leavePolicy);
            if (policy) {
                setCurrentEmployeeLeavePolicy(policy);
                const balances = calculateLeaveBalances(
                    selectedId, 
                    policy, 
                    employeeLeaves
                );
                setLeaveBalances(balances);
            }
        } else {
            setCurrentEmployeeLeavePolicy(null);
            setLeaveBalances({});
        }
    };

    const checkLeaveOverlap = () => {
        const newStart = new Date(formData.startDate);
        const newEnd = new Date(formData.endDate);
        
        return employeeLeaves.some(leave => {
            if (leave.status !== 'approved') return false;
            if (leave._id === id) return false; // Skip current leave when editing
            
            const existingStart = new Date(leave.startDate);
            const existingEnd = new Date(leave.endDate);
            
            return (newStart <= existingEnd && newEnd >= existingStart);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.startDate || !formData.endDate || !formData.leaveType) {
            toast.error('Please fill all required fields');
            return;
        }
        
        // Validate dates
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            toast.error('End date cannot be before start date');
            return;
        }
        
        // Calculate requested days
        const requestedDays = calculateLeaveDays(formData.startDate, formData.endDate);
        
        // Check if leave type exists in policy
        if (!currentEmployeeLeavePolicy || 
            currentEmployeeLeavePolicy[`${formData.leaveType}Leave`] === undefined) {
            toast.error('Selected leave type is not available in your policy');
            return;
        }
        
        // Check balance
        if (requestedDays > leaveBalances[formData.leaveType]) {
            toast.error(`Not enough ${formData.leaveType} leave balance! Available: ${leaveBalances[formData.leaveType]} days`);
            return;
        }
        
        // Check for overlapping leave requests
        if (checkLeaveOverlap()) {
            toast.error('You already have an approved leave during this period');
            return;
        }
        
        // Proceed with submission
        setIsSubmitting(true);
        try {
            const dataToSubmit = {
                ...formData,
                requestedDays
            };
            
            if (id) {
                await LeaveService.updateLeave(id, dataToSubmit);
                toast.success('Leave request updated successfully!');
            } else {
                await LeaveService.createLeave(dataToSubmit);
                toast.success('Leave request submitted successfully!');
            }
            navigate('/request-list');
        } catch (error) {
            console.error('Submission error:', error);
            toast.error(`Error ${id ? 'updating' : 'submitting'} leave request`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getLeaveBalanceText = (type) => {
        if (!currentEmployeeLeavePolicy || leaveBalances[type] === undefined) {
            return '';
        }
        
        const policyLimit = currentEmployeeLeavePolicy[`${type}Leave`];
        const remaining = leaveBalances[type];
        const used = policyLimit - remaining;
        
        return ` (${used}/${policyLimit})`;
    };

    if (isLoading) {
        return (
            <div className="p-6 bg-[#F5EFFF] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading leave request form...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#F5EFFF] min-h-screen">
            <div className="py-4 px-2 flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                    {id ? 'Edit Leave Request' : 'Create Leave Request'}
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => navigate('/request-list')}
                        title="List"
                        className="p-2 bg-[#A294F9] rounded shadow"
                    >
                        <FiList className="text-white" />
                    </button>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="p-8 w-full max-w-8xl ">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                                <select
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleEmployeeSelect}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A294F9] focus:border-[#A294F9] focus:outline-none"
                                    required
                                    disabled={!!id}
                                >
                                    <option value="">Select an employee</option>
                                    {allEmployees.map(employee => (
                                        <option key={employee._id} value={employee._id}>
                                            {employee.firstName} {employee.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A294F9] focus:border-[#A294F9] focus:outline-none"
                                    required
                                    placeholder="Leave subject"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                                    <select
                                        name="leaveType"
                                        value={formData.leaveType}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A294F9] focus:border-[#A294F9] focus:outline-none"
                                        required
                                    >
                                        <option value="">Select Leave Type</option>
                                        {currentEmployeeLeavePolicy && (
                                            <>
                                                {currentEmployeeLeavePolicy.sickLeave !== undefined && (
                                                    <option value="sick">
                                                        Sick Leave{getLeaveBalanceText('sick')}
                                                    </option>
                                                )}
                                                {currentEmployeeLeavePolicy.annualLeave !== undefined && (
                                                    <option value="annual">
                                                        Annual Leave{getLeaveBalanceText('annual')}
                                                    </option>
                                                )}
                                                {currentEmployeeLeavePolicy.maternityLeave !== undefined && (
                                                    <option value="maternity">
                                                        Maternity Leave{getLeaveBalanceText('maternity')}
                                                    </option>
                                                )}
                                                {currentEmployeeLeavePolicy.paternityLeave !== undefined && (
                                                    <option value="paternity">
                                                        Paternity Leave{getLeaveBalanceText('paternity')}
                                                    </option>
                                                )}
                                            </>
                                        )}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiCalendar className="text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="w-full pl-8 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A294F9] focus:border-[#A294F9] focus:outline-none"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiCalendar className="text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className="w-full pl-8 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A294F9] focus:border-[#A294F9] focus:outline-none"
                                            required
                                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leave</label>
                                    <textarea
                                        name="leaveReason"
                                        value={formData.leaveReason}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A294F9] focus:border-[#A294F9] focus:outline-none"
                                        rows="3"
                                        required
                                        placeholder="Explain the reason for your leave"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-8 space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/request-list')}
                                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A294F9]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#A294F9] hover:bg-[#8a7ce0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A294F9] disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="mr-2">Processing...</span>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    </>
                                ) : id ? "Update" : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequestForm;