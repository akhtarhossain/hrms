import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PayrollService from '../../../services/PayrollService';
import { FaDownload } from 'react-icons/fa';
import { FiDollarSign } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import bitsbuffer from "../../../assets/bitsbuffer.jpeg";

const PayrollDetailTable = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payroll, setPayroll] = useState(null);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const response = await PayrollService.getPayrollById(id);
        setPayroll(response);
      } catch (error) {
        console.error('Error fetching payroll:', error);
        toast.error('Failed to load payroll details');
      }
    };
    fetchPayroll();
  }, [id]);

const handleDownloadPayslip = (emp) => {
    if (!emp || !emp.employeeId) return;

    const doc = new jsPDF();

    const { firstName, lastName, designation, department, bankName, accountTitle, accountNumber } = emp.employeeId;
    const fullName = `${firstName} ${lastName}`;
    const totalSalary = emp.totalSalary || 0;
    const totalPaid = emp.totalPaid || 0;
    const remainingBalance = totalSalary - totalPaid;
    const status = remainingBalance > 0 ? 'PENDING' : 'PAID';

    const payMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    // Add Company Logo
    doc.addImage(bitsbuffer, 'JPEG', 85, 15, 42, 8); // Adjusted position and size

    // Header: Payslip Title
    doc.setFontSize(16);
    doc.setTextColor(33, 33, 33);
    doc.text(`Payslip – ${payMonth}`, 105, 35, { align: 'center' });

    // Employee Info
    doc.setFontSize(12);
    autoTable(doc, {
      startY: 45,
      body: [
        ['Employee Name', fullName],
        ['Department', department || 'N/A'],
        ['Designation', designation || 'N/A'],
        ['Status', status]
      ],
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [162, 148, 249] },
      margin: { left: 20 }
    });

    // Allowances (simplified)
    doc.text('Allowances', 20, doc.lastAutoTable.finalY + 10);
    const allowanceData = emp.allowances?.map(item => [
      item.type,
      `$${(item.newSalary || 0).toFixed(2)}`
    ]) || [];
    allowanceData.push(['Total Allowance', `$${(emp.totalAllowance || 0).toFixed(2)}`]);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Type', 'Amount']],
      body: allowanceData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [162, 148, 249] },
      margin: { left: 20 }
    });

    // Deductions (simplified)
    doc.text('Deductions', 20, doc.lastAutoTable.finalY + 10);
    const deductionData = emp.deductions?.map(item => [
      item.type,
      `$${(item.newSalary || 0).toFixed(2)}`
    ]) || [];
    deductionData.push(['Total Deduction', `$${(emp.totalDeduction || 0).toFixed(2)}`]);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Type', 'Amount']],
      body: deductionData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [162, 148, 249] },
      margin: { left: 20 }
    });

    // Payments
    doc.text('Payments Made', 20, doc.lastAutoTable.finalY + 10);
    const paymentData = emp.payments?.map(p => {
      const row = [
        new Date(p.date).toLocaleDateString(),
        p.type,
        `$${parseFloat(p.amount || 0).toFixed(2)}`,
        p.notes || '—'
      ];
      
      // Add bank details if payment method is bank_transfer
      if (p.type === 'bank_transfer') {
        row.push(
          `Bank: ${bankName || 'N/A'}\n` +
          `Account Title: ${accountTitle || 'N/A'}\n` +
          `Account Number: ${accountNumber || 'N/A'}`
        );
      } else {
        row.push('—');
      }
      
      return row;
    }) || [];
    
    paymentData.push(['Total Paid', '', `$${totalPaid.toFixed(2)}`, '', '']);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Date', 'Method', 'Amount', 'Notes', 'Bank Details']],
      body: paymentData,
      theme: 'grid',
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        lineWidth: 0.1
      },
      columnStyles: {
        4: { cellWidth: 40 } // Make bank details column wider
      },
      headStyles: { fillColor: [162, 148, 249] },
      margin: { left: 20 }
    });

    // Final Summary
    doc.setFontSize(12);
    doc.text('Salary Summary', 20, doc.lastAutoTable.finalY + 10);
    const summaryData = [
      ['Total Salary', `$${totalSalary.toFixed(2)}`],
      ['Total Paid', `$${totalPaid.toFixed(2)}`]
    ];
    if (remainingBalance > 0) {
      summaryData.push(['Remaining Balance', `$${remainingBalance.toFixed(2)}`]);
    }
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10, fontStyle: 'bold' },
      headStyles: { fillColor: [162, 148, 249] },
      margin: { left: 20 }
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('This is a system-generated payslip and does not require a signature.', 105, 285, { align: 'center' });

    // Save the PDF
    doc.save(`${fullName.replace(/ /g, '_')}_Payslip_${payMonth.replace(' ', '_')}.pdf`);
    toast.success('Payslip downloaded successfully!');
  };

  if (!payroll) return <div className="p-4">Loading...</div>;

  return (
    <>
      <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <FiDollarSign className="text-2xl mr-2" style={{ color: '#6D28D9' }} />
            <h1 className="text-2xl font-bold" style={{ color: '#6D28D9' }}>
              Payroll Detail - {payroll.month}/{payroll.year}
            </h1>
          </div>
        </div>

        {/* Payroll Detail Table */}
        <div className="overflow-x-auto p-3">
          <table className="min-w-full table-auto text-sm">
            <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
              <tr>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Total Allowances</th>
                <th className="px-4 py-3 text-left">Total Deductions</th>
                <th className="px-4 py-3 text-left">Total Salary</th>
                <th className="px-4 py-3 text-left">Total Paid</th>
                <th className="px-4 py-3 text-left">Remaining Balance</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payroll.employees.map((emp, index) => {
                const remainingBalance = emp.totalSalary - emp.totalPaid;

                return (
                  <tr key={index} className="border-t hover:bg-[#CDC1FF] text-gray-600">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={emp.employeeId.profilePicture}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span>{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{emp.totalAllowance}</td>
                    <td className="px-4 py-3">{emp.totalDeduction}</td>
                    <td className="px-4 py-3">{emp.totalSalary}</td>
                    <td className="px-4 py-3">{emp.totalPaid}</td>
                    <td className="px-4 py-3">{remainingBalance}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          title="Download Slip"
                          className="p-2 rounded shadow cursor-pointer"
                          style={{ backgroundColor: '#A294F9' }}
                          onClick={() => handleDownloadPayslip(emp)}
                        >
                          <FaDownload className="text-white" />
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PayrollDetailTable;