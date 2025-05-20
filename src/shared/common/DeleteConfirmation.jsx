import React, { useEffect, useState } from 'react';

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowModal(true), 10);
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '20px 30px',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
          transform: showModal ? 'scale(1)' : 'scale(0.95)',
          opacity: showModal ? 1 : 0,
          transition: 'all 0.3s ease-out',
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#1f2937',
          }}
        >
          Delete Confirmation
        </h2>

        <p style={{ color: '#4b5563', fontSize: '1.125rem' }}>
          Are you sure you want to delete this{' '}
          <span style={{ fontWeight: '600', color: '#ef4444' }}>record</span>? This action cannot be undone.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '2rem',
            gap: '1rem',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#d1d5db')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#e5e7eb')
            }
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowModal(false);
              onConfirm();
            }}
            style={{
              padding: '10px 24px',
              backgroundColor: '#dc2626',
              color: '#fff',
              fontWeight: '500',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#b91c1c')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#dc2626')
            }
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
