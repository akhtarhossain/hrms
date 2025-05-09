import React, { useEffect, useState } from 'react';

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger enter animation
      setTimeout(() => setShowModal(true), 10);
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white-10 bg-opacity-5 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 transform transition-all duration-300 ease-out ${
          showModal ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Delete Confirmation</h2>
        <p className="text-gray-600 text-lg">
          Are you sure you want to delete this <span className="font-semibold text-red-500">salary record</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end mt-8 space-x-4">
          <button
            className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
