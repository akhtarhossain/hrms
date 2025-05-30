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
    const [isHalfDay, setIsHalfDay] = useState(false);
    const [allEmployees, setAllEmployees] = useState([]);
    const [employeeData, setEmployeeData] = useState(null);
    const [files, setFiles] = useState([]);
    const [leavePoliciesData, setLeavePoliciesData] = useState([]);
    const [currentEmployeeLeavePolicy, setCurrentEmployeeLeavePolicy] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        employeeName: '',
        subject: '',
        status: 'pending',
        leaveType: 'sick',
        startDate: '',
        endDate: '',
        leaveReason: '',
    });

    const GetUser = () => {
    return SessionService.getLoggedIn();
    };

   useEffect(() => {
        let isMounted = true; // To prevent state updates on unmounted component

        LeavePolicyService.getLeavePolicies()
            .then(response => {
                if (isMounted) {
                    console.log("Leave Policies Response:", response.list);
                    setLeavePoliciesData(response.list || []);
                }
            })
            .catch(error => {
                console.error('Error fetching leave policies:', error);
                toast.error('Failed to load leave policies');
            });

        employeeService.getEmployee()
            .then(response => {
                if (isMounted) {
                    const employees = response.list || response;
                    setAllEmployees(Array.isArray(employees) ? employees : []);
                }
            })
            .catch(error => {
                console.error('Error fetching employees:', error);
                toast.error('Failed to load employee list');
            });

        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        if (id) {
            LeaveService.getLeaveById(id)
                .then(response => {
                    if (isMounted) {
                        const data = response.data || response;
                        setFormData({
                            employeeId: data.employeeId,
                            employeeName: data.employeeName,
                            subject: data.subject,
                            status: data.status,
                            leaveType: data.leaveType,
                            startDate: formatDateForInput(data.endDate),
                            endDate: formatDateForInput(data.endDate),
                            leaveReason: data.leaveReason,
                        });
                        setIsHalfDay(Boolean(data.isHalfDay));
                        // Fetch leave policy for the editing employee
                        const employee = allEmployees.find(emp => emp._id === data.employeeId);
                        if (employee?.leavePolicyId) {
                            const policy = leavePoliciesData.find(lp => lp._id === employee.leavePolicyId);
                            setCurrentEmployeeLeavePolicy(policy);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error loading leave request:', error);
                    toast.error('Failed to load leave request');
                });
        } else {
            const user = GetUser();
            if (isMounted && user?.data) {
                const { _id, firstName, lastName, leavePolicyId } = user.data;
                setFormData(prev => ({
                    ...prev,
                    employeeId: _id,
                    employeeName: `${firstName} ${lastName}`
                }));
                // Fetch leave policy for the logged-in user
                const policy = leavePoliciesData.find(lp => lp._id === leavePolicyId);
                setCurrentEmployeeLeavePolicy(policy);
            }
        }

        return () => {
            isMounted = false; // Cleanup function to prevent state updates on unmounted component
        };
    }, [id]); // Added dependencies

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmployeeSelect = (e) => {
        const selectedId = e.target.value;
        const selectedEmployee = allEmployees.find(emp => emp._id === selectedId);

        setFormData(prev => ({
            ...prev,
            employeeId: selectedId,
            employeeName: selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : ''
        }));

        // Find and set the leave policy for the selected employee
        if (selectedEmployee?.leavePolicy) {
            const policy = leavePoliciesData.find(lp => lp._id === selectedEmployee.leavePolicy);
            setCurrentEmployeeLeavePolicy(policy);
        } else {
            setCurrentEmployeeLeavePolicy(null);
        }
    };

    const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
        if (id) {
        LeaveService.updateLeave(id, formData)
          .then(() => {
            toast.success('Leave request updated successfully!');
            navigate('/request-list');
            })
            .catch(error => {
            console.error('Update error:', error);
            toast.error('Error updating leave request');
            setIsSubmitting(false);

            });
        } else {
        LeaveService.createLeave(formData)
            .then(() => {
             toast.success('Leave request submitted successfully!');
             navigate('/request-list');
            })
            .catch(error => {
             console.error('Create error:', error);
             toast.error('Error submitting leave request');
             setIsSubmitting(false);
            });
        }
    };

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
                <div className="p-8 w-full max-w-8xl">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Employee Name</label>
                                <select
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleEmployeeSelect}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
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
                                <label className="block text-sm text-gray-600 mb-1">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Leave Type</label>
                                    <select
                                        name="leaveType"
                                        value={formData.leaveType}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                                        required
                                    >
                                        <option value="">Select Leave Type</option>
                                        {currentEmployeeLeavePolicy ? (
                                            <>
                                                {currentEmployeeLeavePolicy.sickLeave !== undefined && (
                                                    <option value="sick">
                                                        Sick Leave - {currentEmployeeLeavePolicy.sickLeave}
                                                    </option>
                                                )}
                                                {currentEmployeeLeavePolicy.annualLeave !== undefined && (
                                                    <option value="annual">
                                                        Annual Leave - {currentEmployeeLeavePolicy.annualLeave}
                                                    </option>
                                                )}
                                                {currentEmployeeLeavePolicy.maternityLeave !== undefined && (
                                                    <option value="maternity">
                                                        Maternity Leave - {currentEmployeeLeavePolicy.maternityLeave}
                                                    </option>
                                                )}
                                                {currentEmployeeLeavePolicy.paternityLeave !== undefined && (
                                                    <option value="paternity">
                                                        Paternity Leave - {currentEmployeeLeavePolicy.paternityLeave}
                                                    </option>
                                                )}
                                            </>
                                        ) : (
                                            <option disabled>Please select an employee</option>
                                        )}
                                    </select>
                                </div>
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiCalendar className="text-gray-400" />
                                            </div>
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleChange}
                                                className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">End Date</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiCalendar className="text-gray-400" />
                                            </div>
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleChange}
                                                className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-600 mb-1">Reason for Leave</label>
                                    <textarea
                                        name="leaveReason"
                                        value={formData.leaveReason}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                                        rows="3"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-8">
                            <button
                                type="button"
                                onClick={() => navigate('/request-list')}
                                className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 transition me-4"
                            >
                                Cancel
                            </button>
                             <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#A294F9] text-white px-5 py-2 rounded-md hover:bg-[#8a7ce0] transition"
                            >
                            {isSubmitting ? 'Saving...' :id ? "Update" : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequestForm;