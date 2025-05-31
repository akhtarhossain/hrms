import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiList } from "react-icons/fi";
import { toast } from "react-toastify";
import PolicyService from "../../../services/PolicyService";

const policyCategories = [
  "All Categories",
  "Work Environment",
  "Development",
  "Security",
  "HR",
  "Compliance",
  "Benefits",
];

const statusOptions = ["Draft", "Active", "Archived"];

const PoliciesForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // URL se ID lenge

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "All Categories",
    status: "Draft",
    effectiveDate: "",
    description: "",
  });

  useEffect(() => {
    if (id) {
      PolicyService.getPolicyById(id)
        .then((response) => {
          if (response) {
            setFormData({
              ...response,
              effectiveDate: response.effectiveDate ? new Date(response.effectiveDate).toISOString().split('T')[0] : '',
            });
          } else {
            toast.error("Policy not found");
            navigate("/policies-list");
          }
        })
        .catch((error) => {
          console.error("Error fetching policy:", error);
          toast.error("Failed to load policy");
          navigate("/policies-list");
        });
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const policyData = {
      title: formData.title,
      category: formData.category,
      status: formData.status,
      effectiveDate: formData.effectiveDate,
      description: formData.description,
    };
      setIsSubmitting(true);
    
    const action = id 
      ? PolicyService.updatePolicy(id, policyData)
      : PolicyService.createPolicy(policyData);

    action
      .then(() => {
        toast.success(`Policy ${id ? "updated" : "created"} successfully`);
        navigate("/policies-list");
      })
      .catch((error) => {
        console.error("Error saving policy:", error);
        toast.error("Failed to save policy");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="p-6 bg-[#F5EFFF] min-h-screen">
      <div className="py-4 px-2 flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {id ? "Edit Policy" : "Add Policy"}
        </h2>
        <button
          onClick={() => navigate("/policies-list")}
          title="List"
          className="p-2 bg-[#A294F9] rounded shadow"
        >
          <FiList className="text-white" />
        </button>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-5xl">
          <form onSubmit={handleSubmit}>
            {/* Pehla pair: Title aur Category */}
            <div className="flex gap-4 mb-4 w-full">
              <div className="w-1/2">
                <label htmlFor="title" className="block mb-1 font-semibold text-[#333]">Policy Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  placeholder="Enter policy title"
                  required
                />
              </div>

              <div className="w-1/2">
                <label htmlFor="category" className="block mb-1 font-semibold text-[#333]">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none appearance-none"
                  required
                >
                  {policyCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dusra pair: Status aur Effective Date */}
            <div className="flex gap-4 mb-4 w-full">
              <div className="w-1/2">
                <label htmlFor="status" className="block mb-1 font-semibold text-[#333]">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none appearance-none"
                  required
                >
                  {statusOptions.map((status, idx) => (
                    <option key={idx} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="w-1/2">
                <label htmlFor="effectiveDate" className="block mb-1 font-semibold text-[#333]">Effective Date</label>
                <input
                  type="date"
                  id="effectiveDate"
                  name="effectiveDate"
                  value={formData.effectiveDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Description field (full width) */}
            <div className="w-full mb-4">
              <label htmlFor="description" className="block mb-1 font-semibold text-[#333]">Policy Description</label>
              <textarea
                id="description"
                name="description"
                rows="6"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none resize-y"
                placeholder="Enter policy description"
                required
              ></textarea>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => navigate("/policies-list")}
                className="px-4 py-2 rounded shadow text-white bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded shadow text-white bg-[#A294F9]"
              >
              {isSubmitting ? 'Saving.....' : id ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PoliciesForm;