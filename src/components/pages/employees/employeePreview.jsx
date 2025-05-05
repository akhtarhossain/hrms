import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiDownload } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaArrowLeft } from 'react-icons/fa';
import employeeService from '../../../services/employeeService';

const EmployeePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await employeeService.getEmployee();
        const foundEmployee = response.find(emp => emp._id === id);
        
        if (foundEmployee) {
          setEmployee(foundEmployee);
        } else {
          setError('Employee not found');
        }
      } catch (err) {
        setError('Failed to fetch employee data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id]);

  const handleDownloadCV = () => {
    if (!employee) return;
  
    // Create a new jsPDF instance
    const doc = new jsPDF();
  
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(40, 53, 147); // Purple color
    doc.text(`${employee.firstName} ${employee.lastName} - CV`, 105, 20, { align: 'center' });
  
    // Add subtitle
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); // Black color
    doc.text(employee.designation, 105, 30, { align: 'center' });
  
    // Add a line separator
    doc.setDrawColor(162, 148, 249); // Light purple
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
  
    // Add profile picture if available
    if (employee.profilePicture) {
      // Note: This is a simplified version. For actual implementation, you might need to:
      // 1. Convert the image to a data URL if it's not already
      // 2. Handle the image loading properly
      try {
        doc.addImage(employee.profilePicture, 'JPEG', 20, 40, 30, 30);
      } catch (error) {
        console.error('Error adding profile image:', error);
      }
    }
  
    // Contact Information
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Contact Information', 20, 80);
    
    const contactInfo = [
      [`Email: ${employee.email}`],
      [`Phone: ${employee.mobileNumber}`],
      [`Address: ${employee.permanentAddress}`],
      [`City: ${employee.city}`],
      [`CNIC: ${employee.cnic}`]
    ];
    
    autoTable(doc, {
      startY: 85,
      head: [],
      body: contactInfo,
      theme: 'grid',
      headStyles: { fillColor: [162, 148, 249] },
      styles: { fontSize: 10 },
      margin: { left: 20 }
    });
  
    // Professional Summary
    doc.setFontSize(12);
    doc.text('Professional Summary', 20, 130);
    
    const summaryText = `${employee.firstName} ${employee.lastName} is a ${employee.designation} in the ${employee.department} department with employee ID ${employee.employeeId}.`;
    
    doc.setFontSize(10);
    doc.text(summaryText, 20, 140, { maxWidth: 170 });
  
    // Employment Details
    doc.setFontSize(12);
    doc.text('Employment Details', 20, 150);
    
    const employmentDetails = [
      ['Employee ID', employee.employeeId],
      ['Department', employee.department],
      ['Designation', employee.designation],
      ['Joining Date', new Date(employee.dateOfJoining).toLocaleDateString()],
      ['Employment Type', employee.employmentType],
      ['Status', employee.employeeStatus]
    ];
    
    autoTable(doc, {
      startY: 155,
      head: [['Detail', 'Value']],
      body: employmentDetails,
      theme: 'grid',
      headStyles: { fillColor: [162, 148, 249] },
      styles: { fontSize: 10 },
      margin: { left: 20 }
    });
  
    // Education
    doc.setFontSize(12);
    doc.text('Education', 20, doc.lastAutoTable.finalY + 15);
    
    const educationDetails = [
      ['Degree Title', employee.degreeTitle],
      ['Institute', employee.institute],
      ['Year of Passing', employee.yearOfPassing],
      ['Grade/Percentage', employee.gradePercentage],
      ['Major Subjects', employee.majorSubjects]
    ];
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Detail', 'Value']],
      body: educationDetails,
      theme: 'grid',
      headStyles: { fillColor: [162, 148, 249] },
      styles: { fontSize: 10 },
      margin: { left: 20 }
    });
  
    // Personal Information
    doc.setFontSize(12);
    doc.text('Personal Information', 20, doc.lastAutoTable.finalY + 15);
    
    const personalInfo = [
      ['Date of Birth', new Date(employee.dateOfBirth).toLocaleDateString()],
      ['Gender', employee.gender],
      ['Marital Status', employee.maritalStatus],
      ['Nationality', employee.nationality]
    ];
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Detail', 'Value']],
      body: personalInfo,
      theme: 'grid',
      headStyles: { fillColor: [162, 148, 249] },
      styles: { fontSize: 10 },
      margin: { left: 20 }
    });
  
    // Save the PDF
    doc.save(`${employee.firstName}_${employee.lastName}_CV.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-md text-white"
          style={{ backgroundColor: '#A294F9' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
      <div className="py-4 px-2 flex justify-between items-center mb-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded shadow flex items-center space-x-2"
          style={{ backgroundColor: '#A294F9' }}
        >
          <FaArrowLeft className="text-white" />
          <span className="text-white">Back</span>
        </button>
        
        <h2 className="text-3xl font-bold text-gray-800">Employee Profile</h2>
        
        <button
          onClick={handleDownloadCV}
          className="p-2 rounded shadow flex items-center space-x-2"
          style={{ backgroundColor: '#A294F9' }}
        >
          <FiDownload className="text-white" />
          <span className="text-white">Download CV</span>
        </button>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Section */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-purple-200 mb-4">
              {employee.profilePicture ? (
                <img
                  src={employee.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
            
            <h3 className="text-2xl font-semibold text-gray-800 text-center">
              {employee.firstName} {employee.lastName}
            </h3>
            <p className="text-purple-600 font-medium text-center">{employee.designation}</p>
            
            {/* Contact Information */}
            <div className="mt-6 w-full">
              <h4 className="font-bold text-gray-800 border-b border-purple-200 pb-2 mb-3">Contact</h4>
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Email:</span> {employee.email}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Phone:</span> {employee.mobileNumber}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Address:</span> {employee.permanentAddress}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium">City:</span> {employee.city}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">CNIC:</span> {employee.cnic}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-2/3">
            {/* Professional Summary */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                Professional Summary
              </h3>
              <p className="text-gray-700">
                {employee.firstName} {employee.lastName} is a {employee.designation} in the {employee.department} department with employee ID {employee.employeeId}.
              </p>
            </div>

            {/* Employment Details */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                Employment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="font-medium">{employee.employeeId}</p>
                </div>
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Designation</p>
                  <p className="font-medium">{employee.designation}</p>
                </div>
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Joining Date</p>
                  <p className="font-medium">
                    {new Date(employee.dateOfJoining).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Employment Type</p>
                  <p className="font-medium">{employee.employmentType}</p>
                </div>
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{employee.employeeStatus}</p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                Education
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Degree Title</p>
                  <p className="font-medium">{employee.degreeTitle}</p>
                </div>
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Institute</p>
                  <p className="font-medium">{employee.institute}</p>
                </div>
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Year of Passing</p>
                  <p className="font-medium">{employee.yearOfPassing}</p>
                </div>
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Grade/Percentage</p>
                  <p className="font-medium">{employee.gradePercentage}</p>
                </div>
                <div className="md:col-span-2 p-3 rounded">
                  <p className="text-sm text-gray-500">Major Subjects</p>
                  <p className="font-medium">{employee.majorSubjects}</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(employee.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{employee.gender}</p>
                </div>
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Marital Status</p>
                  <p className="font-medium">{employee.maritalStatus}</p>
                </div>
                <div className="p-3 rounded">
                  <p className="text-sm text-gray-500">Nationality</p>
                  <p className="font-medium">{employee.nationality}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePreview;