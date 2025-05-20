import React, { useEffect, useState } from 'react';
import { FiPlus, FiList, FiCalendar, FiUser, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import employeeService from '../../../services/employeeService';

const RequestForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    requestType: 'leave', // Default to leave request
    employeeName: '',
    employeeDepartment: '',
    status: 'pending',
    // Leave specific fields
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    leaveReason: '',
    contactDuringLeave: '',
    addressDuringLeave: '',
    // Supporting documents
    supportingDocs: []
  });

  useEffect(() => {
    if (id) {
      loadEmployeeData();
    }
  }, [id]);

  const loadEmployeeData = () => {
    employeeService.getEmployeeById(id)
      .then((response) => {
        setEmployeeData(response);
        setFormData(prev => ({
          ...prev,
          employeeName: response.name,
          employeeDepartment: response.department
        }));
      })
      .catch((error) => {
        console.error('Error fetching employee data:', error);
        toast.error('Failed to load employee data');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      supportingDocs: files
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const requestData = {
      employeeId: id,
      requestType: formData.requestType,
      status: formData.status,
      employeeName: formData.employeeName,
      employeeDepartment: formData.employeeDepartment,
      // Leave specific data
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.leaveReason,
      contactDuringLeave: formData.contactDuringLeave,
      addressDuringLeave: formData.addressDuringLeave,
      supportingDocs: formData.supportingDocs
    };

    employeeService.submitEmployeeRequest(requestData)
      .then(() => {
        toast.success('Leave request submitted successfully!');
        navigate('/requests');
      })
      .catch(error => {
        console.error('Error submitting request:', error);
        toast.error('Error submitting leave request');
      });
  };

  return (
    <div className="p-6 bg-[#F5EFFF] min-h-screen">
      <div className="py-4 px-2 flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Leave Request Form</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/employees')}
            title="List"
            className="p-2 bg-[#A294F9] rounded shadow">
            <FiList className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="p-8 w-full max-w-8xl">
          {/* Employee Info */}
          {employeeData && (
            <div className="mb-8 p-4 bg-white rounded-lg shadow">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#A294F9] rounded-full text-white">
                  <FiUser size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{employeeData.name}</h3>
                  <p className="text-gray-600">{employeeData.department}</p>
                  <p className="text-gray-500 text-sm flex items-center">
                    <FiMail className="mr-1" /> {employeeData.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Employee Name</label>
                <input
                  type="text"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Department</label>
                <input
                  type="text"
                  name="employeeDepartment"
                  value={formData.employeeDepartment}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  readOnly
                />
              </div>
            </div>

            {/* Leave Request Fields */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-[#333] mb-4">Leave Details</h3>
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
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="annual">Annual Leave</option>
                    <option value="maternity">Maternity Leave</option>
                    <option value="paternity">Paternity Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
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
{/*                 
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Contact During Leave</label>
                  <input
                    type="text"
                    name="contactDuringLeave"
                    value={formData.contactDuringLeave}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                    placeholder="Phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Address During Leave</label>
                  <input
                    type="text"
                    name="addressDuringLeave"
                    value={formData.addressDuringLeave}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                    placeholder="Where you'll be staying"
                  />
                </div>
                 */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Supporting Documents</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {formData.supportingDocs.length > 0 && (
                    <div className="mt-2 text-sm text-gray-500">
                      {formData.supportingDocs.length} file(s) selected
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={() => navigate('/employees')}
                className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 transition me-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#A294F9] text-white px-5 py-2 rounded-md hover:bg-[#8a7ce0] transition"
              >
                Submit Leave Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;