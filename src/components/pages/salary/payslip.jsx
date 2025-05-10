import React, { useState, useEffect } from 'react';
import { FiDownload, FiMail, FiFilter, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { FaTrashAlt, FaSearch } from 'react-icons/fa';
import { Pagination } from '../../../shared/common/Pagination';
import { toast } from 'react-toastify';
import DeleteModal from '../../../shared/common/DeleteConfirmation';
import EmploySalaryService from '../../../services/EmploySalaryService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PayrollService from '../../../services/PayrollService';

const PayslipList = () => {
  const navigate = useNavigate();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayslipId, setSelectedPayslipId] = useState(null);

  const [filters, setFilters] = useState({
    employeeName: '',
    month: '',
    year: '',
    status: ''
  });

  const statusOptions = ['Pending', 'Paid', 'Rejected'];


  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = () => {
    setLoading(true);
    PayrollService.getPayroll()
      .then((data) => {
        setPayslips(data || []);
      })
      .catch((error) => {
        console.error('Error fetching payslips:', error);
        toast.error('Failed to load payslip records');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    setLoading(true);
    PayrollService.getPayroll(filters)
      .then((response) => {
        setPayslips(response || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error filtering payslips:', error);
        toast.error('Failed to filter payslip records');
        setLoading(false);
      });
    setShowFilter(false);
  };

  const closeFilter = () => {
    setShowFilter(false);
    setFilters({
      employeeName: '',
      month: '',
      year: '',
      status: ''
    });
    fetchPayslips();
  };

  const handleDeleteClick = (payslipId) => {
    setSelectedPayslipId(payslipId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    PayrollService.deletePayroll(selectedPayslipId)
      .then(() => {
        toast.success("Payslip deleted successfully");
        setPayslips(prev => prev.filter(p => p._id !== selectedPayslipId));
      })
      .catch((error) => {
        console.error('Error deleting payslip:', error);
        toast.error('Failed to delete payslip record');
      })
      .finally(() => {
        setShowDeleteModal(false);
        setSelectedPayslipId(null);
      });
  };

  const handleStatusChange = (payslipId, newStatus) => {
    console.log(newStatus);
    
    PayrollService.updatePayroll(payslipId, { status: newStatus })
      .then(() => {
        toast.success("Status updated successfully");
        setPayslips(prev =>
          prev.map(p =>
            p._id === payslipId ? { ...p, status: newStatus } : p
          )
        );
      })
      .catch((error) => {
        console.error('Error updating status:', error);
        toast.error('Failed to update status');
      });
  };

  const calculateNetSalary = (payslip) => {
    const totalAllowances = payslip.allowances.reduce((sum, allowance) => sum + allowance.amount, 0);
    const totalDeductions = payslip.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    return payslip.salaryAmount + totalAllowances - totalDeductions;
  };

  const generatePayslipPDF = (payslip) => {
    console.log(payslip);

    try {
      if (!payslip || !payslip.employeeId || typeof payslip.employeeId !== 'object') {
        toast.error("Invalid payslip data - missing employee information");
        return;
      }

      const doc = new jsPDF();
      const employee = payslip.employeeId;
      const totalAllowances = payslip.allowances?.reduce((sum, allowance) => sum + (allowance.amount || 0), 0) || 0;
      const totalDeductions = payslip.deductions?.reduce((sum, deduction) => sum + (deduction.amount || 0), 0) || 0;
      const netSalary = (payslip.salaryAmount || 0) + totalAllowances - totalDeductions;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(40, 53, 147);
      doc.text(`Payslip - ${employee.firstName || ''} ${employee.lastName || ''}`, 105, 20, { align: 'center' });

      // Subtitle
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Salary Period: ${payslip.date ? new Date(payslip.date).toLocaleDateString() : 'N/A'}`, 105, 30, { align: 'center' });

      // Line separator
      doc.setDrawColor(162, 148, 249);
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);

      // Employee Information
      doc.setFontSize(12);
      doc.text('Employee Information', 20, 45);

      const employeeInfo = [
        ['Employee ID', employee.employeeId || 'N/A'],
        ['Name', `${employee.firstName || ''} ${employee.lastName || ''}`],
        ['Designation', employee.designation || 'N/A'],
        ['Department', employee.department || 'N/A'],
        ['Salary Date', payslip.date ? new Date(payslip.date).toLocaleDateString() : 'N/A'],
        ['Salary Type', payslip.salaryType || 'N/A']
      ];

      autoTable(doc, {
        startY: 51,
        head: [['Detail', 'Value']],
        body: employeeInfo,
        theme: 'grid',
        headStyles: { fillColor: [162, 148, 249] },
        styles: { fontSize: 10 },
        margin: { left: 20 }
      });

      // Salary Breakdown
      doc.setFontSize(12);
      doc.text('Salary Breakdown', 20, doc.lastAutoTable.finalY + 15);

      const salaryBreakdown = [
        ['Basic Salary', `$${(payslip.salaryAmount || 0).toFixed(2)}`],
        ['Total Allowances', `$${totalAllowances.toFixed(2)}`],
        ['Total Deductions', `$${totalDeductions.toFixed(2)}`],
        ['Net Salary', `$${netSalary.toFixed(2)}`]
      ];

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Component', 'Amount']],
        body: salaryBreakdown,
        theme: 'grid',
        headStyles: { fillColor: [162, 148, 249] },
        styles: { fontSize: 10 },
        margin: { left: 20 }
      });

      // Allowances Details
      if (payslip.allowances?.length > 0) {
        doc.setFontSize(12);
        doc.text('Allowances Details', 20, doc.lastAutoTable.finalY + 15);

        const allowancesDetails = payslip.allowances.map(allowance => [
          allowance.type || 'N/A',
          `$${(allowance.amount || 0).toFixed(2)}`
        ]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 20,
          head: [['Allowance Type', 'Amount']],
          body: allowancesDetails,
          theme: 'grid',
          headStyles: { fillColor: [162, 148, 249] },
          styles: { fontSize: 10 },
          margin: { left: 20 }
        });
      }

      // Deductions Details
      if (payslip.deductions?.length > 0) {
        doc.setFontSize(12);
        doc.text('Deductions Details', 20, doc.lastAutoTable.finalY + 15);

        const deductionsDetails = payslip.deductions.map(deduction => [
          deduction.type || 'N/A',
          `$${(deduction.amount || 0).toFixed(2)}`
        ]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 20,
          head: [['Deduction Type', 'Amount']],
          body: deductionsDetails,
          theme: 'grid',
          headStyles: { fillColor: [162, 148, 249] },
          styles: { fontSize: 10 },
          margin: { left: 20 }
        });
      }

      // Footer
      doc.setFontSize(10);
      doc.text('This is a system-generated payslip and does not require a signature.', 105, 280, { align: 'center' });

      // Save the PDF
      doc.save(`${employee.firstName || 'employee'}_${employee.lastName || 'payslip'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate payslip PDF');
    }
  };

  const sendEmail = (payslipId) => {
    toast.info("Sending email...");
    PayrollService.sendPayslipEmail(payslipId)
      .then(() => {
        toast.success("Email sent successfully");
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        toast.error('Failed to send email');
      });
  };

  if (loading) {
    return (
      <div className="px-6 pt-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="text-lg text-gray-600">Loading payslip records...</div>
      </div>
    );
  }

  return (
    <>
      <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="py-4 px-2 flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Payslip Records</h2>
          <div className="flex space-x-2">
            <button
              title="filter"
              className="p-2 bg-[#A294F9] rounded shadow cursor-pointer"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FiFilter className="text-white" />
            </button>
            <button
              title="Create Payslip"
              onClick={() => navigate('/payroll-form')}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <input
                  type="text"
                  name="employeeName"
                  value={filters.employeeName}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  placeholder="Search by name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                >
                  <option value="">All Months</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                >
                  <option value="">All Years</option>
                  {Array.from({ length: 5 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
                  ))}
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
                  <option value="">All Statuses</option>
                  {statusOptions.map((status, index) => (
                    <option key={index} value={status}>{status}</option>
                  ))}
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

        {/* Payslip List Table */}
        <div className="overflow-x-auto p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-600 px-2 py-1 rounded-md">
              Showing <span className="font-semibold text-gray-800">{payslips.length}</span> payslip records
            </div>
            <div className="mt-4 flex justify-end">
              <Pagination />
            </div>
          </div>
          <table className="min-w-full table-auto text-sm">
            <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
              <tr>
                <th className="px-4 py-3 text-left">Profile</th>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Salary Type</th>
                <th className="px-4 py-3 text-left">Basic Salary</th>
                <th className="px-4 py-3 text-left">Net Salary</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length > 0 ? (
                payslips.map((payslip) => {
                  const netSalary = calculateNetSalary(payslip);
                  return (
                    <tr key={payslip._id} className="border-t hover:bg-[#CDC1FF] text-gray-600">
                      <td className="px-4 py-3">
                        {payslip?.employeeId?.profilePicture ? (
                          <img
                            src={payslip.employeeId.profilePicture}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                        ) : (
                          <span className="text-gray-400 italic">No image</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{payslip.employeeId.firstName} {payslip.employeeId.lastName}</td>
                      <td className="px-4 py-3">{new Date(payslip.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{payslip.salaryType}</td>
                      <td className="px-4 py-3">${payslip.salaryAmount.toFixed(2)}</td>
                      <td className="px-4 py-3">${netSalary.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={payslip.status || 'pending'}
                          onChange={(e) => handleStatusChange(payslip._id, e.target.value)}
                          className="p-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="reviewOnGoing">Review On Going</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            title="Download"
                            className="p-2 rounded shadow cursor-pointer"
                            style={{ backgroundColor: '#A294F9' }}
                            onClick={() => generatePayslipPDF(payslip)}
                          >
                            <FiDownload className="text-white" />
                          </button>
                          <button
                            title="Email"
                            className="p-2 rounded shadow cursor-pointer"
                            style={{ backgroundColor: '#34D399' }}
                            onClick={() => sendEmail(payslip._id)}
                          >
                            <FiMail className="text-white" />
                          </button>
                          <button
                            title="Delete"
                            className="p-2 rounded shadow cursor-pointer"
                            style={{ backgroundColor: '#F87171' }}
                            onClick={() => handleDeleteClick(payslip._id)}
                          >
                            <FaTrashAlt className="text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-500">No payslip records found</td>
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

export default PayslipList;