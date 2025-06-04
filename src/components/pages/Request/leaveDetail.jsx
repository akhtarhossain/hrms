import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaFileAlt, FaEnvelope } from 'react-icons/fa';
import { FiClock, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import LeaveService from '../../../services/LeaveService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const LeaveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchLeaveDetails = async () => {
      try {
        const response = await LeaveService.getLeaveById(id);
        setLeave(response.data || response);
      } catch (error) {
        console.error('Error fetching leave details:', error);
        toast.error('Failed to load leave details');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };
const handleStatusChange = async (newStatus) => {
  if (!leave || leave.status === newStatus) return;

  try {
    setUpdating(true);
    await LeaveService.updateLeaveStatus(leave._id, newStatus);
    toast.success(`Status updated to ${newStatus}`);
    
    // Refresh the leave data
    const response = await LeaveService.getLeaveById(id);
    setLeave(response.data || response);
  } catch (error) {
    console.error('Status update error:', error);
    toast.error(error.response?.data?.message || 'Failed to update status');
  } finally {
    setUpdating(false);
  }
};

  const handleDownloadPDF = () => {
    if (!leave) return;
  
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 53, 147);
    doc.text(`Leave Request Details - ${leave.employeeName}`, 105, 20, { align: 'center' });
    
    // Line separator
    doc.setDrawColor(162, 148, 249);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    // Leave Details
    const leaveData = [
      ['Employee Name', leave.employeeName],
      ['Leave Type', leave.leaveType],
      ['Status', leave.status],
      ['Start Date', formatDate(leave.startDate)],
      ['End Date', formatDate(leave.endDate)],
      ['Duration', leave.isHalfDay ? 'Half Day' : 'Full Day'],
      ['Requested Days', leave.requestedDays]
    ];
    
    autoTable(doc, {
      startY: 30,
      body: leaveData,
      theme: 'grid',
      headStyles: { fillColor: [162, 148, 249] },
      styles: { fontSize: 10 }
    });
    
    // Reason
    doc.setFontSize(12);
    doc.text('Reason for Leave:', 20, doc.lastAutoTable.finalY + 15);
    doc.setFontSize(10);
    doc.text(leave.leaveReason, 20, doc.lastAutoTable.finalY + 25, { maxWidth: 170 });
    
    doc.save(`${leave.employeeName}_Leave_Details.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <p className="text-red-500 text-lg mb-4">Leave details not found</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-md text-white"
          style={{ backgroundColor: '#A294F9' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
      <div className="py-4 px-2 flex justify-between items-center mb-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded shadow flex items-center space-x-2"
          style={{ backgroundColor: '#A294F9' }}
        >
          <FaArrowLeft className="text-white" />
          <span className="text-white">Back</span>
        </button>
        
        <button
          onClick={handleDownloadPDF}
          className="p-2 rounded shadow flex items-center space-x-2"
          style={{ backgroundColor: '#A294F9' }}
        >
          <FiDownload className="text-white" />
          <span className="text-white">Download PDF</span>
        </button>
      </div>

      <div className="p-6">
        <div className="overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="p-4 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 px-4 py-2 border-l-4 border-purple-400 bg-[#E5D9F2] rounded shadow-sm">
                    Employee Information
                  </h3>
                  <div className="flex items-start space-x-3">
                    <FaUser className="text-[#A294F9] mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Employee Name</p>
                      <p className="font-medium">{leave.employeeName}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 px-4 py-2 border-l-4 border-purple-400 bg-[#E5D9F2] rounded shadow-sm">
                    Leave Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <FaFileAlt className="text-[#A294F9] mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Leave Type</p>
                        <p className="font-medium capitalize">{leave.leaveType}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FiClock className="text-[#A294F9] mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <select
                          value={leave.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          disabled={updating}
                          className={`border rounded p-1 focus:ring-2 focus:ring-[#A294F9] focus:border-[#A294F9] ${
                            leave.status === 'approved' ? 'bg-green-50 text-green-800' :
                            leave.status === 'rejected' ? 'bg-red-50 text-red-800' :
                            'bg-yellow-50 text-yellow-800'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        {updating && (
                          <span className="ml-2 text-sm text-gray-500">Updating...</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaCalendarAlt className="text-[#A294F9] mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">
                          {leave.isHalfDay ? 'Half Day' : `${leave.requestedDays} Day(s)`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 px-4 py-2 border-l-4 border-purple-400 bg-[#E5D9F2] rounded shadow-sm">
                    Additional Information
                  </h3>
                  <div className="flex items-start space-x-3">
                    <FaEnvelope className="text-[#A294F9] mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Reason</p>
                      <p className="font-medium">{leave.leaveReason}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 px-4 py-2 border-l-4 border-purple-400 bg-[#E5D9F2] rounded shadow-sm">
                    Dates
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <FaCalendarAlt className="text-[#A294F9] mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="font-medium">{formatDate(leave.startDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaCalendarAlt className="text-[#A294F9] mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">End Date</p>
                        <p className="font-medium">{formatDate(leave.endDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            {leave.attachments && leave.attachments.length > 0 && (
              <div className="mt-6 p-4 rounded-lg border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 px-4 py-2 border-l-4 border-purple-400 bg-[#E5D9F2] rounded shadow-sm">
                  Attachments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leave.attachments.map((file, index) => (
                    <div key={index} className="p-3 rounded border border-purple-100">
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline flex items-center"
                      >
                        <FiDownload className="mr-2" />
                        {file.name || `Attachment ${index + 1}`}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveDetails;