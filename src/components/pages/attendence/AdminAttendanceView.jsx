import React, { useState } from 'react';
import { format } from 'date-fns';

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
    <div className="p-4 sm:p-6 bg-[#F5EFFF] min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl sm:text-3xl font-bold text-gray-800">Admin Attendance View</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-[#A294F9] text-white px-4 py-2 rounded shadow hover:bg-[#8e7cf4] transition"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 bg-white p-4 rounded shadow-md transition-all">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700">Status Filter:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="All">All</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#E7E4FB] text-gray-700">
              <th className="text-left px-4 py-2">Employee Name</th>
              <th className="text-left px-4 py-2">Check-In</th>
              <th className="text-left px-4 py-2">Check-Out</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} className="border-t">
                  <td className="px-4 py-2">{emp.name}</td>
                  <td className="px-4 py-2">{emp.checkIn || '-'}</td>
                  <td className="px-4 py-2">{emp.checkOut || '-'}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                        emp.status === 'Present'
                          ? 'bg-green-500'
                          : emp.status === 'Absent'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No attendance data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendanceView;