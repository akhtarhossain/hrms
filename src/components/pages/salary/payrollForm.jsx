import { useState, useEffect } from 'react';
import { FiFilter, FiPlus, FiDollarSign, FiList } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaEye, FaSearch, FaFileDownload } from 'react-icons/fa';
import { Pagination } from '../../../shared/common/Pagination';
import { toast } from 'react-toastify';
import DeleteModal from '../../../shared/common/DeleteConfirmation';
import EmploySalaryService from '../../../services/EmploySalaryService';
import employeeService from '../../../services/employeeService';
import PayrollService from '../../../services/PayrollService';
import { BsCurrencyDollar } from 'react-icons/bs';
import { FaTrash } from 'react-icons/fa6';
import TransactionTypeService from '../../../services/TransactionTypeService';
import { BiX } from 'react-icons/bi';

const PayrollForm = () => {
  const navigate = useNavigate();
  const { monthYear } = useParams();

  const [month, year] = monthYear ? monthYear.split('-') : [];
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const monthNum = monthNames.indexOf(month) + 1;

  const [allowanceTypes, setAllowanceTypes] = useState([]);
  const [deductionTypes, setDeductionTypes] = useState([]);
  const [totalAllowances, setTotalAllowances] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [salaries, setSalaries] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSalaryId, setSelectedSalaryId] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [existingPayroll, setExistingPayroll] = useState(null);
  const [isExistingPayroll, setIsExistingPayroll] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    type: '',
    currentSalary: '0',
    newSalary: '',
    startDate: '',
    endDate: '',
    allowances: [],
    deductions: []
  });

  const [filters, setFilters] = useState({
    employeeName: '',
    month: '',
    year: ''
  });

  const [modalTotals, setModalTotals] = useState({
    totalAllowances: 0,
    totalDeductions: 0,
    totalSalary: 0
  });

  const calculateModalTotals = () => {
    const allowancesTotal = formData.allowances.reduce((total, allowance) => {
      return total + (Number(allowance.newSalary) || 0);
    }, 0);
    const deductionsTotal = formData.deductions.reduce((total, deduction) => {
      return total + (Number(deduction.newSalary) || 0);
    }, 0);
    const netSalary = allowancesTotal - deductionsTotal;
    setModalTotals({
      totalAllowances: allowancesTotal,
      totalDeductions: deductionsTotal,
      totalSalary: netSalary
    });
  };

  useEffect(() => {
    calculateModalTotals();
  }, [formData.allowances, formData.deductions]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payrollResponse, employees] = await Promise.all([
          PayrollService.getPayroll(),
          employeeService.getEmployee({
            firstName: filters.employeeName,
            l: pageSize,
            o: (currentPage - 1) * pageSize,
          }),
        ]);

        const allPayrolls = payrollResponse?.list || [];
        setSalaries(employees?.list || []);
        setTotalCount(employees?.count || 0);
        const payrollForThisMonth = allPayrolls.find(p =>
          `${monthNames[p.month - 1]}-${p.year}` === monthYear
        );
        if (payrollForThisMonth) {
          setExistingPayroll(payrollForThisMonth);
          setIsExistingPayroll(true);
          const employeeIds = payrollForThisMonth.employees
            ?.filter(e => e?.employeeId)
            ?.map(e => e.employeeId._id || e.employeeId) || [];
          setSelectedEmployees(employeeIds);
          setTotalAllowances(payrollForThisMonth.summary.totalAllowance);
          setTotalDeductions(payrollForThisMonth.summary.totalDeduction);
          setTotalSalary(payrollForThisMonth.summary.totalSalary);
        }
        const transactions = await TransactionTypeService.getTransactionTypes();
        const formattedAllowances = transactions?.list
          .filter(item => item.transactionType === "allowance")
          .map(item => ({
            value: item.name,
            label: item.name,
          }));

        const formattedDeductions = transactions?.list
          .filter(item => item.transactionType === "deduction")
          .map(item => ({
            value: item.name,
            label: item.name,
          }));

        setAllowanceTypes(formattedAllowances);
        setDeductionTypes(formattedDeductions);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
      }
    };

    if (month && year) {
      fetchData();
    }
  }, [monthYear, currentPage, filters.employeeName]);

  const calculateTotalAllowances = (employee) => {
    if (existingPayroll) {
      const payrollEmployee = existingPayroll.employees.find(e =>
        (e.employeeId._id || e.employeeId) === employee._id
      );
      if (payrollEmployee) {
        return payrollEmployee.allowances?.reduce((total, allowance) =>
          total + (Number(allowance?.newSalary) || 0), 0) || 0;
      }
    }
    return employee.allowances?.reduce((total, allowance) =>
      total + (Number(allowance?.newSalary) || 0), 0) || 0;
  };

  const calculateTotalDeductions = (employee) => {
    if (existingPayroll) {
      const payrollEmployee = existingPayroll.employees.find(e =>
        (e.employeeId._id || e.employeeId) === employee._id
      );
      if (payrollEmployee && payrollEmployee.deductions?.length > 0) {
        return payrollEmployee.deductions.reduce((total, deduction) => {
          return total + (Number(deduction?.newSalary) || 0);
        }, 0);
      }
    }
    if (!employee || !Array.isArray(employee.deductions)) return 0;
    return employee.deductions.reduce((total, deduction) => {
      return total + (Number(deduction?.newSalary) || 0);
    }, 0);
  };

  const calculateTotalSalary = (employee) => {
    return calculateTotalAllowances(employee) - calculateTotalDeductions(employee);
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const applyFilters = () => {
    setCurrentPage(1);
    fetchData();
  };

  const closeFilter = () => {
    setShowFilter(false);
    setFilters({
      employeeName: '',
    });
    fetchData();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (salaryId) => {
    setSelectedSalaryId(salaryId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    EmploySalaryService.deleteSalary(selectedSalaryId)
      .then(() => {
        toast.success("Salary record deleted successfully");
        setSalaries(prev => prev.filter(s => s._id !== selectedSalaryId));
      })
      .catch((error) => {
        console.error('Error deleting salary:', error);
        toast.error('Failed to delete salary record');
      })
      .finally(() => {
        setShowDeleteModal(false);
        setSelectedSalaryId(null);
      });
  };

  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      const currentPageIds = salaries.map(emp => emp._id);
      setSelectedEmployees(prev =>
        prev.filter(id => !currentPageIds.includes(id))
      );
    } else {
      const currentPageIds = salaries.map(emp => emp._id);
      setSelectedEmployees(prev => {
        const newSelection = [...prev];
        currentPageIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
    setSelectAll(!selectAll);
  };
  useEffect(() => {

    const allCurrentPageSelected = salaries.length > 0 &&
      salaries.every(emp => selectedEmployees.includes(emp._id));
    setSelectAll(allCurrentPageSelected);
  }, [selectedEmployees, salaries]);

  const calculateSelectedTotals = () => {
    const selected = salaries.filter(employee => selectedEmployees.includes(employee._id));
    return {
      totalAllowance: selected.reduce((sum, emp) => sum + calculateTotalAllowances(emp), 0),
      totalDeduction: selected.reduce((sum, emp) => sum + calculateTotalDeductions(emp), 0),
      totalSalary: selected.reduce((sum, emp) => sum + calculateTotalSalary(emp), 0),
      selectedEmployees: selected
    };
  };

  const handleEditClick = (employee, index) => {
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    let payrollEmployeeData = null;
    if (existingPayroll) {
      payrollEmployeeData = existingPayroll.employees.find(e =>
        (e.employeeId._id || e.employeeId) === employee._id
      );
    }
    const allowances = payrollEmployeeData?.allowances || employee.allowances || [];
    const deductions = payrollEmployeeData?.deductions || employee.deductions || [];

    const initialAllowances = allowances.reduce((sum, a) => sum + (Number(a.newSalary) || 0), 0);
    const initialDeductions = deductions.reduce((sum, d) => sum + (Number(d.newSalary) || 0), 0);
    const initialNet = initialAllowances - initialDeductions;

    setCurrentEmployee(employee);
    setEditIndex(index);
    setFormData({
      type: '',
      currentSalary: employee?.currentSalary?.toString() || '',
      newSalary: employee?.newSalary?.toString() || '',
      startDate: employee?.startDate || '',
      endDate: employee?.endDate || '',
      allowances: allowances.map(a => ({
        ...a,
        startDate: formatDateForInput(a.startDate),
        endDate: formatDateForInput(a.endDate)
      })) || [],
      deductions: deductions.map(d => ({
        ...d,
        startDate: formatDateForInput(d.startDate),
        endDate: formatDateForInput(d.endDate)
      })) || []
    });

    setModalTotals({
      totalAllowances: initialAllowances,
      totalDeductions: initialDeductions,
      totalSalary: initialNet
    });

    setShowEditForm(true);
    setSelectedEmployees(prev =>
      prev.includes(employee._id) ? prev : [...prev, employee._id]
    );
  };

  const handleCreatePayroll = async () => {
    if (selectedEmployees.length === 0) {
      toast.warning("Please select at least one employee");
      return;
    }
    try {
      const response = await employeeService.getEmployee({
        l: 1000,
        o: 0
      });

      const allEmployees = response?.list || [];
      const allSelectedEmployees = allEmployees.filter(emp =>
        selectedEmployees.includes(emp._id)
      );

      if (allSelectedEmployees.length === 0) {
        toast.error("No employee data found for selected employees");
        return;
      }

      const cleanAllowances = (arr) =>
        arr.map(({ type, currentSalary, newSalary, startDate, endDate }) => ({
          type,
          currentSalary: Number(currentSalary),
          newSalary: Number(newSalary),
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null
        }));

      // Prepare employee objects for the payload
      const selectedEmployeeObjects = allSelectedEmployees.map(emp => {
        let payrollEmployeeData = null;
        if (existingPayroll) {
          payrollEmployeeData = existingPayroll.employees.find(e =>
            (e.employeeId._id || e.employeeId) === emp._id
          );
        }

        const allowances = payrollEmployeeData?.allowances || emp.allowances || [];
        const deductions = payrollEmployeeData?.deductions || emp.deductions || [];

        // Create base employee object
        const employeeObj = {
          employeeId: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          totalAllowance: calculateTotalAllowances(emp),
          totalDeduction: calculateTotalDeductions(emp),
          totalSalary: calculateTotalSalary(emp),
          allowances: cleanAllowances(allowances),
          deductions: cleanAllowances(deductions)
        };

        // For updates, preserve existing fields if they exist
        if (existingPayroll && payrollEmployeeData) {
          employeeObj.status = payrollEmployeeData.status || "DRAFT";
          employeeObj.totalPaid = payrollEmployeeData.totalPaid || 0;
          if (payrollEmployeeData.payments) {
            employeeObj.payments = payrollEmployeeData.payments;
          }
        }

        return employeeObj;
      });

      const totals = selectedEmployeeObjects.reduce((acc, emp) => ({
        totalAllowance: acc.totalAllowance + emp.totalAllowance,
        totalDeduction: acc.totalDeduction + emp.totalDeduction,
        totalSalary: acc.totalSalary + emp.totalSalary
      }), { totalAllowance: 0, totalDeduction: 0, totalSalary: 0 });

      // Prepare the payroll data
      const payrollData = {
        employees: selectedEmployeeObjects,
        month: monthNum.toString(),
        year: year.toString(),
        payrollDate: new Date().toISOString(),
        status: existingPayroll ? existingPayroll.status : "DRAFT", // Preserve status if updating
        summary: {
          totalAllowance: totals.totalAllowance,
          totalDeduction: totals.totalDeduction,
          totalSalary: totals.totalSalary,
          selectedEmployees: existingPayroll
            ? existingPayroll.summary.selectedEmployees.map(emp =>
              emp._id || emp // Handle both object and ID cases
            )
            : selectedEmployees
        }
      };

      // For updates, preserve any existing fields that should remain unchanged
      // if (existingPayroll) {
      //   payrollData._id = existingPayroll._id;
      //   payrollData.createdAt = existingPayroll.createdAt;
      //   payrollData.__v = existingPayroll.__v;
      // }

      console.log("Payroll payload being sent:", payrollData);
      const result = isExistingPayroll
        ? await PayrollService.updatePayroll(existingPayroll._id, payrollData)
        : await PayrollService.createPayroll(payrollData);

      toast.success(
        isExistingPayroll
          ? `Payroll updated for ${month} ${year}`
          : `Payroll created for ${month} ${year}`
      );
      navigate('/payroll');

    } catch (error) {
      console.error("Error in handleCreatePayroll:", error);
      toast.error(error.response?.data?.message || "Failed to process payroll");
    }
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

  const addAllowance = () => {
    setFormData(prev => ({
      ...prev,
      allowances: [...prev.allowances, {
        type: "",
        currentSalary: "0",
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
        currentSalary: "0",
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

    // Update the local state only
    const updatedEmployee = {
      ...currentEmployee,
      allowances: formData.allowances.map(allowance => ({
        ...allowance,
        currentSalary: Number(allowance.currentSalary),
        newSalary: Number(allowance.newSalary)
      })),
      deductions: formData.deductions.map(deduction => ({
        ...deduction,
        currentSalary: Number(deduction.currentSalary),
        newSalary: Number(deduction.newSalary)
      })),
      currentSalary: Number(formData.currentSalary),
      newSalary: Number(formData.newSalary),
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    // Update salaries list
    const updatedSalaries = salaries.map(emp =>
      emp._id === currentEmployee._id ? updatedEmployee : emp
    );
    setSalaries(updatedSalaries);

    // Also update existingPayroll if it exists
    if (existingPayroll) {
      const updatedEmployees = existingPayroll.employees.map(emp => {
        if ((emp.employeeId._id || emp.employeeId) === currentEmployee._id) {
          return {
            ...emp,
            allowances: formData.allowances,
            deductions: formData.deductions,
            totalAllowance: modalTotals.totalAllowances,
            totalDeduction: modalTotals.totalDeductions,
            totalSalary: modalTotals.totalSalary
          };
        }
        return emp;
      });

      setExistingPayroll({
        ...existingPayroll,
        employees: updatedEmployees
      });
    }

    setShowEditForm(false);
    toast.success("Salary details updated successfully");
  };

  const closeEditModal = () => {
    setShowEditForm(false)
  }

  return (
    <>
      <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="py-4 px-2 flex justify-between items-center mb-3">
          <h2 className="text-3xl font-bold text-gray-800">Create Payroll</h2>
          <div className="flex space-x-2">
            <button
              title="filter"
              className="p-2 bg-[#A294F9] rounded shadow cursor-pointer"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FiFilter className="text-white" />
            </button>
            <button
              title="Create Salary"
              onClick={() => navigate('/employSalaryform')}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
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

        {/* Salary List Table */}
        <div className="overflow-x-auto p-3">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-600 px-2 py-1 rounded-md">
              Showing <span className="font-semibold text-gray-800">
                {(currentPage - 1) * pageSize + 1}
              </span> to <span className="font-semibold text-gray-800">
                {Math.min(currentPage * pageSize, totalCount)}
              </span> of <span className="font-semibold text-gray-800">
                {totalCount}
              </span> entries
            </div>
            <div className="mt-4 flex justify-end">
              <Pagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          </div>

          <table className="min-w-full table-auto text-sm">
            <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="form-checkbox h-4 w-4 text-[#A294F9] rounded focus:ring-[#A294F9]"
                  />
                </th>
                <th className="px-4 py-3 text-left">Profile</th>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Total Allowance</th>
                <th className="px-4 py-3 text-left">Total Deduction</th>
                <th className="px-4 py-3 text-left">Total Salary</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.length > 0 ? (
                salaries.map((employee, index) => {
                  const isSelected = selectedEmployees.includes(employee._id);
                  return (
                    <tr
                      key={employee._id}
                      className={`border-t hover:bg-[#CDC1FF] text-gray-600 ${isSelected ? 'bg-[#E5D9F2]' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleEmployeeSelection(employee._id)}
                          className="form-checkbox h-4 w-4 text-[#A294F9] rounded focus:ring-[#A294F9]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {employee?.profilePicture ? (
                          <img
                            src={employee.profilePicture}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                        ) : (
                          <span className="text-gray-400 italic">No image</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{employee.firstName} {employee.lastName}</td>
                      <td className="px-4 py-3">{calculateTotalAllowances(employee).toFixed(2)}</td>
                      <td className="px-4 py-3">{calculateTotalDeductions(employee).toFixed(2)}</td>
                      <td className="px-4 py-3 font-semibold">
                        {calculateTotalSalary(employee).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            title="Edit"
                            className="p-2 rounded shadow cursor-pointer"
                            style={{ backgroundColor: '#A294F9' }}
                            onClick={() => handleEditClick(employee, index)}
                          >
                            <FaEdit className="text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-gray-500">No salary records found</td>
                </tr>
              )}

              {/* Summary row for selected employees */}
              {selectedEmployees.length > 0 && (
                <tr className="border-t-2 border-gray-400 font-semibold" style={{ backgroundColor: '#E5D9F2' }}>
                  <td className="px-4 py-3" colSpan="3">Total for {selectedEmployees.length} selected employees</td>
                  <td className="px-4 py-3">{calculateSelectedTotals().totalAllowance.toFixed(2)}</td>
                  <td className="px-4 py-3">{calculateSelectedTotals().totalDeduction.toFixed(2)}</td>
                  <td className="px-4 py-3">{calculateSelectedTotals().totalSalary.toFixed(2)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Payroll Date and Create Button Row */}
          <div className="mt-4 flex flex-col items-end md:items-end gap-4">
            {selectedEmployees.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => navigate('/payroll')}
                  className="bg-gray-500 px-6 py-3 rounded-md shadow text-white hover:bg-gray-600  font-medium flex items-center me-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePayroll}
                  className="px-6 py-3 rounded-md shadow text-white font-medium flex items-center"
                  style={{ backgroundColor: '#A294F9' }}
                >
                  {isExistingPayroll ? 'Update' : 'Create'} Payroll for {month} {year}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />

      {showEditForm && currentEmployee && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#F5EFFF',
              padding: "30px 40px",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "1200px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="p-2 bg-[#F5EFFF] min-h-screen">
              <div className="px-2 flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Salary Form</h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Close"
                    onClick={() => setShowEditForm(false)}
                    className="p-1 rounded shadow cursor-pointer"
                    style={{ backgroundColor: '#A294F9', color: 'white' }}
                  >
                    <BiX size={20} />
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="p-8 w-full max-w-6xl">
                  <form>
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
                          <div
                            key={`allowance-${index}`}
                            className="flex flex-wrap md:flex-nowrap items-end gap-3 mb-3 p- rounded-md"
                          >
                            <div className="flex-1 min-w-[150px]">
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
                                  <option key={type.index} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex-1 min-w-[130px]">
                              <label className="block text-sm text-gray-600 mb-1">Current Value</label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <BsCurrencyDollar className="text-gray-400" />
                                </div>
                                <input
                                  type="number"
                                  name="currentSalary"
                                  value={allowance.currentSalary}
                                  placeholder="Current Salary"
                                  onChange={(e) => handleAllowanceChange(index, e)}
                                  className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                                  required
                                />
                              </div>
                            </div>

                            <div className="flex-1 min-w-[130px]">
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

                            <div className="flex-1 min-w-[130px]">
                              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                              <input
                                type="date"
                                name="startDate"
                                value={allowance.startDate}
                                onChange={(e) => handleAllowanceChange(index, e)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                              />
                            </div>

                            <div className="flex-1 min-w-[130px]">
                              <label className="block text-sm text-gray-600 mb-1">End Date</label>
                              <input
                                type="date"
                                name="endDate"
                                value={allowance.endDate}
                                onChange={(e) => handleAllowanceChange(index, e)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                              />
                            </div>

                            <div className="flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => removeAllowance(index)}
                                className="p-2 mb-1 rounded-md shadow cursor-pointer bg-[#F87171] hover:bg-[#ef4444] transition"
                              >
                                <FaTrash className="text-white" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {formData.allowances.length > 0 && (
                          <div className="flex justify-end mt-2">
                            <div className="text-lg font-semibold text-gray-700">
                              Total Allowances: {modalTotals.totalAllowances.toFixed(2)}
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
                          <div key={`deduction-${index}`}
                            className="flex flex-wrap md:flex-nowrap items-end gap-3 mb-3 p- rounded-md">
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
                                  <option key={type.index} value={type.value}>
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

                            <div className="md:col-span-1 flex justify-center">
                              <button
                                type="button"
                                onClick={() => removeDeduction(index)}
                                className="p-2  mb-2 rounded-md shadow cursor-pointer bg-[#F87171] hover:bg-[#ef4444] transition"
                              >
                                <FaTrash className="text-white" />
                              </button>
                            </div>
                          </div>
                        ))}


                        {formData.deductions.length > 0 && (
                          <div className="flex justify-end mt-2">
                            <div className="text-lg font-semibold text-gray-700">
                              Total Deductions: {modalTotals.totalDeductions.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-lg mt-6 mb-4 border border-gray-300 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg">Net Salary:</span>
                          <span className="font-bold text-xl text-[#A294F9]">
                            {modalTotals.totalSalary.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-8">
                      <button
                        type="button"
                        onClick={() => closeEditModal()}
                        className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 transition me-4"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#A294F9] text-white px-5 py-2 rounded-md hover:bg-[#8a7ce0] transition"
                        onClick={handleSubmit}
                      >
                        Save Salary Details
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PayrollForm;