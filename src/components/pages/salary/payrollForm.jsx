import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiList, FiPlus, FiTrash2 } from "react-icons/fi";
import PayrollService from "../../../services/PayrollService";
import { toast } from 'react-toastify';
import EmploySalaryService from "../../../services/EmploySalaryService";
import { FaTrashAlt } from "react-icons/fa";

const allowanceTypes = [
  { value: "Housing", label: "Housing Allowance" },
  { value: "Transport", label: "Transport Allowance" },
  { value: "Medical", label: "Medical Allowance" },
  { value: "Bonus", label: "Bonus" },
  { value: "Other", label: "Other Allowance" },
];

const deductionTypes = [
  { value: "Tax", label: "Income Tax" },
  { value: "Insurance", label: "Health Insurance" },
  { value: "Loan", label: "Loan Payment" },
  { value: "ProvidentFund", label: "Provident Fund" },
  { value: "Late", label: "Late Deduction" },
  { value: "Other", label: "Other Deduction" },
];

const salaryTypes = [
  { value: "monthly", label: "Monthly" },
  { value: "hourly", label: "Hourly" },
];

const PayrollForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [salaries, setSalaries] = useState([]);
  const [totalSalary, setTotalSalary] = useState(0);
  const [totalAllowances, setTotalAllowances] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    salaryType: "monthly",
    salaryAmount: "",
    allowances: [{ type: "", amount: "" }],
    deductions: [{ type: "", amount: "" }],
  });

  useEffect(() => {
    fetchSalaries();
  }, []);

  useEffect(() => {
    if (id) {
      PayrollService.getPayrollById(id)
        .then((response) => {
          const salaryData = response;
          const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };
          setFormData({
            employeeId: salaryData.employeeId?._id || '',
            firstName: salaryData.employeeId?.firstName || '',
            lastName: salaryData.employeeId?.lastName || '',
            profilePicture: salaryData.employeeId?.profilePicture || '',
            salaryAmount: salaryData.salaryAmount || '',
            salaryType: salaryData.salaryType || '',
            totalSalary: salaryData.totalSalary || '',
            date: formatDateForInput(salaryData.date),
            allowances: salaryData.allowances || [],
            deductions: salaryData.deductions || [],
          });
          // Set the selected employee for display
          if (salaryData.employeeId) {
            setSelectedEmployee(salaryData.employeeId);
          }
        })
        .catch((error) => {
          console.error('Error fetching salary data:', error);
          toast.error('Failed to load salary data');
        });
    }
  }, [id]);

  useEffect(() => {
    calculateTotals();
  }, [formData]);

  const fetchSalaries = () => {
    EmploySalaryService.getSalary()
      .then((response) => {
        setSalaries(response);
      })
      .catch((error) => {
        console.error("Error fetching salaries:", error);
        toast.error("Failed to load salary data");
      });
  };

  const handleEmployeeSelect = (e) => {
    const employeeId = e.target.value;
    const selectedSalary = salaries.find(s => s.employeeId._id === employeeId);
    if (selectedSalary) {
      setSelectedEmployee(selectedSalary.employeeId);
      setFormData({
        ...formData,
        employeeId: employeeId,
        salaryAmount: selectedSalary.salaryAmount || '',
        salaryType: selectedSalary.salaryType || 'monthly'
      });
    }
  };

  const calculateTotals = () => {
    let allowancesTotal = 0;
    formData.allowances.forEach((allowance) => {
      allowancesTotal += Number(allowance.amount) || 0;
    });
    setTotalAllowances(allowancesTotal);
    let deductionsTotal = 0;
    formData.deductions.forEach((deduction) => {
      deductionsTotal += Number(deduction.amount) || 0;
    });
    setTotalDeductions(deductionsTotal);
    const baseSalary = Number(formData.salaryAmount) || 0;
    const total = baseSalary + allowancesTotal - deductionsTotal;
    setTotalSalary(total);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAllowanceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedAllowances = [...formData.allowances];
    updatedAllowances[index][name] = value;
    setFormData({ ...formData, allowances: updatedAllowances });
  };

  const handleDeductionChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDeductions = [...formData.deductions];
    updatedDeductions[index][name] = value;
    setFormData({ ...formData, deductions: updatedDeductions });
  };

  const addAllowance = () => {
    setFormData({
      ...formData,
      allowances: [...formData.allowances, { type: "", amount: "" }],
    });
  };

  const addDeduction = () => {
    setFormData({
      ...formData,
      deductions: [...formData.deductions, { type: "", amount: "" }],
    });
  };

  const removeAllowance = (index) => {
    const updatedAllowances = formData.allowances.filter((_, i) => i !== index);
    setFormData({ ...formData, allowances: updatedAllowances });
  };

  const removeDeduction = (index) => {
    const updatedDeductions = formData.deductions.filter((_, i) => i !== index);
    setFormData({ ...formData, deductions: updatedDeductions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const salaryData = {
      employeeId: formData.employeeId,
      status: "pending",
      date: formData.date,
      salaryType: formData.salaryType,
      salaryAmount: Number(formData.salaryAmount),
      allowances: formData.allowances
        .filter(allowance => allowance.type && allowance.amount)
        .map(allowance => ({
          type: allowance.type,
          amount: Number(allowance.amount)
        })),
      deductions: formData.deductions
        .filter(deduction => deduction.type && deduction.amount)
        .map(deduction => ({
          type: deduction.type,
          amount: Number(deduction.amount)
        })),
      totalSalary: totalSalary
    };

    if (id) {
      PayrollService.updatePayroll(id, salaryData)
        .then((response) => {
          console.log('Payroll updated successfully:', response);
          toast.success('Payroll updated successfully!');
          navigate('/payslip');
        })
        .catch((error) => {
          console.error('Error updating payroll:', error);
          toast.error('Error updating payroll. Please try again.');
        });
    } else {
      PayrollService.createPayroll(salaryData)
        .then(response => {
          console.log("Payroll saved successfully:", response);
          toast.success("Payroll saved successfully!");
          navigate('/payslip');
        })
        .catch(error => {
          console.error("Error saving payroll:", error);
          toast.error("Error saving payroll. Please try again.");
        });
    }
  };

  // Get unique employees from salaries data
  const getUniqueEmployees = () => {
    const uniqueEmployees = [];
    const employeeIds = new Set();
    salaries.forEach(salary => {
      if (salary.employeeId && !employeeIds.has(salary.employeeId._id)) {
        employeeIds.add(salary.employeeId._id);
        uniqueEmployees.push(salary);
      }
    });
    return uniqueEmployees;
  };

  return (
    <div className="p-6 bg-[#F5EFFF] min-h-screen">
      <div className="py-4 px-2 flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Payroll Form</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/payslip')}
            title="List"
            className="p-2 bg-[#A294F9] rounded shadow"
          >
            <FiList className="text-white" />
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-5xl">
          <div className="flex gap-4 mb-4 w-full">
            <div className="w-1/2">
              <label className="block mb-1 font-semibold text-[#333]">Employee</label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleEmployeeSelect}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                required
              >
                <option value="">Select Employee</option>
                {getUniqueEmployees().map((salary) => (
                  <option key={salary.employeeId._id} value={salary.employeeId._id}>
                    {salary.employeeId.firstName} {salary.employeeId.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-semibold text-[#333]">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Employee Salary Information (read-only) */}
          {selectedEmployee && (
            <div className="flex gap-4 mb-4 w-full">
              <div className="w-1/2">
                <label className="block mb-1 font-semibold text-[#333]">Salary Type</label>
                <input
                  type="text"
                  value={formData.salaryType === 'monthly' ? 'Monthly' : 'Hourly'}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="w-1/2">
                <label className="block mb-1 font-semibold text-[#333]">
                  {formData.salaryType === "monthly" ? "Monthly Salary" : "Hourly Rate"}
                </label>
                <input
                  type="text"
                  value={formData.salaryAmount}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          )}

          {/* Rest of the form remains the same */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-[#333]">Allowances</h3>
              <button
                onClick={addAllowance}
                className="px-3 py-1 rounded shadow text-white flex items-center gap-1"
                style={{ backgroundColor: '#A294F9' }}
              >
                <FiPlus size={16} />
                Add Allowance
              </button>
            </div>

            {formData.allowances.map((allowance, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <select
                  name="type"
                  value={allowance.type}
                  onChange={(e) => handleAllowanceChange(index, e)}
                  className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  required
                >
                  <option value="">Select Type</option>
                  {allowanceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <div className="w-1/2">
                  <input
                    type="number"
                    name="amount"
                    value={allowance.amount}
                    placeholder="Amount"
                    onChange={(e) => handleAllowanceChange(index, e)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                    required
                  />
                </div>
                <button
                  title="Delete"
                  className="p-2 rounded shadow cursor-pointer"
                  style={{ backgroundColor: '#F87171' }}
                  onClick={() => removeAllowance(index)}
                >
                  <FaTrashAlt className="text-white" />
                </button>
              </div>
            ))}

            {/* Move the total display outside the map function */}
            {formData.allowances.length > 0 && (
              <div className="flex justify-center ml-8 mt-2">
                <div className="text-sm text-gray-600">
                  Total : {totalAllowances.toFixed(2)}
                </div>
              </div>
            )}
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-[#333]">Deductions</h3>
              <button
                onClick={addDeduction}
                className="px-3 py-1 rounded shadow text-white flex items-center gap-1"
                style={{ backgroundColor: '#A294F9' }}
              >
                <FiPlus size={16} />
                Add Deduction
              </button>
            </div>
            {formData.deductions.map((deduction, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <select
                  name="type"
                  value={deduction.type}
                  onChange={(e) => handleDeductionChange(index, e)}
                  className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  required
                >
                  <option value="">Select Type</option>
                  {deductionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="w-1/2">
                  <input
                    type="number"
                    name="amount"
                    value={deduction.amount}
                    placeholder="Amount"
                    onChange={(e) => handleDeductionChange(index, e)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                    required
                  />
                </div>
                <button
                  title="Delete"
                  className="p-2 rounded shadow cursor-pointer"
                  style={{ backgroundColor: '#F87171' }}
                  onClick={() => removeDeduction(index)}
                >
                  <FaTrashAlt className="text-white" />
                </button>
              </div>
            ))}

            {/* Move the total display outside the map function */}
            {formData.deductions.length > 0 && (
              <div className="flex justify-center ml-8 mt-2">
                <div className="text-sm text-gray-600">
                  Total : {totalDeductions.toFixed(2)}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 rounded mt-10 mb-4 border border-gray-300">
            <span className="font-semibold text-lg">Net Salary: </span>
            <span className="font-bold text-xl">{totalSalary.toFixed(2)}</span>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded shadow text-white"
              style={{ backgroundColor: '#A294F9' }}
            >
              {id ? 'Update Payroll' : 'Create Payroll'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollForm;