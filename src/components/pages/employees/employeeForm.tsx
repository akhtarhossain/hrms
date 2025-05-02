import React, { useState } from 'react';
import { FiDownload, FiUpload, FiPlus, FiList, FiFilter } from 'react-icons/fi';
import { BsPerson, BsTelephone, BsBriefcase, BsBook } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import employeeService from '../../../services/employeeService';

const EmployeeForm = () => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState('');
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
    permanentAddress: '',
    city: '',
    employeeId: '',
    department: '',
    designation: '',
    dateOfJoining: '',
    employmentType: '',
    employeeStatus: '',
    degreeTitle: '',
    institute: '',
    majorSubjects: '',
    // document2: null,
    presetId:'3T38KHGK',

    dateOfBirth: '',
    
    profilePicture: "https://via.placeholder.com/150",
    documentUpload: "https://via.placeholder.com/150",
    yearOfPassing: 2020,
    gradePercentage: 30,
  });

  const navigate = useNavigate();

  // Step-specific required fields
  const requiredFields = {
    1: ['firstName', 'lastName', 'fatherOrHusbandName', 'dateOfBirth', 'gender', 'cnic', 'maritalStatus', 'nationality'],
    2: ['mobileNumber', 'email', 'permanentAddress', 'city'],
    3: ['employeeId', 'department', 'designation', 'dateOfJoining', 'employmentType', 'employeeStatus'],
    4: ['degreeTitle', 'institute', 'yearOfPassing', 'gradePercentage', 'majorSubjects'],
  };

  const handleNext = () => {
    if (!isStepValid()) return;
    if (step < 4) setStep(step + 1);
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
  
        if (name === 'profilePicture') {
          setPreview(URL.createObjectURL(file));
        }
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

    for (let field of fields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step !== 4) return;
    console.log('Final Form Data:', formData);
    employeeService.createEmployee(formData)
      .then((response) => {
        console.log('Employee created successfully:', response);
        alert('Form submitted successfully!');
      })
      .catch((error) => {
        console.error('Error creating employee:', error);
        alert('Error submitting form. Please try again.');
      });
  };

  const renderInput = (label, name, type = 'text', placeholder = '') => {
    // For gender selection
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
  
    // For marital status selection
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
  
    // For employmentType selection
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
  
    // For employeeStatus selection
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
  
    // For other inputs
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
    { label: 'Personal', icon: <BsPerson size={20} /> },
    { label: 'Contact', icon: <BsTelephone size={20} /> },
    { label: 'Employment', icon: <BsBriefcase size={20} /> },
    { label: 'Education', icon: <BsBook size={20} /> },
  ];

  return (
    <div className="p-6 bg-[#F5EFFF] min-h-screen">
      <div className="py-4 px-2 flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Employees Form</h2>
        <div className="flex space-x-2">
          <button
            title="fillter" className="p-2 bg-[#A294F9] rounded shadow">
            <FiFilter className="text-white" />
          </button>
          <button
            onClick={() => navigate('/employees')}
            title="List"
            className="p-2 bg-[#A294F9] rounded shadow">
            <FiList className="text-white" />
          </button>
        </div>
      </div>
      <div className="relative flex justify-center mb-4">
        <div className="absolute top-5 w-full max-w-4xl h-1 bg-gray-300 z-10"></div>
        <div className="absolute top-5 h-1 bg-[#A294F9] max-w-6xl z-10 transition-all w-full duration-300"
          style={{ width: `${(step - 1) / (steps.length - 1) * 73}%`, maxWidth: '73%' }}></div>
        <div className="flex w-full max-w-6xl items-center justify-between z-20">
          {steps.map((s, index) => (
            <div key={index} className="flex flex-col items-center flex-1 text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${step === index + 1
                  ? 'bg-[#A294F9] text-white'
                  : step > index + 1
                    ? 'bg-[#A294F9] text-white'
                    : 'bg-gray-300 text-gray-600'
                  }`}
              >
                {s.icon}
              </div>
              <span className="mt-2 text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center">
        <div className="p-8 w-full max-w-6xl">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            {step === 1 && 'Personal Information'}
            {step === 2 && 'Contact Information'}
            {step === 3 && 'Employment Information'}
            {step === 4 && 'Educational Background'}
          </h3>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="flex flex-wrap -mx-2">
                <div className="w-full sm:w-1/2 px-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                  <div
                      className="relative h-44 border-2 border-gray-300 hover:border-indigo-300 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-[#F5EFFF] focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                      onClick={() => document.getElementById('profilePicture')?.click()}
                    >
                    <p className="text-sm text-gray-600 mb-2">Drag & drop or select</p>
                      <FiUpload className="w-7 h-7 text-white mb-2 p-2 rounded shadow"
                        style={{ backgroundColor: '#A294F9' }}/>
                      <p className="text-sm text-gray-500">Click to upload image</p>

                      <input
                        id="profilePicture"
                        name="profilePicture"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleChange} 
                      />
                    </div>
                </div>

                {/* Profile Picture Preview */}
                <div className="w-full sm:w-1/2 px-2 mb-4 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                    <img
                      src={preview || "../../../../assets/dummy-2.png"}
                      alt="Profile Preview"
                      className="h-32 w-32 object-cover rounded-full border border-gray-300 shadow"
                    />
                  </div>
                </div>

                {/* Rest of the form fields */}
                {renderInput('First Name', 'firstName')}
                {renderInput('Last Name', 'lastName')}
                {renderInput("Father’s / Husband’s Name", 'fatherOrHusbandName')}
                {renderInput('Date of Birth', 'dateOfBirth', 'date')}
                {renderInput('Gender', 'gender')}
                {renderInput('CNIC / National ID Number', 'cnic' , 'number')}
                {renderInput('Marital Status', 'maritalStatus')}
                {renderInput('Nationality', 'nationality')}
                {renderInput('Document Upload', 'documentUpload', 'file')}
              </div>
            )}


            {step === 2 && (
              <div className="flex flex-wrap -mx-2">
                {renderInput('Personal Mobile Number', 'mobileNumber' , 'number')}
                {renderInput('Email Address', 'email', 'email')}
                {renderInput('Permanent Address', 'permanentAddress')}
                {renderInput('City', 'city')}
              </div>
            )}
            {step === 3 && (
              <div className="flex flex-wrap -mx-2">
                {renderInput('Employee ID', 'employeeId')}
                {renderInput('Department', 'department')}
                {renderInput('Designation / Job Title', 'designation')}
                {renderInput('Date of Joining', 'dateOfJoining', 'date')}
                {renderInput('Employment Type', 'employmentType')}
                {renderInput('Employee Status', 'employeeStatus')}
              </div>
            )}
            {step === 4 && (
              <div className="flex flex-wrap -mx-2">
                {renderInput('Degree Title', 'degreeTitle')}
                {renderInput('Institute / University', 'institute')}
                {renderInput('Year of Passing', 'yearOfPassing', 'date')}
                {renderInput('Grade / Percentage', 'gradePercentage')}
                {renderInput('Major Subjects', 'majorSubjects')}
                {/* {renderInput('Document Upload', 'document2', 'file')} */}
              </div>
            )}
          </form>
          <div className="flex justify-end mt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 transition me-2"
              >
                Previous
              </button>
            )}
            {step < 4 && (
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#A294F9] text-white px-5 py-2 rounded-md transition"
              >
                Next
              </button>
            )}

            {step === 4 && (
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-[#A294F9]  text-white px-5 py-2 rounded-md transition"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
