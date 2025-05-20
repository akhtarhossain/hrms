import React, { useState } from 'react';
import { format } from 'date-fns';
import { FiFilter } from 'react-icons/fi';
import { FaSearch } from 'react-icons/fa';

const mockEmployees = [
  {
    id: 1,
    name: 'John Doe',
    date: '2025-05-20',
    status: 'Present',
    checkIn: '09:05 AM',
    checkOut: '06:00 PM',
  },
  {
    id: 2,
    name: 'Jane Smith',
    date: '2025-05-20',
    status: 'Absent',
    checkIn: '',
    checkOut: '',
  },
  {
    id: 3,
    name: 'Ali Khan',
    date: '2025-05-20',
    status: 'Leave',
    checkIn: '',
    checkOut: '',
  },
];

const AdminAttendanceView = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredEmployees = mockEmployees.filter((emp) => {
    const matchDate = emp.date === selectedDate;
    const matchStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchDate && matchStatus;
  });

  return (
    <div className="px-6 pt-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
      <div className="py-4 px-2 flex justify-between items-center mb-3">
        <h2 className="text-3xl font-bold text-gray-800">Employee Attendance</h2>
        <div className="flex space-x-2">
          <button
            title="Filter"
            className="p-2 bg-[#A294F9] rounded shadow cursor-pointer"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="text-white" />
          </button>
        </div>
      </div>

      {/* Filter Dropdown */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96' : 'max-h-0'}`}>
        <div className="p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setSelectedDate(today);
                setStatusFilter('All');
                setShowFilters(false);
              }}
              className="px-4 py-2 rounded shadow text-gray-700 border border-gray-300 cursor-pointer"
            >
              Close
            </button>
            <button
              className="px-4 py-2 rounded shadow text-white cursor-pointer flex items-center"
              style={{ backgroundColor: '#A294F9' }}
              onClick={() => setShowFilters(false)}
            >
              <FaSearch className="mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto p-3">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-600 px-2 py-1 rounded-md">
            Showing <span className="font-semibold text-gray-800">{filteredEmployees.length}</span> attendance records
          </div>
        </div>
        <table className="min-w-full table-auto text-sm">
          <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
            <tr>
              <th className="px-4 py-3 text-left">Employee Name</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Check In</th>
              <th className="px-4 py-3 text-left">Check Out</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} className="border-t hover:bg-[#CDC1FF] text-gray-600">
                  <td className="px-4 py-3">{emp.name}</td>
                  <td className="px-4 py-3">{emp.date}</td>
                  <td className="px-4 py-3">{emp.status}</td>
                  <td className="px-4 py-3">{emp.checkIn || '-'}</td>
                  <td className="px-4 py-3">{emp.checkOut || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">No attendance records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendanceView;
