import React, { useState, useEffect } from 'react';
import { FiUser, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import LeavePolicyService from '../../../services/LeavePolicyService';

const LeavePolicyForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        annualLeave: '',
        sickLeave: '',
        maternityLeave: '',
        paternityLeave: '',
    });

    const payload = {
  ...formData,
  annualLeave: Number(formData.annualLeave),
  sickLeave: Number(formData.sickLeave),
  maternityLeave: Number(formData.maternityLeave),
  paternityLeave: Number(formData.paternityLeave),
};

    useEffect(() => {
        if (id) {
        LeavePolicyService.getLeavePolicyById(id)
            .then(response => {
                const {
                    title,
                    annualLeave,
                    sickLeave,
                    maternityLeave,
                    paternityLeave,
                } = response;
                setFormData({
                    title,
                    annualLeave,
                    sickLeave,
                    maternityLeave,
                    paternityLeave,
                });
            })
            .catch(() => {
                toast.error("Error loading leave policy");
            });
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

 const handleSubmit = (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  // Convert leave values to numbers before sending
  const payload = {
    ...formData,
    annualLeave: Number(formData.annualLeave),
    sickLeave: Number(formData.sickLeave),
    maternityLeave: Number(formData.maternityLeave),
    paternityLeave: Number(formData.paternityLeave),
    unpaidLeave: Number(formData.unpaidLeave),
  };

  if (id) {
    LeavePolicyService.updateLeavePolicy(id, payload)
      .then(() => {
        toast.success('Leave policy updated!');
        navigate('/leave-policy-list');
      })
      .catch(() => {
        toast.error('Error updating leave policy');
        setIsSubmitting(false);
      });
  } else {
    LeavePolicyService.createLeavePolicy(payload)
      .then(() => {
        toast.success("Leave policy submitted!");
        navigate('/leave-policy-list');
      })
      .catch(() => {
        toast.error("Error submitting leave policy");
        setIsSubmitting(false);
      });
  }
};

    return (
        <div className="p-6 bg-[#F5EFFF] min-h-screen">
            <div className="py-4 px-2 flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Leave Policy</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => navigate('/leave-policy-list')}
                        title="Back"
                        className="p-2 bg-[#A294F9] rounded shadow"
                    >
                        <FiUser className="text-white" />
                    </button>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="p-8 w-full max-w-8xl">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Title</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full pl-4  p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                                        placeholder="Enter Title"
                                        required
                                    />
                                </div>
                            </div>

                            {[
                                { label: 'Annual Leave', name: 'annualLeave' },
                                { label: 'Sick Leave', name: 'sickLeave' },
                                { label: 'Maternity Leave', name: 'maternityLeave' },
                                { label: 'Paternity Leave', name: 'paternityLeave' },
                            ].map(({ label, name }) => (
                                <div key={name}>
                                    <label className="block text-sm text-gray-600 mb-1">{label}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name={name}
                                            value={formData[name]}
                                            onChange={handleChange}
                                            className="w-full pl-4 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                                            placeholder={`Enter ${label}`}
                                            required
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end mt-8">
                            <button
                                type="button"
                                onClick={() => navigate('/leave-policy-list')}
                                className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 transition me-4"
                            >
                                Cancel
                            </button>
                             <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#A294F9] text-white px-5 py-2 rounded-md hover:bg-[#8a7ce0] transition"
                                >
                                {isSubmitting ? 'Saving...' :id ? "Update" : "Submit"}
                             </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LeavePolicyForm;
