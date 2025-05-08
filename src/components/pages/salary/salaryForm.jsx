import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiList, FiPlus, FiTrash2 } from "react-icons/fi";
import employeeService from "../../../services/employeeService";
import SalaryService from "../../../services/SalaryService";
import { toast } from 'react-toastify';

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

const SalaryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employees, setEmployees] = useState([]);
  const [totalSalary, setTotalSalary] = useState(0);
  const [totalAllowances, setTotalAllowances] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);

  const [formData, setFormData] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    salaryType: "monthly",
    salaryAmount: "",
    allowances: [{ type: "", amount: "" }],
    deductions: [{ type: "", amount: "" }],
  });

  useEffect(() => {
    if (id) {
      SalaryService.getSalaryById(id)
        .then((response) => {
          const salaryData = response;
          console.log(salaryData , "salary data");
          
          // Format dates from ISO string to input-friendly format (YYYY-MM-DD)
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
            allowances: salaryData.allowances || [], // Array of objects
            deductions: salaryData.deductions || [], // Array of objects
          });
          
          if (salaryData.employeeId?.profilePicture) {
            setImageUrl(salaryData.employeeId.profilePicture);
            setImageName(salaryData.employeeId.profilePicture.split('/').pop() || 'profile');
            setUploadStatus('uploaded');
          }
          
        })
        .catch((error) => {
          console.error('Error fetching employee data:', error);
          toast.error('Failed to load employee data');
        });
    }
  }, [id]);


  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData]);

  const fetchEmployees = () => {
    employeeService
      .getEmployee()
      .then((response) => setEmployees(response))
      .catch((error) => console.error("Error fetching employees:", error));
  };

  const calculateTotals = () => {
    // Calculate allowances total
    let allowancesTotal = 0;
    formData.allowances.forEach((allowance) => {
      allowancesTotal += Number(allowance.amount) || 0;
    });
    setTotalAllowances(allowancesTotal);

    // Calculate deductions total
    let deductionsTotal = 0;
    formData.deductions.forEach((deduction) => {
      deductionsTotal += Number(deduction.amount) || 0;
    });
    setTotalDeductions(deductionsTotal);

    // Calculate total salary
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
    
    // Construct the salary data object
    const salaryData = {
      employeeId: formData.employeeId,
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
    console.log(salaryData , "date");
    if (id) {
      SalaryService.updateSalary(id, salaryData)
        .then((response) => {
          console.log('Salary updated successfully:', response);
          toast.success('Salary updated successfully!');
          navigate('/Salary');
        })
        .catch((error) => {
          console.error('Error updating employee:', error);
          toast.error('Error updating employee. Please try again.');
        });
    } else {
    SalaryService.createSalary(salaryData)
      .then(response => {
        console.log("Salary saved successfully:", response);
        toast.success("Salary saved successfully!");
        // Navigate to the salary list page or any other page as needed
        navigate('/salary');
      })
      .catch(error => {
        console.error("Error saving salary:", error);
        toast.error("Error saving salary. Please try again.");
      });
    }
  };

  return (
    <div className="p-6 bg-[#F5EFFF] min-h-screen">
      <div className="py-4 px-2 flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Salary Form</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/salary')}
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
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName}
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
              />
            </div>
          </div>
          <div className="flex gap-4 mb-4 w-full">
            <div className="w-1/2">
              <label className="block mb-1 font-semibold text-[#333]">Salary Type</label>
              <select
                name="salaryType"
                value={formData.salaryType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
              >
                {salaryTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-semibold text-[#333]">
                {formData.salaryType === "monthly" ? "Monthly Salary" : "Hourly Rate"}
              </label>
              <input
                type="number"
                name="salaryAmount"
                value={formData.salaryAmount}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
              />
            </div>
          </div>
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
                >
                  <option value="">Select Type</option>
                  {allowanceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="amount"
                  value={allowance.amount}
                  placeholder="Amount"
                  onChange={(e) => handleAllowanceChange(index, e)}
                  className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                />
                <button
                  onClick={() => removeAllowance(index)}
                  className="p-2 text-red-500 hover:text-red-700 transition"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
            <div className="p-2 rounded mt-2">
              <span className="font-semibold">Total Allowances: </span>{totalAllowances.toFixed(2)}
            </div>
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
                >
                  <option value="">Select Type</option>
                  {deductionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="amount"
                  value={deduction.amount}
                  placeholder="Amount"
                  onChange={(e) => handleDeductionChange(index, e)}
                  className="w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                />
                <button
                  onClick={() => removeDeduction(index)}
                  className="p-2 text-red-500 hover:text-red-700 transition"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
            <div className="p-2 rounded mt-2">
              <span className="font-semibold">Total Deductions: </span>{totalDeductions.toFixed(2)}
            </div>
          </div>
          <div className="p-4 rounded mb-4">
            <span className="font-semibold">Total Salary: </span>{totalSalary.toFixed(2)}
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded shadow text-white"
              style={{ backgroundColor: '#A294F9' }}
            >
              Save Salary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryForm;