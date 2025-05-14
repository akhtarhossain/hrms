import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiDownload } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaArrowLeft } from 'react-icons/fa';
import employeeService from '../../../services/employeeService';

const EmployeePayslip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await employeeService.getEmployeeById(id);
        setEmployee(response);
      } catch (err) {
        setError('Failed to fetch employee data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id]);

  const handleDownloadPayslip = () => {
    if (!employee) return;
  
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 53, 147);
    doc.text('PAYSLIP', 105, 20, { align: 'center' });
    
    // Company Info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Company Name', 105, 28, { align: 'center' });
    doc.text(`For the month of ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`, 105, 33, { align: 'center' });
    
    // Line separator
    doc.setDrawColor(162, 148, 249);
    doc.setLineWidth(0.5);
    doc.line(20, 38, 190, 38);
    
    // Employee Info
    doc.setFontSize(12);
    doc.text('Employee Information', 20, 48);
    
    const employeeInfo = [
      ['Employee ID', employee.employeeId],
      ['Name', `${employee.firstName} ${employee.lastName}`],
      ['Designation', employee.designation],
      ['Department', employee.department],
      ['Joining Date', new Date(employee.dateOfJoining).toLocaleDateString()],
      ['Pay Period', `${new Date(year, month - 1, 1).toLocaleDateString()} - ${new Date(year, month, 0).toLocaleDateString()}`]
    ];
    
    autoTable(doc, {
      startY: 53,
      body: employeeInfo,
      theme: 'grid',
      headStyles: { fillColor: [162, 148, 249] },
      styles: { fontSize: 10 },
      margin: { left: 20 }
    });
    
    // Allowances
    doc.setFontSize(12);
    doc.text('Allowances', 20, doc.lastAutoTable.finalY + 15);
    
    const allowanceData = employee.allowances.map(allowance => [
      allowance.type,
      `$${allowance.newSalary.toFixed(2)}`,
      new Date(allowance.startDate).toLocaleDateString(),
      new Date(allowance.endDate).toLocaleDateString()
    ]);
    
    // Calculate total allowances
    const totalAllowances = employee.allowances.reduce((sum, allowance) => sum + allowance.newSalary, 0);
    allowanceData.push(['Total Allowances', `$${totalAllowances.toFixed(2)}`, '', '']);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Type', 'Amount', 'Start Date', 'End Date']],
      body: allowanceData,
      theme: 'grid',
      headStyles: { fillColor: [162, 148, 249] },
      styles: { fontSize: 10 },
      margin: { left: 20 }
    });
    
    // Deductions
    doc.setFontSize(12);
    doc.text('Deductions', 20, doc.lastAutoTable.finalY + 15);
    
    const deductionData = employee.deductions.map(deduction => [
      deduction.type,
      `$${deduction.newSalary.toFixed(2)}`,
      new Date(deduction.startDate).toLocaleDateString(),
      new Date(deduction.endDate).toLocaleDateString()
    ]);
    
    // Calculate total deductions
    const totalDeductions = employee.deductions.reduce((sum, deduction) => sum + deduction.newSalary, 0);
    deductionData.push(['Total Deductions', `$${totalDeductions.toFixed(2)}`, '', '']);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Type', 'Amount', 'Start Date', 'End Date']],
      body: deductionData,
      theme: 'grid',
      headStyles: { fillColor: [162, 148, 249] },
      styles: { fontSize: 10 },
      margin: { left: 20 }
    });
    
    // Net Salary
    doc.setFontSize(12);
    doc.text('Salary Summary', 20, doc.lastAutoTable.finalY + 20);
    
    const netSalary = totalAllowances - totalDeductions;
    const salarySummary = [
      ['Gross Salary', `$${totalAllowances.toFixed(2)}`],
      ['Total Deductions', `$${totalDeductions.toFixed(2)}`],
      ['Net Salary', `$${netSalary.toFixed(2)}`]
    ];
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 25,
      body: salarySummary,
      theme: 'grid',
      headStyles: { fillColor: [162, 148, 249] },
      styles: { fontSize: 10, fontStyle: 'bold' },
      margin: { left: 20 }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer generated payslip and does not require signature.', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`${employee.firstName}_${employee.lastName}_Payslip_${month}_${year}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <p className="text-red-500 text-lg mb-4">{error}</p>
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

  // Calculate totals
  const totalAllowances = employee.allowances.reduce((sum, allowance) => sum + allowance.newSalary, 0);
  const totalDeductions = employee.deductions.reduce((sum, deduction) => sum + deduction.newSalary, 0);
  const netSalary = totalAllowances - totalDeductions;

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
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="month" className="text-sm text-gray-700">Month:</label>
            <select 
              id="month" 
              value={month} 
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="p-1 rounded border border-gray-300"
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleString('default', {month: 'long'})}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="year" className="text-sm text-gray-700">Year:</label>
            <select 
              id="year" 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="p-1 rounded border border-gray-300"
            >
              {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleDownloadPayslip}
            className="p-2 rounded shadow flex items-center space-x-2"
            style={{ backgroundColor: '#A294F9' }}
          >
            <FiDownload className="text-white" />
            <span className="text-white">Download Payslip</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="p-6">
          {/* Payslip Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-purple-800">PAYSLIP</h1>
            <p className="text-gray-600">BITS BUFFERS</p>
            <p className="text-gray-600">
              For the month of {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <div className="border-b-2 border-purple-200 mb-6"></div>
          
          {/* Employee Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 px-4 py-2 border-l-4 border-purple-400 bg-[#E5D9F2] rounded shadow-sm">
              Employee Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded">
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium">{employee.employeeId}</p>
              </div>
              <div className="p-3 rounded">
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{employee.firstName} {employee.lastName}</p>
              </div>
              <div className="p-3 rounded">
                <p className="text-sm text-gray-500">Designation</p>
                <p className="font-medium">{employee.designation}</p>
              </div>
              <div className="p-3 rounded">
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{employee.department}</p>
              </div>
              <div className="p-3 rounded">
                <p className="text-sm text-gray-500">Joining Date</p>
                <p className="font-medium">
                  {new Date(employee.dateOfJoining).toLocaleDateString()}
                </p>
              </div>
              <div className="p-3 rounded">
                <p className="text-sm text-gray-500">Pay Period</p>
                <p className="font-medium">
                  {new Date(year, month - 1, 1).toLocaleDateString()} - {new Date(year, month, 0).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          {/* Allowances */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 px-4 py-2 border-l-4 border-purple-400 bg-[#E5D9F2] rounded shadow-sm">
              Allowances
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employee.allowances.map((allowance, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{allowance.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${allowance.newSalary.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(allowance.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(allowance.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Allowances</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${totalAllowances.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Deductions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 px-4 py-2 border-l-4 border-purple-400 bg-[#E5D9F2] rounded shadow-sm">
              Deductions
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employee.deductions.map((deduction, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{deduction.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${deduction.newSalary.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(deduction.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(deduction.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Deductions</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${totalDeductions.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Salary Summary */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Salary Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg shadow text-center">
                <p className="text-sm text-gray-500">Gross Salary</p>
                <p className="text-2xl font-bold text-purple-700">${totalAllowances.toFixed(2)}</p>
              </div>
              
              <div className="p-4 rounded-lg shadow text-center">
                <p className="text-sm text-gray-500">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600">${totalDeductions.toFixed(2)}</p>
              </div>
              
              <div className="p-4 rounded-lg shadow text-center">
                <p className="text-sm text-gray-700 font-medium">Net Salary</p>
                <p className="text-3xl font-bold text-purple-800">${netSalary.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>This is a computer generated payslip and does not require signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePayslip;