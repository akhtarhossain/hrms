
import React, { useEffect, useState } from 'react';
import { FiDownload, FiUpload, FiPlus, FiList, FiFilter, FiDelete } from 'react-icons/fi';
import { BsPerson, BsTelephone, BsBriefcase, BsBook, BsFileEarmarkText, BsCurrencyDollar } from 'react-icons/bs';
import { useNavigate, useParams } from 'react-router-dom';
import employeeService from '../../../services/employeeService';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaDownload, FaTrash } from 'react-icons/fa6';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import TransactionTypeService from '../../../services/TransactionTypeService';
import LeavePolicyService from '../../../services/LeavePolicyService';

const EmployeeForm = () => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [documentList, setDocumentList] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editIndexDoc, setEditIndexDoc] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imageName, setImageName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [DocuUrl, setDocuUrl] = useState('');
  const [institute, setInstitute] = useState('');
  const [yearOfPassing, setYearOfPassing] = useState('');
  const [gradePercentage, setGradePercentage] = useState('');
  const [educationType, setEducationType] = useState('');
  const [documentUploadStatus, setDocumentUploadStatus] = useState('idle');
  const [documentName, setDocumentName] = useState('');
  const [totalAllowances, setTotalAllowances] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [allowanceTypes, setAllowanceTypes] = useState([]);
  const [deductionTypes, setDeductionTypes] = useState([]);
  const [leavePoliciesData, setLeavePoliciesData] = useState([]); 
  

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fatherOrHusbandName: '',
    gender: '',
    cnic: '',
    maritalStatus: '',
    nationality: '',
    mobileNumber: '',
    email: '',
    country: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactMobile: '',
    permanentAddress: '',
    city: '',
    employeeId: '',
    department: '',
    designation: '',
    dateOfJoining: '',
    employmentType: '',
    employeeStatus: '',
    leavePolicy:'', 
    degreeTitle: '',
    certificates: [],
    educations: [],
    dateOfBirth: '',
    profilePicture: '',
    allowances: [{ type: "", amount: "" , currentSalary: "0" }],
    deductions: [{ type: "", amount: "" , currentSalary: "0" }],
  });

  const [educationList, setEducationList] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  countries.registerLocale(enLocale);
  const countryOptions = Object.entries(countries.getNames('en', { select: 'official' })).map(
    ([code, name]) => ({ value: code, label: name })
  );

  const fetchTransactions = () => {
    TransactionTypeService.getTransactionTypes()
      .then((data) => {
        const transactions = data?.list || [];
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
  
  useEffect(() => {
    fetchTransactions();
  }, []);

useEffect(() => {
 LeavePolicyService.getLeavePolicies()
    .then(response => {
        console.log("Leave Policies Response:", response.list);
        setLeavePoliciesData(response.list || []);
    })
    .catch(error => {
        console.error('Error fetching leave policies:', error);
        toast.error('Failed to load leave policies');
    });

  if (id) {
    employeeService.getEmployeeById(id)
      .then((response) => {
        const employeeData = response;

        // Function to format date for input fields (YYYY-MM-DD)
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        setFormData({
          firstName: employeeData.firstName || '',
          lastName: employeeData.lastName || '',
          fatherOrHusbandName: employeeData.fatherOrHusbandName || '',
          gender: employeeData.gender || '',
          cnic: employeeData.cnic || '',
          maritalStatus: employeeData.maritalStatus || '',
          nationality: employeeData.nationality || '',
          mobileNumber: employeeData.mobileNumber || '',
          email: employeeData.email || '',
          country: employeeData.country || '',
          emergencyContactName: employeeData.emergencyContactName || '',
          emergencyContactRelation: employeeData.emergencyContactRelation || '',
          emergencyContactMobile: employeeData.emergencyContactMobile || '',
          permanentAddress: employeeData.permanentAddress || '',
          city: employeeData.city || '',
          employeeId: employeeData.employeeId || '',
          department: employeeData.department || '',
          designation: employeeData.designation || '',
          dateOfJoining: formatDateForInput(employeeData.dateOfJoining),
          employmentType: employeeData.employmentType || '',
          employeeStatus: employeeData.employeeStatus || '',
          leavePolicy: employeeData.leavePolicy || '',
          degreeTitle: employeeData.degreeTitle || '',
          bankName: employeeData.bankName || '',
          accountTitle: employeeData.accountTitle || '',
          accountNumber: employeeData.accountNumber || '',
          certificates: employeeData.certificates || [],
          educations: employeeData.educations || [],
          dateOfBirth: formatDateForInput(employeeData.dateOfBirth),
          profilePicture: employeeData.profilePicture || '',
          
          allowances: employeeData.allowances?.map(allowance => ({
            ...allowance,
            startDate: formatDateForInput(allowance.startDate),
            endDate: formatDateForInput(allowance.endDate)
          })) || [],

          deductions: employeeData.deductions?.map(deduction => ({
            ...deduction,
            startDate: formatDateForInput(deduction.startDate),
            endDate: formatDateForInput(deduction.endDate)
          })) || []
        });

        // Handle education list
        if (employeeData.educations && employeeData.educations.length > 0) {
          setEducationList(employeeData.educations);
        }

        // Handle document list
        if (employeeData.certificates && employeeData.certificates.length > 0) {
          setDocumentList(employeeData.certificates.map(doc => ({
            type: doc.type,
            fileUrl: doc.fileUrl,
            file: { name: doc.fileUrl?.split('/').pop() || 'document' }
          })));
        }

        // Handle profile picture
        if (employeeData.profilePicture) {
          setImageUrl(employeeData.profilePicture);
          setImageName(employeeData.profilePicture.split('/').pop() || 'profile');
          setUploadStatus('uploaded');
        }
      })
      .catch((error) => {
        console.error('Error fetching employee data:', error);
        toast.error('Failed to load employee data');
      });
  }
}, [id]);


  const requiredFields = {
    1: ['firstName', 'lastName', 'fatherOrHusbandName', 'dateOfBirth', 'gender', 'cnic', 'maritalStatus', 'nationality'],
    2: ['mobileNumber', 'email', 'country', 'permanentAddress', 'city', 'emergencyContactName', 'emergencyContactRelation', 'emergencyContactMobile'],
    3: ['employeeId', 'department', 'designation', 'dateOfJoining',
      'employmentType', 'employeeStatus','leavePolicy','bankName' , 'accountTitle' , 'accountNumber'],
    4: ['educations'],
    6: ['certificates'],
  };

  const handleNext = () => {
    if (!isStepValid()) return;
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files && files[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          [name]: file,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: null,
    }));
  };

const isStepValid = () => {
  const fields = requiredFields[step] || [];
  let valid = true;
  const newErrors = {};

  for (const field of fields) {
    if (field === 'certificates') {
      if (!documentList || documentList.length === 0) {
        valid = false;
        newErrors[field] = 'At least one certificate is required';
      } else {
        documentList.forEach((item, index) => {
          if (!item.type || !item.fileUrl) {
            valid = false;
            if (!newErrors[field]) newErrors[field] = {};
            newErrors[field][index] = {
              ...(item.type ? {} : { type: 'Type is required' }),
              ...(item.fileUrl ? {} : { fileUrl: 'File URL is required' }),
            };
          }
        });
      }
    } else if (field === 'educations') {
      if (!educationList || educationList.length === 0) {
        valid = false;
        newErrors[field] = 'At least one education entry is required';
      toast.error("Please add one item")
      } else {
        educationList.forEach((item, index) => {
          const eduErrors = {};
          if (!item.educationType) eduErrors.educationType = 'Education Type is required';
          if (!item.institute) eduErrors.institute = 'Institute is required';
          if (!item.yearOfPassing) eduErrors.yearOfPassing = 'Year of Passing is required';
          if (!item.gradePercentage) eduErrors.gradePercentage = 'Grade % is required';

          if (Object.keys(eduErrors).length > 0) {
            valid = false;
            if (!newErrors[field]) newErrors[field] = {};
            newErrors[field][index] = eduErrors;
          }
        });
      }
    } else {
      const value = formData[field]; // Replace this line depending on how you store values
      if (!value || value === '') {
        valid = false;
        newErrors[field] = `${field} is required`;
      }
    }
  }

  setErrors(newErrors);
  return valid;
};

const handleSubmit = (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  const fields = requiredFields[step] || [];
  let valid = true;
  const newErrors = {};

  for (const field of fields) {
    if (field === 'certificates') {
      if (!documentList || documentList.length === 0) {
        valid = false;
        toast.error('Please add at least one certificate.');
        newErrors[field] = 'At least one certificate is required';
      } else {
        documentList.forEach((item, index) => {
          if (!item.type || !item.fileUrl) {
            valid = false;
            if (!newErrors[field]) newErrors[field] = {};
            newErrors[field][index] = {
              ...(item.type ? {} : { type: 'Type is required' }),
              ...(item.fileUrl ? {} : { fileUrl: 'File URL is required' }),
            };
          }
        });
      }
    } else {
      const value = formData[field];
      if (!value || value === '') {
        valid = false;
        newErrors[field] = `${field} is required`;
      }
    }
  }

  setErrors(newErrors);

  if (!valid) return; // 💥 Stop here if invalid

  const finalData = {
    ...formData,
    educations: educationList,
    certificates: documentList,
    profilePicture: imageUrl,
    totalValue: String(totalSalary),
  };

  console.log(finalData, 'final data');

  if (id) {
    employeeService.updateEmployee(id, finalData)
      .then((response) => {
        console.log('Employee updated successfully:', response);
        toast.success('Employee updated successfully!');
        navigate('/employees');
      })
      .catch((error) => {
        console.error('Error updating employee:', error);
        toast.error('Error updating employee. Please check fields.');
        toast.error('EmployeeId already exist');
        setIsSubmitting(false);
      });
  } else {
    employeeService.createEmployee(finalData)
      .then((response) => {
        console.log('Employee created successfully:', response);
        toast.success('Employee created successfully!');
        navigate('/employees');
        setIsSubmitting(false);
      })
      .catch((error) => {
        console.error('Error creating employee:', error);
        if (
          error.response &&
          error.response.data &&
          error.response.status === 400
        ) {
          toast.error('Employee ID already exists!');
        } else {
          toast.error('Error creating employee. Please check fields.');
        }
      });
  }
};

const renderInput = (label, name, type = 'text', placeholder = '', onChangeHandler = null) => {
  if (name === 'country') {
    return (
      <div className="w-full md:w-1/2 px-2 mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        >
          <option value="">Select Nationality</option>
          {countryOptions.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  }

  if (name === 'nationality') {
    return (
      <div className="w-full md:w-1/2 px-2 mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        >
          <option value="">Select Nationality</option>
          <option value="Pakistani">Pakistani</option>
          <option value="Indian">Indian</option>
          <option value="Bangladeshi">Bangladeshi</option>
          <option value="Afghan">Afghan</option>
          <option value="American">American</option>
          <option value="British">British</option>
          <option value="Canadian">Canadian</option>
          <option value="Chinese">Chinese</option>
          <option value="German">German</option>
          <option value="Other">Other</option>
        </select>
        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  }

  if (name === 'emergencyContactRelation') {
    return (
      <div className="w-full md:w-1/2 px-2 mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        >
          <option value="">Select Relation</option>
          <option value="Father">Father</option>
          <option value="Mother">Mother</option>
          <option value="Brother">Brother</option>
          <option value="Uncle">Uncle</option>
          <option value="Friend">Friend</option>
        </select>
        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  }

  if (name === 'gender') {
    return (
      <div className="w-full md:w-1/2 px-2 mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  }

  if (name === 'maritalStatus') {
    return (
      <div className="w-full md:w-1/2 px-2 mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        >
          <option value="">Select Marital Status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
          <option value="Widowed">Widowed</option>
        </select>
        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  }

  if (name === 'employmentType') {
    return (
      <div className="w-full md:w-1/2 px-2 mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        >
          <option value="">Select Employment Type</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contractual">Contractual</option>
          <option value="Internship">Internship</option>
        </select>
        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  }
if (name === 'leavePolicy') {
  return (
    <div className="w-full md:w-1/2 px-2 mb-4" key={name}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <select
        name={name}
        value={formData[name]} // This should store the selected _id
        onChange={handleChange}
        className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
      >
        <option value="">Select Leave Policy</option>
        {leavePoliciesData.map(policy => (
          <option key={policy._id} value={policy._id}>
            {policy.title}
          </option>
        ))}
      </select>
      {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );
}
  if (name === 'employeeStatus') {
    return (
      <div className="w-full md:w-1/2 px-2 mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        >
          <option value="">Select Employee Status</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Resigned">Resigned</option>
          <option value="Terminated">Terminated</option>
        </select>
        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  }

  if (name === 'educationType') {
    return (
      <div className="w-full md:w-1/2 px-2 mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <select
          name={name}
          value={educationType}
          onChange={(e) => setEducationType(e.target.value)}
          className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        >
          <option value="">Select Education Type</option>
          <option value="Matriculation">Matriculation</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Bachelor">Bachelor</option>
          <option value="Graduate">Graduate</option>
          <option value="Master">Master</option>
          <option value="Post Graduate">Post Graduate</option>
        </select>
        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  }

  if (name === 'institute') {
    return (
      <div className="w-full md:w-1/2 px-2 mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name={name}
          placeholder="Institute Name"
          value={institute}
          onChange={(e) => setInstitute(e.target.value)}
          className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        />
        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  }

  if (name === 'yearOfPassing') {
    return (
      <div className="w-full md:w-1/2 px-2 mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name={name}
          placeholder="Year of Passing"
          value={yearOfPassing}
          onChange={(e) => setYearOfPassing(e.target.value)}
          className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        />
        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  }

  if (name === 'gradePercentage') {
    return (
      <div className="w-full md:w-1/2 px-2 mb-4" key={name}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name={name}
          placeholder="Grade Percentage"
          value={gradePercentage}
          onChange={(e) => setGradePercentage(e.target.value)}
          className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        />
        {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
      </div>
    );
  }

  if (name === 'cnic') {
    return (
      <div className="w-full sm:w-1/2 px-2 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">CNIC / National ID Number</label>
        <input
          type="text"
          value={formData.cnic}
          onChange={handleCnicChange}
          className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
          placeholder="XXXXX-XXXXXXX-X"
          maxLength={15}
        />
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/2 px-2 mb-4" key={name}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={type !== 'file' ? formData[name] || '' : undefined}
        onChange={handleChange}
        className={`w-full px-4 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300`}
      />
      {errors[name] && <p className="text-sm text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );
};

const steps = [
  { label: 'Basic Info', icon: <BsPerson size={20} onClick={() => handleStepClick(0)} /> },
  { label: 'Contact', icon: <BsTelephone size={20} onClick={() => handleStepClick(1)} /> },
  { label: 'Employment', icon: <BsBriefcase size={20} onClick={() => handleStepClick(2)} /> },
  { label: 'Education', icon: <BsBook size={20} onClick={() => handleStepClick(3)} /> },
  { label: 'Salary', icon: <BsCurrencyDollar size={20} onClick={() => handleStepClick(4)} /> },
  { label: 'Documents', icon: <BsFileEarmarkText size={20} onClick={() => handleStepClick(5)} /> },
];

const handleStepClick = (index) => {
  setStep(index + 1); 
};

const handleFileUpload = async (e) => {
  const file = e.target?.files?.[0] || e;
  if (!file) return;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4', 'video/3gp', 'text/srt'];
  if (!allowedTypes.includes(file.type)) {
    toast.error('File type not supported. Allowed: jpg, jpeg, png, webp, mp4, 3gp, srt.');
    return;
  }
  setImageName(file.name);
  setUploadStatus('uploading');
  try {
    const projectData = {
      name: file.name,
      access: "public-read",
    };
    const response = await employeeService.uploadImage(projectData);
    if (response?.message && Array.isArray(response.message)) {
      response.message.forEach((msg) => toast.error(msg));
      setUploadStatus('idle');
      return;
    }
    const uploadUrl = response.location;
    if (!uploadUrl) {
      toast.error("No upload URL received.");
      setUploadStatus('idle');
      return;
    }
    const source = axios.CancelToken.source();
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
        "x-amz-acl": "public-read",
      },
      cancelToken: source.token,
      onUploadProgress: (progressEvent) => {
        const total = progressEvent.total ?? 1;
        const percent = Math.round((progressEvent.loaded * 100) / total);
      }
    });
    const trimmedUrl = uploadUrl.split("?")[0];
    setImageUrl(trimmedUrl);
    setUploadStatus('uploaded');
    toast.success("File uploaded successfully!");
    setFormData((prev) => ({
      ...prev,
      profilePicture: trimmedUrl,
    }));
  } catch (err) {
    if (axios.isCancel(err)) {
      console.log("Upload cancelled:", err.message);
    } else {
      console.error("Upload failed:", err);
      toast.error("Upload failed! Please try again.");
    }
    setUploadStatus('idle');
  }
};

const handleAddEducation = () => {
  if (!institute || !yearOfPassing || !gradePercentage || !educationType) {
    toast.error('Please fill all education fields before adding.');
    return;
  }

  const newEducation = {
    institute,
    yearOfPassing,
    gradePercentage,
    educationType
  };

  if (isEditing && editIndex !== null) {
    const updatedList = [...educationList];
    updatedList[editIndex] = newEducation;
    setEducationList(updatedList);
    setIsEditing(false);
    setEditIndex(null);
  } else {
    setEducationList((prevList) => [...prevList, newEducation]);
  }

  setInstitute('');
  setYearOfPassing('');
  setGradePercentage('');
  setEducationType('');
};

const handleDeleteEducation = (index) => {
  const newList = [...educationList];
  newList.splice(index, 1);
  setEducationList(newList);
  toast.success("Education deleted successfully!");
};

const handleEditEducation = (index) => {
  const edu = educationList[index];
  setInstitute(edu.institute);
  setYearOfPassing(edu.yearOfPassing);
  setGradePercentage(edu.gradePercentage);
  setEducationType(edu.educationType);
  setIsEditing(true);
  setEditIndex(index);
};

const handleDocumentUpload = async (e) => {
  const file = e.target?.files?.[0];
  if (!file) return;
  setDocumentName('');
  setDocumentUploadStatus('uploading');
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp',
    'image/jpg', 'video/mp4', 'video/3gpp', 'text/srt',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    toast.error('File type not supported.');
    setDocumentUploadStatus('idle');
    return;
  }

  try {
    setDocumentName(file.name);
    const projectData = { name: file.name, access: "public-read" };
    const response = await employeeService.uploadDocument(projectData);

    if (response?.message && Array.isArray(response.message)) {
      response.message.forEach((msg) => toast.error(msg));
      setDocumentUploadStatus('idle');
      return;
    }

    const uploadUrl = response.location;
    if (!uploadUrl) {
      toast.error("No upload URL received.");
      setDocumentUploadStatus('idle');
      return;
    }

    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
        "x-amz-acl": "public-read",
      }
    });

    const trimmedDOCUrl = uploadUrl.split("?")[0];
    setDocuUrl(trimmedDOCUrl);
    setImageName(file.name);
    setUploadedFile(file);
    setDocumentUploadStatus('uploaded');
    toast.success("Document uploaded successfully!");
  } catch (err) {
    console.error("Upload failed:", err);
    setDocumentUploadStatus('idle');
    toast.error("Upload failed! Please try again.");
  } finally {
    e.target.value = '';
  }
};

const handleAddDocument = () => {
  if (!selectedDocType || !uploadedFile || !DocuUrl) {
    toast.error("Please select document type and upload a document.");
    return;
  }

  const newDocument = {
    type: selectedDocType,
    file: uploadedFile,
    fileUrl: DocuUrl,
  };

  if (isEditingDoc && editIndexDoc !== null) {
    const updatedList = [...documentList];
    updatedList[editIndexDoc] = newDocument;
    setDocumentList(updatedList);
    setIsEditingDoc(false);
    setEditIndexDoc(null);
  } else {
    setDocumentList(prevList => [...prevList, newDocument]);
  }

  setSelectedDocType('');
  setImageName('');
  setUploadedFile(null);
  setDocuUrl('');
};

const handleDeleteDocument = (index) => {
  const updatedList = documentList.filter((_, i) => i !== index);
  setDocumentList(updatedList);
};

const handleEditDocuments = (index) => {
  const doc = documentList[index];
  setSelectedDocType(doc.type);
  setUploadedFile(doc.file);
  setIsEditingDoc(true);
  setEditIndexDoc(index);
};

const handleDownloadEducation = async (index) => {
  const edu = documentList[index];
  if (!edu || !edu.fileUrl || !edu.type) return;
  try {
    const response = await fetch(edu.fileUrl);
    const blob = await response.blob();
    const extension = edu.type.split('/')[1] || 'file';
    const fileName = `document-${index + 1}.${extension}`;
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    toast.error('File download failed', error);
  }
};

const handleCnicChange = (e) => {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 13) value = value.slice(0, 13);
  let formatted = value;
  if (value.length > 5 && value.length <= 12) {
    formatted = `${value.slice(0, 5)}-${value.slice(5)}`;
  } else if (value.length > 12) {
    formatted = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12)}`;
  }
  setFormData(prev => ({ ...prev, cnic: formatted }));
};
const addAllowance = () => {
  setFormData({
    ...formData,
    allowances: [...formData.allowances, { type: "", amount: "" , currentSalary: "0" }],
  });
};

const addDeduction = () => {
  setFormData({
    ...formData,
    deductions: [...formData.deductions, { type: "", amount: "" , currentSalary: "0"}],
  });
};
const calculateTotals = () => {
  let allowancesTotal = 0;
  let deductionsTotal = 0;

  (formData?.allowances || []).forEach((allowance) => {
    const amount = Number(allowance?.amount) || 0;
    const newSalary = Number(allowance?.newSalary) || 0;
    allowancesTotal += amount + newSalary;
  });
  (formData?.deductions || []).forEach((deduction) => {
    const amount = Number(deduction?.amount) || 0;
    const newSalary = Number(deduction?.newSalary) || 0;
    deductionsTotal += amount + newSalary;
  });
  const total = allowancesTotal - deductionsTotal;
  setTotalAllowances(allowancesTotal);
  setTotalDeductions(deductionsTotal);
  setTotalSalary(total);
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

useEffect(() => {
  if (formData) {
    if (formData.allowances?.length || formData.deductions?.length) {
      calculateTotals(formData);
    }
  }
}, [formData]);


const removeAllowance = (index) => {
  const updatedAllowances = formData.allowances.filter((_, i) => i !== index);
  setFormData({ ...formData, allowances: updatedAllowances });
};

const removeDeduction = (index) => {
  const updatedDeductions = formData.deductions.filter((_, i) => i !== index);
  setFormData({ ...formData, deductions: updatedDeductions });
};
  return (
    <div className="p-6 bg-[#F5EFFF] min-h-screen">
      <div className="py-4 px-2 flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Employees Form</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/employees')}
            title="List"
            className="p-2 bg-[#A294F9] rounded shadow">
            <FiList className="text-white" />
          </button>
        </div>
      </div>
     <div className="relative flex flex-col items-center mb-8 px-4">
        <div className="w-full max-w-6xl relative">
          <div
            className="absolute top-5 h-1 bg-gray-300 z-10 hidden sm:block"
            style={{
              left: '6vw',
              right: '6vw',
            }}
          ></div>
          
          <div
            className="absolute top-5 h-1 bg-[#A294F9] z-10 transition-all duration-500 hidden sm:block"
            style={{
              left: '6vw',
              width: step === steps.length 
                ? 'calc(100% - 12vw)' // Full width when on last step
                : `calc(${(step / steps.length) * 100}% - 12vw)`, // Proportional width for other steps
              maxWidth: 'calc(100% - 12vw)',
            }}
          ></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center relative z-20 space-y-4 sm:space-y-0 sm:space-x-4">
            {steps.map((s, index) => (
              <div
                key={index}
                className="flex flex-col items-center flex-1 sm:flex-auto"
                style={{
                  minWidth: index === 0 || index === steps.length - 1 ? '10vw' : 'auto',
                }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    step === index + 1
                      ? 'bg-[#A294F9] text-white border-2 border-[#A294F9]'
                      : step > index + 1
                      ? 'bg-[#A294F9] text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-600'
                  }`}
                >
                  {s.icon}
                </div>
                <span
                  className={`mt-2 text-xs sm:text-sm font-medium ${
                    step >= index + 1 ? 'text-gray-800' : 'text-gray-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="p-8 w-full max-w-6xl">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            {step === 1 && 'Basic Information'}
            {step === 2 && 'Personal Information'}
            {step === 3 && 'Employment Information'}
            {step === 4 && 'Educational Background'}
            {step === 5 && 'Salary'}
            {step === 6 && 'Documents'}
          </h3>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="flex flex-wrap -mx-2">
                {renderInput('First Name', 'firstName')}
                {renderInput('Last Name', 'lastName')}
                {renderInput("Father’s / Husband’s Name", 'fatherOrHusbandName')}
                {renderInput('Date of Birth', 'dateOfBirth', 'date')}
                {renderInput('Gender', 'gender')}
                {renderInput('CNIC / National ID Number', 'cnic', 'number')}
                {renderInput('Marital Status', 'maritalStatus')}
                {renderInput('Nationality', 'nationality')}
                <div className="w-full sm:w-1/0 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                  <div
                    className="relative h-30 border-2 border-gray-300 hover:border-indigo-300 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-[#F5EFFF] focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                    onClick={() => document.getElementById('profilePicture')?.click()}
                  >
                    <FiUpload className="w-7 h-7 text-white mb-2 p-2 rounded shadow" style={{ backgroundColor: '#A294F9' }} />
                    <p className={`text-sm ${uploadStatus === 'uploaded'
                      ? 'text-green-600'
                      : uploadStatus === 'uploading'
                        ? 'text-blue-900'
                        : 'text-gray-500'
                      }`}>
                      {uploadStatus === 'uploaded' && 'Image uploaded successfully'}
                      {uploadStatus === 'uploading' && 'Uploading image...'}
                      {uploadStatus === 'idle' && 'Click to upload image'}
                    </p>
                    {imageName && (
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="text-sm text-gray-600">{imageName}</span>
                        {uploadStatus === 'uploading' && (
                          <div className="relative w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 text-indigo-600 animate-bounce"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                    <input
                      id="profilePicture"
                      name="profilePicture"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <div className="flex flex-wrap -mx-2">
                  {renderInput('Mobile Number', 'mobileNumber', 'number')}
                  {renderInput('Permanent Address', 'permanentAddress')}
                  {renderInput('Email', 'email')}
                  {renderInput('City', 'city')}
                  {renderInput('Country', 'country')}
                </div>
                {/* Emergency Contact Section */}
                <h2 className="text-xl font-semibold mt-2 mb-4 text-gray-800">Emergency Contact</h2>
                <div className="flex flex-wrap -mx-2">
                  {renderInput('Name', 'emergencyContactName')}
                  {renderInput('Relation', 'emergencyContactRelation')}
                  {renderInput('Mobile No', 'emergencyContactMobile', 'number')}
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
              <div className="flex flex-wrap -mx-2">
                {renderInput('Employee ID', 'employeeId')}
                {renderInput('Department', 'department')}
                {renderInput('Designation / Job Title', 'designation')}
                {renderInput('Date of Joining', 'dateOfJoining', 'date')}
                {renderInput('Employment Type', 'employmentType')}
                {renderInput('Employee Status', 'employeeStatus')}
                {renderInput('Leave Policy', 'leavePolicy')}
                </div>
               {/* Bank Information */}
                <h2 className="text-xl font-semibold mt-2 mb-4 text-gray-800">Bank Information</h2>
                <div className="flex flex-wrap -mx-2">
                  {renderInput('Bank Name', 'bankName')}
                  {renderInput('Account Title', 'accountTitle')}
                  {renderInput('Account Number', 'accountNumber')}
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="flex flex-col space-y-4">
                {/* Form Fields */}
                <div className="flex flex-wrap -mx-2">
                  {renderInput('Education Type', 'educationType')}
                  {renderInput('Institute Name', 'institute')}
                  {renderInput('Year of Passing', 'yearOfPassing')}
                  {renderInput('Grade Percentage', 'gradePercentage')}
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="bg-[#A294F9] text-white px-5 py-2 rounded-md transition self-end"
                >
                  {isEditing ? 'Update Education' : '+ Add Education'}
                </button>
                <div className="mt-4 w-full">
                  {educationList.length > 0 && (
                    <div className="rounded-md">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Education List</h3>
                      <table className="min-w-full table-auto text-sm">
                        <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
                          <tr>
                            <th className="px-1 py-3 border">Institute</th>
                            <th className="px-1 py-3 border">Education Type</th>
                            <th className="px-1 py-3 border">Year of Passing</th>
                            <th className="px-1 py-3 border">Grade/Percentage</th>
                            <th className="px-1 py-3 border">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {educationList.map((edu, index) => (
                            <tr key={index} className="border-t hover:bg-[#CDC1FF] text-gray-600">
                              <td className="px-6 py-3 border">{edu.institute}</td>
                              <td className="px-6 py-3 border">{edu.educationType}</td>
                              <td className="px-6 py-3 border">{edu.yearOfPassing}</td>
                              <td className="px-6 py-3 border">{edu.gradePercentage}</td>
                              <td className="px-6 py-3 border text-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditEducation(index)}
                                  className="p-2 rounded shadow cursor-pointer"
                                  style={{ backgroundColor: '#A294F9' }}
                                >
                                  <FaEdit className='text-white' />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEducation(index)}
                                  className="p-2 rounded shadow cursor-pointer"
                                  style={{ backgroundColor: '#F87171' }}
                                >
                                  <FaTrash className='text-white' />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
            {step === 5 && (
              <>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-[#333]">Allowances</h3>
                    <button
                      onClick={addAllowance}
                      className="px-3 py-2 rounded-md shadow text-white flex items-center gap-1 bg-[#A294F9] hover:bg-[#8a7ce0] transition"
                    >
                      <FiPlus size={16} />
                      Add Allowance
                    </button>
                  </div>
                {formData?.allowances?.length > 0 && formData.allowances.map((allowance, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 items-end p-3 rounded-lg">
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
                          value={allowance.currentSalary || ''}
                          placeholder="Current"
                          onChange={(e) => handleAllowanceChange(index, e)}
                          className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
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
                          value={allowance.newSalary || ''}
                          placeholder="New Value"
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
                        value={allowance.startDate || ''}
                        onChange={(e) => handleAllowanceChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-gray-600 mb-1">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={allowance.endDate || ''}
                        onChange={(e) => handleAllowanceChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-5 flex justify-end">
                      <button
                        title="Delete"
                        className="p-2 rounded-md shadow cursor-pointer bg-[#F87171] hover:bg-[#ef4444] transition"
                        onClick={() => removeAllowance(index)}
                      >
                        <FaTrash className="text-white" />
                      </button>
                    </div>
                  </div>
                ))}

              {(formData?.allowances?.length > 0) && (
              <div className="flex justify-end mt-2">
              <div className="text-lg font-semibold text-gray-700">
                Total Allowances: {totalAllowances?.toFixed(2) || "0.00"}
              </div>
              </div>
            )}
            </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg text-[#333]">Deductions</h3>
                    <button
                      onClick={addDeduction}
                      className="px-3 py-2 rounded-md shadow text-white flex items-center gap-1 bg-[#A294F9] hover:bg-[#8a7ce0] transition"
                    >
                      <FiPlus size={16} />
                      Add Deduction
                    </button>
                  </div>

                {formData?.deductions?.length > 0 && formData.deductions.map((deduction, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 items-end p-3 rounded-lg">
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
                          value={deduction.currentSalary || ''}
                          placeholder="Current"
                          onChange={(e) => handleDeductionChange(index, e)}
                          className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
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
                          value={deduction.newSalary || ''}
                          placeholder="New Value"
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
                        value={deduction.startDate || ''}
                        onChange={(e) => handleDeductionChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm text-gray-600 mb-1">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={deduction.endDate || ''}
                        onChange={(e) => handleDeductionChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-5 flex justify-end">
                      <button
                        title="Delete"
                        className="p-2 rounded-md shadow cursor-pointer bg-[#F87171] hover:bg-[#ef4444] transition"
                        onClick={() => removeDeduction(index)}
                      >
                        <FaTrash className="text-white" />
                      </button>
                    </div>
                  </div>
                ))}

                {formData?.deductions?.length > 0 && (
                  <div className="flex justify-end mt-2">
                  <div className="text-lg font-semibold text-gray-700">
                    Total Deductions: {totalDeductions?.toFixed(2) || "0.00"}
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
              </>
            )}
            {step === 6 && (
              <>
                <div className="flex flex-wrap -mx-2 w-full">
                  <div className="w-full sm:w-1/2 px-2 mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Document Type
                      <span className="text-red-500">*</span>
                    </label>
                    
                    <select
                      value={selectedDocType}
                      onChange={(e) => setSelectedDocType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="">Select Document Type</option>
                      <option value="Matric Certificate">Matric Certificate</option>
                      <option value="Intermediate Certificate">Intermediate Certificate</option>
                      <option value="CNIC Front">CNIC Front</option>
                      <option value="CNIC Back">CNIC Back</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Document <span className="text-red-500">*</span>
                    </label>
                    <div
                      className="relative h-10 border-2 border-gray-300 hover:border-indigo-300 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-[#F5EFFF] focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                      onClick={() => document.getElementById('documentUpload')?.click()}
                    >
                      {documentName ? (
                        <div className="flex items-center space-x-2 max-w-full">
                          <span className="text-sm text-gray-600 truncate max-w-xs">{documentName}</span>
                          {documentUploadStatus === 'uploading' && (
                            <div className="relative w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 text-indigo-600 animate-bounce"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Please choose document</span>
                      )}
                      <input
                        id="documentUpload"
                        name="documentUpload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleDocumentUpload}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col sm:flex-row justify-end gap-3 px-2">
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="bg-[#A294F9] text-white px-5 py-2 rounded-md transition self-end"
                  >
                    {isEditingDoc ? 'Update Documents' : '+ Add Documents'}
                  </button>
                </div>
                <div className="mt-6 w-full px-2">
                  {documentList.length > 0 && (
                    <div className="rounded-md">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Document List</h3>
                      <table className="min-w-full table-auto text-sm">
                        <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
                          <tr>
                            <th className="px-4 py-2 border">Document Type</th>
                            <th className="px-4 py-2 border">File Name</th>
                            <th className="px-4 py-2 border">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documentList.map((doc, index) => (
                            <tr key={index} className="border-t hover:bg-gray-100 text-gray-600">
                              <td className="px-4 py-2 border">{doc.type}</td>
                              <td className="px-4 py-2 border">{doc.file?.name || 'No file selected'}</td>
                              <td className="px-4 py-2 border text-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditDocuments(index)}
                                  className="p-2 rounded shadow cursor-pointer"
                                  style={{ backgroundColor: '#A294F9' }}
                                >
                                  <FaEdit className='text-white' />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadEducation(index)}
                                  className="p-2 rounded shadow cursor-pointer"
                                  style={{ backgroundColor: '#34D399' }}
                                >
                                  <FaDownload className='text-white' />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDocument(index)}
                                  className="p-2 rounded shadow cursor-pointer"
                                  style={{ backgroundColor: '#F87171' }}
                                >
                                  <FaTrash className='text-white' />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </form>
          <div className="flex justify-end mt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 transition me-2 cursor-pointer"
              >
                Previous
              </button>
            )}
            {step < 6 && (
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#A294F9] text-white px-5 py-2 rounded-md transition cursor-pointer"
              >
                Next
              </button>
            )}

            {step === 6 && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#A294F9] text-white px-5 py-2 rounded-md hover:bg-[#8a7ce0] transition"
                >
                {isSubmitting ? 'Saving...' :id ? "Update" : "Submit"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
