import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiPlus, FiDollarSign } from 'react-icons/fi';
import { FaEdit, FaTrash, FaTrashAlt } from 'react-icons/fa';
import PayrollService from '../../../services/PayrollService';
import { toast } from 'react-toastify';
import { BsCurrencyDollar } from 'react-icons/bs';

const PaymentForm = () => {
  const { id } = useParams();
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();

  const paymentTypes = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'other', label: 'Other' }
  ];

  const initializePayments = (payrollData) => {
    if (!payrollData?.employees) return [];

    return payrollData.employees.map(employee => ({
      employeeId: employee.employeeId?._id || employee.employeeId,
      name: employee.name || `${employee.employeeId?.firstName || ''} ${employee.employeeId?.lastName || ''}`.trim(),
      profilePicture: employee.employeeId?.profilePicture,
      department: employee.employeeId?.department || 'N/A',
      designation: employee.employeeId?.designation || 'N/A',
      totalPayable: employee.totalSalary || 0,
      totalPaid: employee.totalSalary || 0, // Default to full payment
      payments: [{
        date: new Date().toISOString().split('T')[0],
        type: 'cash',
        amount: employee.totalSalary || 0,
        notes: 'Initial payment'
      }]
    }));
  };

  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        setLoading(true);
        const response = await PayrollService.getPayrollById(id);

        if (response) {
          setPayroll(response);
          const initialPayments = initializePayments(response);
          setPayments(initialPayments);
        }
      } catch (error) {
        console.error("Error fetching payroll:", error);
        toast.error(error.response?.data?.message || "Failed to load payroll data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPayrollData();
    }
  }, [id]);

  const toggleRowExpand = (employeeId) => {
    setExpandedRows(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const handlePaymentChange = (employeeIndex, paymentIndex, field, value) => {
    const updatedPayments = [...payments];

    if (paymentIndex === undefined) {
      // Update main payment fields
      updatedPayments[employeeIndex][field] = value;
    } else {
      // Update individual payment details
      updatedPayments[employeeIndex].payments[paymentIndex][field] = value;

      // Recalculate total paid
      const totalPaid = updatedPayments[employeeIndex].payments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0), 0
      );
      updatedPayments[employeeIndex].totalPaid = totalPaid;
    }

    setPayments(updatedPayments);
  };

  const addPayment = (employeeIndex) => {
    const updatedPayments = [...payments];
    updatedPayments[employeeIndex].payments.push({
      date: new Date().toISOString().split('T')[0],
      type: 'cash',
      amount: 0,
      notes: ''
    });
    setPayments(updatedPayments);
  };

  const removePayment = (employeeIndex, paymentIndex) => {
    const updatedPayments = [...payments];
    updatedPayments[employeeIndex].payments.splice(paymentIndex, 1);

    // Recalculate total paid
    const totalPaid = updatedPayments[employeeIndex].payments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0), 0
    );
    updatedPayments[employeeIndex].totalPaid = totalPaid;

    setPayments(updatedPayments);
  };

