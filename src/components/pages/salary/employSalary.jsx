import React, { useEffect, useState } from 'react';
import { FiPlus, FiList } from 'react-icons/fi';
import { BsCurrencyDollar } from 'react-icons/bs';
import { FaTrash } from 'react-icons/fa';
import employeeService from '../../../services/employeeService';
import TransactionTypeService from '../../../services/TransactionTypeService';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const EmployeeSalaryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allowanceTypes, setAllowanceTypes] = useState([]);
  const [deductionTypes, setDeductionTypes] = useState([]);
  const [totalAllowances, setTotalAllowances] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);

  const [formData, setFormData] = useState({
    allowances: [],
    deductions: [],
  });

  useEffect(() => {
    fetchTransactions();
    if (id) {
      loadEmployeeData();
    }
  }, [id]);

  const fetchTransactions = () => {
    TransactionTypeService.getTransactionTypes()
      .then((data) => {
        const transactions = data || [];
        const formattedAllowances = transactions
          .filter((item) => item.transactionType === "allowance")
          .map((item) => ({
            value: item.name,
            label: item.name,
          }));
        const formattedDeductions = transactions
          .filter((item) => item.transactionType === "deduction")
          .map((item) => ({
            value: item.name,
            label: item.name,
          }));
  
        setAllowanceTypes(formattedAllowances);
        setDeductionTypes(formattedDeductions);
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
        toast.error("Failed to load transaction records");
      });
  };

  const loadEmployeeData = () => {
    employeeService.getEmployeeById(id)
      .then((response) => {
        const employeeData = response;
        setFormData({
          allowances: employeeData.allowances || [],
          deductions: employeeData.deductions || [],
        });
        calculateTotals({
          allowances: employeeData.allowances || [],
          deductions: employeeData.deductions || [],
        });
      })
      .catch((error) => {
        console.error('Error fetching employee data:', error);
        toast.error('Failed to load employee data');
      });
  };

  const calculateTotals = (data) => {
    let allowancesTotal = 0;
    let deductionsTotal = 0;
    
    (data?.allowances || []).forEach((allowance) => {
      const amount = Number(allowance?.amount) || 0;
      const newSalary = Number(allowance?.newSalary) || 0;
      allowancesTotal += amount + newSalary;
    });
    
    (data?.deductions || []).forEach((deduction) => {
      const amount = Number(deduction?.amount) || 0;
      const newSalary = Number(deduction?.newSalary) || 0;
      deductionsTotal += amount + newSalary;
    });
    
    const total = allowancesTotal - deductionsTotal;
    setTotalAllowances(allowancesTotal);
    setTotalDeductions(deductionsTotal);
    setTotalSalary(total);
  };

  useEffect(() => {
    calculateTotals(formData);
  }, [formData]);

  const addAllowance = () => {
    setFormData(prev => ({
      ...prev,
      allowances: [...prev.allowances, { 
        type: "", 
        currentSalary: "", 
        newSalary: "",
        startDate: "",
        endDate: "" 
      }]
    }));
  };

  const addDeduction = () => {
    setFormData(prev => ({
      ...prev,
      deductions: [...prev.deductions, { 
        type: "", 
        currentSalary: "", 
        newSalary: "",
        startDate: "",
        endDate: "" 
      }]
    }));
  };

  const handleAllowanceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedAllowances = [...formData.allowances];
    updatedAllowances[index][name] = value;
    setFormData(prev => ({
      ...prev,
      allowances: updatedAllowances
    }));
  };

  const handleDeductionChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDeductions = [...formData.deductions];
    updatedDeductions[index][name] = value;
    setFormData(prev => ({
      ...prev,
      deductions: updatedDeductions
    }));
  };

  const removeAllowance = (index) => {
    const updatedAllowances = formData.allowances.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      allowances: updatedAllowances
    }));
  };

  const removeDeduction = (index) => {
    const updatedDeductions = formData.deductions.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      deductions: updatedDeductions
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      allowances: formData.allowances.map(a => ({
        ...a,
        currentSalary: Number(a.currentSalary),
        newSalary: Number(a.newSalary)
      })),
      deductions: formData.deductions.map(d => ({
        ...d,
        currentSalary: Number(d.currentSalary),
        newSalary: Number(d.newSalary)
      }))
    };

    if (id) {
      employeeService.updateEmployee(id, finalData)
        .then(() => {
          toast.success('Employee salary updated successfully!');
          navigate('/salary');
        })
        .catch(error => {
          console.error('Error updating employee salary:', error);
          toast.error('Error updating employee salary');
        });
    } else {
      toast.error('Employee ID not found');
    }
  };

  return (
    <div className="p-6 bg-[#F5EFFF] min-h-screen">
      <div className="py-4 px-2 flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Employee Salary Form</h2>
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
        <div className="p-8 w-full max-w-6xl">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg text-[#333]">Allowances</h3>
                  <button
                    type="button"
                    onClick={addAllowance}
                    className="px-3 py-2 rounded-md shadow text-white flex items-center gap-1 bg-[#A294F9] hover:bg-[#8a7ce0] transition"
                  >
                    <FiPlus size={16} />
                    Add Allowance
                  </button>
                </div>

                {formData.allowances.map((allowance, index) => (
                  <div key={`allowance-${index}`} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 items-end p-3">
                    <div className="md:col-span-1">
                      <label className="block text-sm text-gray-600 mb-1">Type</label>
                      <select
                        name="type"
                        value={allowance.type}
                        onChange={(e) => handleAllowanceChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                        required
                      >
                        <option value="">Select Type</option>
                        {allowanceTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-gray-600 mb-1">Current Value</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BsCurrencyDollar className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="currentSalary"
                          value={allowance.currentSalary}
                          placeholder="currentSalary"
                          onChange={(e) => handleAllowanceChange(index, e)}
                          className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-gray-600 mb-1">New Value</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BsCurrencyDollar className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="newSalary"
                          value={allowance.newSalary}
                          placeholder="New Salary"
                          onChange={(e) => handleAllowanceChange(index, e)}
                          className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={allowance.startDate}
                        onChange={(e) => handleAllowanceChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-gray-600 mb-1">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={allowance.endDate}
                        onChange={(e) => handleAllowanceChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-5 flex justify-end">
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

                {formData.allowances.length > 0 && (
                  <div className="flex justify-end mt-2">
                    <div className="text-lg font-semibold text-gray-700">
                      Total Allowances: {totalAllowances.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg text-[#333]">Deductions</h3>
                  <button
                    type="button"
                    onClick={addDeduction}
                    className="px-3 py-2 rounded-md shadow text-white flex items-center gap-1 bg-[#A294F9] hover:bg-[#8a7ce0] transition"
                  >
                    <FiPlus size={16} />
                    Add Deduction
                  </button>
                </div>

                {formData.deductions.map((deduction, index) => (
                  <div key={`deduction-${index}`} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 items-end p-3">
                    <div className="md:col-span-1">
                      <label className="block text-sm text-gray-600 mb-1">Type</label>
                      <select
                        name="type"
                        value={deduction.type}
                        onChange={(e) => handleDeductionChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                        required
                      >
                        <option value="">Select Type</option>
                        {deductionTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-gray-600 mb-1">Current Value</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BsCurrencyDollar className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="currentSalary"
                          value={deduction.currentSalary}
                          placeholder="Amount"
                          onChange={(e) => handleDeductionChange(index, e)}
                          className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-gray-600 mb-1">New Value</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BsCurrencyDollar className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="newSalary"
                          value={deduction.newSalary}
                          placeholder="New Salary"
                          onChange={(e) => handleDeductionChange(index, e)}
                          className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={deduction.startDate}
                        onChange={(e) => handleDeductionChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-gray-600 mb-1">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={deduction.endDate}
                        onChange={(e) => handleDeductionChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeDeduction(index)}
                        className="p-2 rounded-md shadow cursor-pointer bg-[#F87171] hover:bg-[#ef4444] transition"
                      >
                        <FaTrash className="text-white" />
                      </button>
                    </div>
                  </div>
                ))}

                {formData.deductions.length > 0 && (
                  <div className="flex justify-end mt-2">
                    <div className="text-lg font-semibold text-gray-700">
                      Total Deductions: {totalDeductions.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg mt-6 mb-4 border border-gray-300 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Net Salary:</span>
                  <span className="font-bold text-xl text-[#A294F9]">
                    {totalSalary.toFixed(2)}
                  </span>
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
                Save Salary Details
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalaryForm;