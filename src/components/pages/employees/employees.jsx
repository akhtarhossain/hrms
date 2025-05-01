import React from 'react';
import { FiDownload, FiUpload, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Employees = () => {
  const navigate = useNavigate()
  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#F5EFFF' }}>
      <div className="py-4 px-2 flex justify-between items-center mb-3">
        <h2 className="text-3xl font-bold text-gray-800">Employees</h2>
        <div className="flex space-x-2">
          <button
            title="Import"
            className="p-2 rounded shadow"
            style={{ backgroundColor: '#A294F9' }}
          >
            <FiUpload className="text-white" />
          </button>
          <button
            title="Export"
            className="p-2 rounded shadow"
            style={{ backgroundColor: '#A294F9' }}

          >
            <FiDownload className="text-white" />
          </button>
          <button
            title="Create"
            onClick={() => navigate('/employee-form')}
            className="p-2 rounded shadow"
            style={{ backgroundColor: '#A294F9' }}

          >
            <FiPlus className="text-white" />
          </button>
        </div>
      </div>

      <div className="rounded-lg shadow overflow-x-auto p-3 border-radius-100px">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-600 px-2 py-1 rounded-md">
            Showing <span className="font-semibold text-gray-800">1</span> to <span className="font-semibold text-gray-800">10</span> of <span className="font-semibold text-gray-800">50</span> entries
          </div>

          {/* Search (Right) */}
          <div>
            <input
              type="text"
              placeholder="Search employees..."
              className="px-4 py-2 border border-[#A294F9] rounded-full shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#A294F9] placeholder-gray-400"
            />
          </div>
        </div>
        <table className="min-w-full table-auto text-sm">
          <thead className="text-gray-700 uppercase text-xs font-medium" style={{ backgroundColor: '#E5D9F2' }}>
            <tr>
              <th className="px-4 py-3 text-left">Employee ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Branch</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Designation</th>
              <th className="px-4 py-3 text-left">Date Of Joining</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t hover:bg-[#CDC1FF] text-gray-600">
              <td className="px-4 py-3">EMP001</td>
              <td className="px-4 py-3">John Doe</td>
              <td className="px-4 py-3">john@example.com</td>
              <td className="px-4 py-3">NY Branch</td>
              <td className="px-4 py-3">HR</td>
              <td className="px-4 py-3">Manager</td>
              <td className="px-4 py-3">2022-01-15</td>
              <td className="px-4 py-3">
                <button className="text-blue-600 hover:underline transition">
                  Edit
                </button>
              </td>
            </tr>
            <tr className="border-t hover:bg-[#CDC1FF] text-gray-600">
              <td className="px-4 py-3">EMP001</td>
              <td className="px-4 py-3">John Doe</td>
              <td className="px-4 py-3">john@example.com</td>
              <td className="px-4 py-3">NY Branch</td>
              <td className="px-4 py-3">HR</td>
              <td className="px-4 py-3">Manager</td>
              <td className="px-4 py-3">2022-01-15</td>
              <td className="px-4 py-3">
                <button className="text-blue-600 hover:underline transition">
                  Edit
                </button>
              </td>
            </tr>
            <tr className="border-t hover:bg-[#CDC1FF] text-gray-600">
              <td className="px-4 py-3">EMP001</td>
              <td className="px-4 py-3">John Doe</td>
              <td className="px-4 py-3">john@example.com</td>
              <td className="px-4 py-3">NY Branch</td>
              <td className="px-4 py-3">HR</td>
              <td className="px-4 py-3">Manager</td>
              <td className="px-4 py-3">2022-01-15</td>
              <td className="px-4 py-3">
                <button className="text-blue-600 hover:underline transition">
                  Edit
                </button>
              </td>
            </tr>
            <tr className="border-t hover:bg-[#CDC1FF] text-gray-600">
              <td className="px-4 py-3">EMP001</td>
              <td className="px-4 py-3">John Doe</td>
              <td className="px-4 py-3">john@example.com</td>
              <td className="px-4 py-3">NY Branch</td>
              <td className="px-4 py-3">HR</td>
              <td className="px-4 py-3">Manager</td>
              <td className="px-4 py-3">2022-01-15</td>
              <td className="px-4 py-3">
                <button className="text-blue-600 hover:underline transition">
                  Edit
                </button>
              </td>
            </tr>
            {/* Add more rows dynamically as needed */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employees;
