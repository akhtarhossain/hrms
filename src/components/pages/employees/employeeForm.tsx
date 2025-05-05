import React, { useEffect, useState } from 'react';
import { FiDownload, FiUpload, FiPlus, FiList, FiFilter, FiDelete } from 'react-icons/fi';
import { BsPerson, BsTelephone, BsBriefcase, BsBook, BsFileEarmarkText } from 'react-icons/bs';
import { useNavigate, useParams } from 'react-router-dom';
import employeeService from '../../../services/employeeService';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa6';
import { Certificate } from 'crypto';
import { url } from 'inspector';

interface Education {
  institute: string;
  yearOfPassing: string;
  gradePercentage: string;
  educationType: string;
}
type DocumentItem = {
  type: string;
  file: File;
  fileUrl?: string;
};

const EmployeeForm = () => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [documentList, setDocumentList] = useState<DocumentItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [DocuUrl, setDocuUrl] = useState('');
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
    degreeTitle: '',
    institute: '',
    certificates: [{}],
    educations: [{}],
    presetId: '3T38KHGK',
    dateOfBirth: '',
    profilePicture: imageUrl,
    documentUpload: "https://via.placeholder.com/150",
    yearOfPassing: '',
    gradePercentage: '',
    educationType: '',
  });

  const navigate = useNavigate();

  const requiredFields = {
    1: ['firstName', 'lastName', 'fatherOrHusbandName', 'dateOfBirth', 'gender', 'cnic', 'maritalStatus', 'nationality'],
    2: ['mobileNumber', 'email', 'country', 'permanentAddress', 'city', 'emergencyContactName', 'emergencyContactRelation', 'emergencyContactMobile'],
    3: ['employeeId', 'department', 'designation', 'dateOfJoining', 'employmentType', 'employeeStatus'],
    4: ['educationType', 'institute', 'yearOfPassing', 'gradePercentage'],
  };

  const handleNext = () => {
    if (!isStepValid()) return;
    if (step < 5) setStep(step + 1);
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
    const finalData = {
      ...formData,
      educations: educationList,
      certificates: documentList,
    };
    console.log('Final Form Data:', formData);

    employeeService.createEmployee(finalData)
      .then((response) => {
        console.log('Employee created successfully:', response);
        toast.success('Form submitted successfully!');
        navigate('/employees')
      })
      .catch((error) => {
        console.error('Error creating employee:', error);
        toast.error('Error submitting form. Please try again.');
      });
  };

  const renderInput = (label, name, type = 'text', placeholder = '', onChangeHandler = null) => {
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
            value={formData[name]}
            onChange={handleChange}
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
    { label: 'Basic Info', icon: <BsPerson size={20} /> },
    { label: 'Contact', icon: <BsTelephone size={20} /> },
    { label: 'Employment', icon: <BsBriefcase size={20} /> },
    { label: 'Education', icon: <BsBook size={20} /> },
    { label: 'Documents', icon: <BsFileEarmarkText size={20} /> },
  ];
  const handleFileUpload = async (e) => {
    const file = e.target?.files?.[0] || e;
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4', 'video/3gp', 'text/srt'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not supported. Allowed: jpg, jpeg, png, webp, mp4, 3gp, srt.');
      return;
    }

    try {
      const projectData = {
        name: file.name,
        access: "public-read",
      };

      const response = await employeeService.uploadImage(projectData);

      if (response?.message && Array.isArray(response.message)) {
        response.message.forEach((msg) => toast.error(msg));
        return;
      }

      const uploadUrl = response.location;
      if (!uploadUrl) {
        toast.error("No upload URL received.");
        return;
      }

      const source = axios.CancelToken.source();
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
          "x-amz-acl": "public-read",
        },
        cancelToken: source.token,
      });

      const trimmedUrl = uploadUrl.split("?")[0];
      console.log(trimmedUrl, "trim url");
      setImageUrl(trimmedUrl)
      toast.success("File uploaded successfully!");
      if (file) {
        setImageName(file.name);
        setUploadStatus('uploaded');
      }
      setFormData?.((prev) => ({
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
    }
  };
  const handleAddEducation = () => {
    const { institute, yearOfPassing, gradePercentage, educationType } = formData;

    if (!institute || !yearOfPassing || !gradePercentage || !educationType) {
      toast.error('Please fill all education fields before adding.');
      return;
    }

    const newEducation = { institute, yearOfPassing, gradePercentage, educationType };
    setEducationList((prevList) => [...prevList, newEducation]);
  };

  const handleDeleteEducation = (index) => {
    const newList = [...educationList];
    newList.splice(index, 1);
    setEducationList(newList);
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'image/jpg', 'video/mp4', 'video/3gpp', 'text/srt'
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not supported.');
      return;
    }

    try {
      const projectData = {
        name: file.name,
        access: "public-read",
      };

      const response = await employeeService.uploadDocument(projectData);

      if (response?.message && Array.isArray(response.message)) {
        response.message.forEach((msg: string) => toast.error(msg));
        return;
      }

      const uploadUrl = response.location;
      if (!uploadUrl) {
        toast.error("No upload URL received.");
        return;
      }

      const source = axios.CancelToken.source();
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
          "x-amz-acl": "public-read",
        },
        cancelToken: source.token,
      });

      const trimmedUrl = uploadUrl.split("?")[0];
      setDocuUrl(trimmedUrl);
      setImageName(file.name);
      setUploadedFile(file);
      setUploadStatus('uploaded');
      toast.success("File uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed! Please try again.");
    }
  };

  const handleAddDocument = () => {
    if (!selectedDocType || !uploadedFile || !DocuUrl) {
      toast.error("Please select document type and upload a document.");
      return;
    }

    const newDocument: DocumentItem = {
      type: selectedDocType,
      file: uploadedFile,
      fileUrl: DocuUrl,
    };

    setDocumentList(prev => [...prev, newDocument]);
    setSelectedDocType('');
    setImageName('');
    setImageUrl('');
    setUploadedFile(null);
  };

  const handleDeleteDocument = (index: number) => {
    const updatedList = documentList.filter((_, i) => i !== index);
    setDocumentList(updatedList);
  };


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
            {step === 1 && 'Basic Information'}
            {step === 2 && 'Personal Information'}
            {step === 3 && 'Employment Information'}
            {step === 4 && 'Educational Background'}
            {step === 5 && 'Documents'}
          </h3>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="flex flex-wrap -mx-2">
                {/* Rest of the form fields */}
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
                    className="relative h-24 border-2 border-gray-300 hover:border-indigo-300 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-[#F5EFFF] focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                    onClick={() => document.getElementById('profilePicture')?.click()}
                  >
                    <FiUpload className="w-7 h-7 text-white mb-2 p-2 rounded shadow" style={{ backgroundColor: '#A294F9' }} />
                    <p className={`text-sm ${uploadStatus === 'uploaded' ? 'text-green-600' : 'text-gray-500'}`}>
                      {uploadStatus === 'uploaded' ? 'Image uploaded successfully' : 'Click to upload image'}
                    </p>

                    {/* Only show image name, no preview */}
                    {uploadStatus === 'uploaded' && (
                      <p className="text-sm text-gray-500 mt-2">{imageName}</p>
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
                  {renderInput('Country', 'country')}
                  {renderInput('City', 'city')}
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
              <div className="flex flex-col space-y-4">
                {/* Form Fields */}
                <div className="flex flex-wrap -mx-2">
                  {renderInput('Education Type', 'educationType')}
                  {renderInput('Institute / University', 'institute')}
                  {renderInput('Year of Passing', 'yearOfPassing')}
                  {renderInput('Grade / Percentage', 'gradePercentage')}
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="bg-[#A294F9] text-white px-5 py-2 rounded-md transition self-end"
                >
                  + Add Education
                </button>
                <div className="mt-4 w-full">
                  {educationList.length > 0 && (
                    <div className="rounded-md">
                      <h3 className="text-2xl font-bold text-gray-800">Education List</h3>
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
                              <td className="px-6 py-3 border">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEducation(index)}

                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  <FaTrash />
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
                <div className="flex flex-wrap -mx-2 w-full">
                  {/* Select input */}
                  <div className="w-full sm:w-1/2 px-2 mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Document Type</label>
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

                  {/* File input */}
                  <div className="w-full md:w-1/2 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Document <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleDocumentUpload}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                  </div>

                </div>
                {/* Add/Remove Buttons */}
                <div className="w-full flex flex-col sm:flex-row justify-end gap-3 px-2">
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="bg-[#A294F9] text-white px-5 py-2 rounded-md transition self-end"
                  >
                    + Add Document
                  </button>
                </div>
                {/* Document List Table */}
                <div className="mt-6 w-full px-2">
                  {documentList.length > 0 && (
                    <div className="rounded-md">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Document List</h3>
                      <table className="min-w-full table-auto text-sm border border-gray-300">
                        <thead className="text-gray-700 uppercase text-xs font-medium bg-gray-100">
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
                              <td className="px-4 py-2 border text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDocument(index)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  <FaTrash />
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
            {step < 5 && (
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#A294F9] text-white px-5 py-2 rounded-md transition cursor-pointer"
              >
                Next
              </button>
            )}

            {step === 5 && (
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-[#A294F9]  text-white px-5 py-2 rounded-md transition cursor-pointer"
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