const handleSubmit = async () => {
  try {
    setLoading(true);
    
    // 1. Create a new employees array with only allowed fields
    const updatedEmployees = payroll.employees.map(employee => {
      // Find corresponding payment data
      const paymentData = payments.find(p => 
        p.employeeId === (employee.employeeId?._id || employee.employeeId)
      );
      
      // Clean payments array to ensure amount is string if required
      const cleanedPayments = (paymentData?.payments || []).map(payment => ({
        ...payment,
        amount: payment.amount.toString() // Convert amount to string if required
      }));

      return {
        employeeId: employee.employeeId?._id || employee.employeeId, // Just the ID string
        name: employee.name,
        totalAllowance: employee.totalAllowance,
        totalDeduction: employee.totalDeduction,
        totalSalary: employee.totalSalary,
        payments: cleanedPayments
        // Remove totalPaid and totalPayable as per error
      };
    });

    // 2. Clean the summary.selectedEmployees to be just IDs
    const cleanedSummary = {
      ...payroll.summary,
      selectedEmployees: payroll.summary.selectedEmployees.map(emp => 
        emp._id // Just the ID string
      )
    };

    // 3. Create the final payload
    const payload = {
      employees: updatedEmployees,
      summary: cleanedSummary,
      month: payroll.month,
      year: payroll.year,
      status: 'PAID'
      // Remove _id, createdAt, updatedAt, __v as per error
    };

    // 4. Send the payload
    await PayrollService.updatePayroll(id, payload);
    toast.success("Payments saved successfully");
    navigate('/payroll');
  } catch (error) {
    console.error("Error saving payments:", error);
    toast.error(error.response?.data?.message || "Failed to save payments");
  } finally {
    setLoading(false);
  }
};
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium">No payroll data found</h3>
          <button
            onClick={() => navigate('/payroll')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
          >
            Back to Payroll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Payment Processing - {payroll.month}/{payroll.year}
        </h1>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
        >
          <FiDollarSign className="mr-2" />
          Save Payments
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Payable
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment, index) => {
              const balance = payment.totalPayable - payment.totalPaid;
              const isExpanded = expandedRows[payment.employeeId];

              return (
                <>
                  <tr key={payment.employeeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {payment.profilePicture ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={payment.profilePicture}
                            alt="Profile"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{payment.name}</div>
                          <div className="text-sm text-gray-500">{payment.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BsCurrencyDollar className="text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {payment.totalPayable.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BsCurrencyDollar className="text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {payment.totalPaid.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${balance < 0 ? 'text-red-500' :
                        balance > 0 ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                        <BsCurrencyDollar className="mr-1" />
                        <span className="text-sm font-medium">
                          {Math.abs(balance).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleRowExpand(payment.employeeId)}
                          className="p-1 text-purple-600 hover:text-purple-900"
                        >
                          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        <button
                          onClick={() => addPayment(index)}
                          className="p-1 text-green-600 hover:text-green-900"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="">
                      <td colSpan="5" className="px-6 py-4">
                        <div className="pl-1">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Details</h4>
                          {payment.payments.map((pmt, pmtIndex) => (
                            <div
                              key={pmtIndex}
                              className="flex items-center space-x-4 bg-gray p-3 rounded shadow"
                              style={{ gap: '1rem' }}
                            >
                              {/* Date */}
                              <div className="flex flex-col flex-grow min-w-[120px]">
                                <label className="text-xs text-gray-500 mb-1">Date</label>
                                <input
                                  type="date"
                                  value={pmt.date}
                                  onChange={(e) => handlePaymentChange(index, pmtIndex, 'date', e.target.value)}
                                  className="p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                />
                              </div>

                              {/* Type */}
                              <div className="flex flex-col flex-grow min-w-[120px]">
                                <label className="text-xs text-gray-500 mb-1">Type</label>
                                <select
                                  value={pmt.type}
                                  onChange={(e) => handlePaymentChange(index, pmtIndex, 'type', e.target.value)}
                                  className="p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                >
                                  {paymentTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Amount */}
                              <div className="flex flex-col flex-grow min-w-[120px] relative">
                                <label className="text-xs text-gray-500 mb-1">Amount</label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                    <BsCurrencyDollar className="text-gray-400" />
                                  </div>
                                  <input
                                    type="number"
                                    value={pmt.amount}
                                    onChange={(e) => handlePaymentChange(index, pmtIndex, 'amount', e.target.value)}
                                    className="pl-7 p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 w-full"
                                  />
                                </div>
                              </div>

                              {/* Notes */}
                              <div className="flex flex-col flex-grow min-w-[200px]">
                                <label className="text-xs text-gray-500 mb-1">Notes</label>
                                <input
                                  type="text"
                                  value={pmt.notes}
                                  onChange={(e) => handlePaymentChange(index, pmtIndex, 'notes', e.target.value)}
                                  className="p-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                                />
                              </div>

                              {/* Delete Button */}
                              <div className="flex flex-col px-2 mt-3">
                                {/* <button
                                  onClick={() => removePayment(index, pmtIndex)}
                                  className="text-red-600 hover:text-red-900 align-center"
                                  title="Remove payment"
                                >
                                  <FaTrashAlt />
                                </button> */}
                                <button
                                  type="button"
                                  onClick={() => removeAllowance(index)}
                                  className="p-2 rounded-md shadow cursor-pointer bg-[#F87171] hover:bg-[#ef4444] transition"
                                >
                                  <FaTrash className="text-white" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentForm;