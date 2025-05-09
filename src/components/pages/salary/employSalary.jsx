import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiList, FiPlus, FiTrash2 } from "react-icons/fi";
import employeeService from "../../../services/employeeService";
import { toast } from 'react-toastify';
import EmploySalaryService from "../../../services/EmploySalaryService";

const salaryTypes = [
  { value: "monthly", label: "Monthly" },
  { value: "hourly", label: "Hourly" },
];

const EmploySalaryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employees, setEmployees] = useState([]);
  const [totalSalary, setTotalSalary] = useState(0);

  const [formData, setFormData] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    salaryType: "monthly",
    salaryAmount: "",
  });

  useEffect(() => {
    if (id) {
      EmploySalaryService.getSalaryById(id)
        .then((response) => {
          const salaryData = response;
          console.log(salaryData , "salary data");
          
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

  const fetchEmployees = () => {
  employeeService
    .getEmployee()
    .then((response) => setEmployees(response))
    .catch((error) => console.error("Error fetching employees:", error));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const salaryData = {
      employeeId: formData.employeeId,
      date: formData.date,
      salaryType: formData.salaryType,
      salaryAmount: Number(formData.salaryAmount),
    };
    console.log(salaryData , "date");
    if (id) {
      EmploySalaryService.updateSalary(id, salaryData)
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
    EmploySalaryService.createSalary(salaryData)
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

export default EmploySalaryForm;