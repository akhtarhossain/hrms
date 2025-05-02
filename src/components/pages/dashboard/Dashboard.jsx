import React from 'react';
import { FaUsers, FaUserCheck, FaUserTimes, FaUserClock, FaEnvelopeOpenText } from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const cardData = [
    { title: 'Total Employee', count: 29, icon: <FaUsers className="text-blue-500 text-2xl" /> },
    { title: 'Today Presents', count: 1, icon: <FaUserCheck className="text-green-500 text-2xl" /> },
    { title: 'Today Absents', count: 24, icon: <FaUserTimes className="text-red-500 text-2xl" /> },
    { title: 'Today Leave', count: 4, icon: <FaUserClock className="text-yellow-500 text-2xl" /> },
  ];

  const barData = [
    { name: 'Present', value: 1 },
    { name: 'Absent', value: 24 },
    { name: 'Leave', value: 4 },
  ];

  const requestData = [
    { name: 'Ali', type: 'Leave', date: '2025-05-01' },
    { name: 'Sara', type: 'Work From Home', date: '2025-05-02' },
    { name: 'Ahmed', type: 'Late Arrival', date: '2025-05-01' },
  ];

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
      {/* <div className="py-4 px-2 flex justify-between items-center mb-3"> */}
      <h2 className="py-4 px-2 text-3xl font-bold text-gray-800">Dashboard</h2>
      <div className="flex gap-4">
        {/* Left - 4 Cards */}
        <div className="grid grid-cols-1 gap-4 w-1/5">
          {cardData.map((card, idx) => (
            <div
              key={idx}
              className="shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition rounded-xl p-4 flex flex-col justify-between h-32"
            >
              <div className="flex items-center gap-3">
                {card.icon}
                <h4 className="text-sm font-semibold text-gray-600">{card.title}</h4>
              </div>
              <p className="text-2xl font-bold text-right">{card.count}</p>
            </div>
          ))}
        </div>
        {/* Center - Bar Chart */}
        <div className="w-3/5 shadow-lg rounded-xl p-4 h-[34rem]">
          <h3 className="text-lg font-semibold mb-4">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#A294F9" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Right - Requests Card */}
        <div className="w-1/5 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition rounded-xl p-4 h-[34rem] flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <FaEnvelopeOpenText className="text-purple-500 text-xl" />
            <h3 className="text-lg font-semibold">Requests</h3>
          </div>
          <div className="flex-1 overflow-auto space-y-3">
            {requestData.map((req, idx) => (
              <div
                key={idx}
                className="border p-3 rounded-lg text-sm flex flex-col"
              >
                <span className="font-bold">{req.name}</span>
                <span>{req.type}</span>
                <span className="text-gray-500 text-xs">{req.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
