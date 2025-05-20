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
    <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
      <div className="py-4 px-2 flex justify-between items-center mb-3">
        <h1 className="text-3xl font-bold text-gray-800">
          Payment Processing - {payroll.month}/{payroll.year}
        </h1>
      </div>
      <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <table className="min-w-full table-auto text-sm">
          <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
            <tr>
              <th className="px-4 py-3 text-left">
                Employee
              </th>
              <th className="px-4 py-3 text-left">
                Total Payable
              </th>
              <th className="px-4 py-3 text-left">
                Total Paid
              </th>
              <th className="px-4 py-3 text-left">
                Balance
              </th>
              <th className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment, index) => {
              const balance = payment.totalPayable - payment.totalPaid;
              const isExpanded = expandedRows[payment.employeeId];

              return (
                <>
                  <tr key={index} className="border-t hover:bg-[#CDC1FF] text-gray-600">
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
                    <td className="px-7 py-4 whitespace-nowrap text-sm text-white">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => toggleRowExpand(payment.employeeId)}
                          style={{ backgroundColor: '#A294F9' }}
                          className="p-2 rounded shadow cursor-pointer"
                        >
                          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan="5" className="py-6">
                        <div className="p-4 border-b border-gray-300 rounded-lg">
                        <div className="flex justify-between items-start mb-3 mr-3">
                        <h4 className="text-sm font-bold text-gray-700">Payment Details</h4>
                        <button
                          onClick={() => addPayment(index)}
                          style={{ backgroundColor: '#A294F9' }}
                          className="p-2 rounded shadow cursor-pointer text-white flex items-center gap-1"
                        >
                          <FiPlus />
                          Add Payment Detail
                        </button>
                      </div>


                          <div className="space-y-3">
                            {payment.payments.map((pmt, pmtIndex) => (
                              <div
                                key={pmtIndex}
                                className="grid grid-cols-12 gap-3 items-center p-3 rounded"
                              >
                                {/* Date */}
                                <div className="col-span-3">
                                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                                   <input
                                    type="date"
                                    name={name}
                                    placeholder="Year of Passing"
                                    value={pmt.date}
                                    onChange={(e) => handlePaymentChange(index, pmtIndex, 'date', e.target.value)}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                                  />                       
                                </div>

                                {/* Type */}
                                <div className="col-span-3">
                                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                                  <select
                                    value={pmt.type}
                                    onChange={(e) => handlePaymentChange(index, pmtIndex, 'type', e.target.value)}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                                  >
                                    {paymentTypes.map(type => (
                                      <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Amount */}
                                <div className="col-span-3">
                                  <label className="block text-xs text-gray-500 mb-1">Amount</label>
                                  <div className="relative">
                                 
                                    <input
                                      type="number"
                                      value={pmt.amount}
                                      onChange={(e) => handlePaymentChange(index, pmtIndex, 'amount', e.target.value)}
                                      className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                                    />
                                  </div>
                                </div>

                                {/* Notes */}
                                <div className="col-span-2">
                                  <label className="block text-xs text-gray-500 mb-1">Notes</label>
                                  <input
                                    type="text"
                                    value={pmt.notes}
                                    onChange={(e) => handlePaymentChange(index, pmtIndex, 'notes', e.target.value)}
                                    className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                                  />
                                </div>

                                {/* Delete Button */}
                                <div className="col-span-1 flex justify-end">
                                  <button
                                    onClick={() => removePayment(index, pmtIndex)}
                                    // style={{ backgroundColor: '#A294F9' }}
                                    className="p-2 rounded shadow cursor-pointer bg-red-500 hover:bg-red-200 mt-3"
                                    title="Remove payment"
                                  >
                                    <FaTrash className="text-white" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-end gap-3 py-3">
          <button
            onClick={() => navigate('/payroll')}
            className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 transition me-2 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#A294F9] text-white px-5 py-2 rounded-md transition cursor-pointer"
          >
            Save Payments
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;