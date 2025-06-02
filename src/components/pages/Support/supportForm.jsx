import React, { useState, useEffect } from 'react';
import { FiMail, FiUser, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import SessionService from '../../../services/SessionService';
import SupportService from '../../../services/SupportService';

const SupportForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        description: '',
        status:'Pending'
    });

    const GetUser = () => {
        const user = SessionService.getLoggedIn();
        return user;
    };

    useEffect(() => {
        const userResponse = GetUser();
        if (userResponse?.data) {
            const { firstName, lastName } = userResponse.data;
            const fullName = `${firstName} ${lastName}`;
            setFormData(prev => ({ ...prev, name: fullName }));
        }

        // If editing, fetch existing support request
        if (id) {
            SupportService.getSupportById(id)
                .then(response => {
                console.log("Fetched Support Data:", response); // 🔍 Inspect this

                    const { name, subject, description } = response;
                    setFormData({ name, subject, description });
                })
                .catch(error => {
                    toast.error("Error loading support request");
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
        if (id) {
        SupportService.updateSupport(id, formData)
        .then(() => {
            toast.success('Support request updated successfully!');
            navigate('/support-list');
            setIsSubmitting(false);
        })
        .catch(() => {
            toast.error('Error updating support request');
        });
        } else {
        SupportService.createSupport(formData)
        .then(() => {
            toast.success("Support request submitted successfully!");
            navigate('/support-list');
            setIsSubmitting(false);
        })
        .catch(() => {
            toast.error("Error submitting support request");
        });
        }
    };

    return (
        <div className="p-6 bg-[#F5EFFF] min-h-screen">
            <div className="py-4 px-2 flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                    {id ? "Edit Support Request" : "Support Request"}
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => navigate('/support')}
                        title="Back"
                        className="p-2 bg-[#A294F9] rounded shadow">
                        <FiUser className="text-white" />
                    </button>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="p-8 w-full max-w-8xl">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6 flex flex-col md:flex-row gap-6">
                            <div className="w-full">
                                <label className="block text-sm text-gray-600 mb-1">Your Name</label>
                                <div className="relative">
                                   
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-4 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                                        placeholder="Enter your full name"
                                        required
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="w-full">
                                <label className="block text-sm text-gray-600 mb-1">Subject</label>
                                <div className="relative">
                                        <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full pl-4 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                                        placeholder="What's this about?"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm text-gray-600 mb-1">Description</label>
                            <div className="relative">
                                    <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full pl-4 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                                    rows="5"
                                    placeholder="Please describe your issue in detail..."
                                    required
                                />
                            </div>
                        </div>

                        <input
                            type="hidden"
                            name="status"
                            value={formData.status || ''}
                        />

                        <div className="flex justify-end mt-8">
                            <button
                                type="button"
                                onClick={() => navigate('/support-list')}
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

export default SupportForm;
