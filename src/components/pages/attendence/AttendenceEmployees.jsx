import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './customCalendar.css'; // for your custom styles
import { format, parseISO } from 'date-fns';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const AttendenceEmployees = () => {
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const attendanceData = {
    '2025-05-01': {
      status: 'Present',
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      checkInImg: '/checkin.jpg',
      checkOutImg: '/checkout.jpg',
    },
    '2025-05-02': { status: 'Absent' },
    '2025-05-03': { status: 'Leave' },
  };

  const getTileContent = ({ date }) => {
    const key = format(date, 'yyyy-MM-dd');
    const record = attendanceData[key];
    if (!record) return null;
  
    return (
      <div className="mt-2 flex justify-center">
        <span
          className={`px-3 py-1 text-xs font-medium rounded-md shadow-sm text-white 
            ${
              record.status === 'Present'
                ? 'bg-green-500'
                : record.status === 'Absent'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`}
          style={{ minWidth: '60px', textAlign: 'center' }}
        >
          {record.status}
        </span>
      </div>
    );
  };
  

  const handleDateClick = (value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (value > today) return;

    const key = format(value, 'yyyy-MM-dd');
    if (attendanceData[key]) {
      setSelectedDate({ ...attendanceData[key], date: key });
      setModalIsOpen(true);
    }
  };

  const formatReadableDate = (isoDateString) => {
    const parsedDate = parseISO(isoDateString);
    return format(parsedDate, 'd MMMM yyyy'); // "1 May 2025"
  };

  return (
    <div className="p-4 sm:p-6" style={{ backgroundColor: '#F5EFFF' }}>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 my-5">Employee Attendance</h2>
        
      <div className="flex justify-center">
        <Calendar
          onChange={setDate}
          value={date}
          tileContent={getTileContent}
          onClickDay={handleDateClick}
          className="bg-white p-4 rounded shadow-lg"
        />
      </div>

      {/* Modal */}
      {selectedDate && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white w-[90%] max-w-4xl mx-auto p-6 sm:p-8 rounded-lg shadow-lg relative z-50"
          overlayClassName={{
            base: 'fixed inset-0 bg-opacity-10 backdrop-blur-[2px] flex items-center justify-center z-40',
            afterOpen: '',
            beforeClose: '',
          }}
        >
          <h3 className="text-xl sm:text-2xl font-bold mb-6 text-[#A294F9]">
            Attendance Details for {formatReadableDate(selectedDate.date)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-2 text-gray-700">Check-In</h4>
              <p className="text-gray-600 mb-2">Time: {selectedDate.checkIn || 'N/A'}</p>
              {selectedDate.checkInImg ? (
                <img src={selectedDate.checkInImg} alt="Check-in" className="w-full rounded shadow" />
              ) : (
                <p className="text-gray-400 italic">No image</p>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2 text-gray-700">Check-Out</h4>
              <p className="text-gray-600 mb-2">Time: {selectedDate.checkOut || 'N/A'}</p>
              {selectedDate.checkOutImg ? (
                <img src={selectedDate.checkOutImg} alt="Check-out" className="w-full rounded shadow" />
              ) : (
                <p className="text-gray-400 italic">No image</p>
              )}
            </div>
          </div>
          <div className="text-right mt-8">
            <button
              onClick={() => setModalIsOpen(false)}
              className="px-5 py-2 rounded bg-[#A294F9] text-white hover:bg-[#8e7cf4] transition"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AttendenceEmployees;
