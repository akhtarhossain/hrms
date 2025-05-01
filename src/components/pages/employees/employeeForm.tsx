import React, { useState } from 'react';
import { FiDownload, FiUpload, FiPlus } from 'react-icons/fi';
import { BsPerson, BsTelephone, BsBriefcase, BsBook } from 'react-icons/bs';

const EmployeeForm = () => {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const [formData, setFormData] = useState({
    // Step 1
    firstName: '',
    lastName: '',
    fatherName: '',
    dob: '',
    gender: '',
    cnic: '',
    maritalStatus: '',
    nationality: '',
    profilePicture: null,
    document1: null,

    // Step 2
    mobile: '',
    email: '',
    address: '',
    city: '',

    // Step 3
    empId: '',
    department: '',
    jobTitle: '',
    joinDate: '',
    empType: '',
    empStatus: '',

    // Step 4
    degree: '',
    institute: '',
    passingYear: '',
    grade: '',
    subjects: '',
    document2: null,
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step !== 4) return;
    console.log('Final Form Data:', formData);
    alert('Form submitted!');
  };

  const renderInput = (label, name, type = 'text', placeholder = '') => (
    <div className="w-full md:w-1/2 px-2 mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={type !== 'file' ? formData[name] || '' : undefined}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  )
  const steps = [
    { label: 'Personal', icon: <BsPerson size={20} /> },
    { label: 'Contact', icon: <BsTelephone size={20} /> },
    { label: 'Employment', icon: <BsBriefcase size={20} /> },
    { label: 'Education', icon: <BsBook size={20} /> },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="py-4 px-2 flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">Employees Form</h2>
        <div className="flex space-x-2">
          <button title="Import" className="p-2 bg-green-600 rounded shadow">
            <FiUpload className="text-white" />
          </button>
          <button title="Export" className="p-2 bg-green-600 rounded shadow">
            <FiDownload className="text-white" />
          </button>
          <button title="Create" className="p-2 bg-green-600 rounded shadow">
            <FiPlus className="text-white" />
          </button>
        </div>
      </div>

      {/* Step Progress */}
      <div className="relative flex justify-center mb-10">
        {/* Line behind icons */}
        <div className="absolute top-5 w-full max-w-4xl h-1 bg-gray-300 z-0"></div>
        {/* Green progress line */}
        <div
          className="absolute top-5 h-1 bg-green-500 z-10 transition-all duration-300"
          style={{ width: `${(step - 1) / (steps.length - 1) * 100}%`, maxWidth: '100%' }}
        ></div>

        {/* Step Icons */}
        <div className="flex w-full max-w-4xl items-center justify-between z-20">
          {steps.map((s, index) => (
            <div key={index} className="flex flex-col items-center flex-1 text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step === index + 1
                    ? 'bg-green-600 text-white'
                    : step > index + 1
                    ? 'bg-green-400 text-white'
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

      {/* Form Content */}
      <div className="flex justify-center">
        <div className="bg-white p-8 rounded-lg shadow w-full max-w-4xl">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            {step === 1 && 'Personal Information'}
            {step === 2 && 'Contact Information'}
            {step === 3 && 'Employment Information'}
            {step === 4 && 'Educational Background'}
          </h3>

 <form onSubmit={handleSubmit}>
      {step === 1 && (
        <div className="flex flex-wrap -mx-2">
          {renderInput('First Name', 'firstName')}
          {renderInput('Last Name', 'lastName')}
          {renderInput("Father’s / Husband’s Name", 'fatherName')}
          {renderInput('Date of Birth', 'dob', 'date')}
          {renderInput('Gender', 'gender')}
          {renderInput('CNIC / National ID Number', 'cnic')}
          {renderInput('Marital Status', 'maritalStatus')}
          {renderInput('Nationality', 'nationality')}
          {renderInput('Profile Picture', 'profilePicture', 'file')}
          {renderInput('Document Upload', 'document1', 'file')}
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-wrap -mx-2">
          {renderInput('Personal Mobile Number', 'mobile')}
          {renderInput('Email Address', 'email', 'email')}
          {renderInput('Permanent Address', 'address')}
          {renderInput('City', 'city')}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-wrap -mx-2">
          {renderInput('Employee ID', 'empId')}
          {renderInput('Department', 'department')}
          {renderInput('Designation / Job Title', 'jobTitle')}
          {renderInput('Date of Joining', 'joinDate', 'date')}
          {renderInput('Employment Type', 'empType')}
          {renderInput('Employee Status', 'empStatus')}
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-wrap -mx-2">
          {renderInput('Degree Title', 'degree')}
          {renderInput('Institute / University', 'institute')}
          {renderInput('Year of Passing', 'passingYear', 'number')}
          {renderInput('Grade / Percentage', 'grade')}
          {renderInput('Major Subjects', 'subjects')}
          {renderInput('Document Upload', 'document2', 'file')}
        </div>
      )}

      <div className="flex justify-end mt-6">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 transition me-2"
          >
            Previous
          </button>
        )}
        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition"
          >
            Submit
          </button>
        )}
      </div>
    </form>

        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
