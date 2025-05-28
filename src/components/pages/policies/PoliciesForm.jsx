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

  const [formData, setFormData] = useState({
    title: "",
    category: "All Categories",
    status: "Draft",
    effectiveDate: "",
    description: "",
    // lastUpdateDate field yahan frontend se nahi bheja jayega,
    // balki backend khud manage karega aur fetch hone par milega.
  });

  useEffect(() => {
    if (id) {
      // Agar ID hai, toh edit mode hai, policy data fetch karo
      PolicyService.getPolicyById(id)
        .then((response) => {
          if (response) {
            // Backend se mili hui response mein id aur lastUpdateDate bhi honge.
            // effectiveDate ko format karna zaroori hai agar backend se alag format mein aaye.
            setFormData({
              ...response,
              effectiveDate: response.effectiveDate ? new Date(response.effectiveDate).toISOString().split('T')[0] : '',
            });
          } else {
            toast.error("Policy not found");
            // Agar policy nahi mili, toh navigate back kar sakte hain ya error state dikha sakte hain
            navigate("/policies-list");
          }
        })
        .catch((error) => {
          console.error("Error fetching policy:", error);
          toast.error("Failed to load policy");
          navigate("/policies-list"); // Error hone par list par wapas bhej do
        });
    }
  }, [id, navigate]); // navigate ko dependency array mein add kiya

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // policyData mein sirf woh fields jo frontend se bheje jayenge.
    // ID aur lastUpdateDate backend handle karega.
    const policyData = {
      title: formData.title,
      category: formData.category,
      status: formData.status,
      effectiveDate: formData.effectiveDate,
      description: formData.description,
    };

    let action;
    if (id) {
      // Edit mode: existing policy ko update karo
      action = PolicyService.updatePolicy(id, policyData);
    } else {
      // Add mode: naya policy create karo
      action = PolicyService.createPolicy(policyData);
    }

    action
      .then(() => {
        toast.success(`Policy ${id ? "updated" : "created"} successfully`);
        navigate("/policies-list"); // Success hone par list page par navigate karo
      })
      .catch((error) => {
        console.error("Error saving policy:", error);
        toast.error("Failed to save policy");
      });
  };

  return (
    <div className="p-6 bg-[#F5EFFF] min-h-screen font-inter">
      <div className="py-4 px-2 flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {id ? "Edit Policy" : "Add Policy"}
        </h2>
        <button
          onClick={() => navigate("/policies-list")}
          title="List"
          className="p-2 bg-[#A294F9] rounded-lg shadow-md hover:bg-[#8e7be0] transition-colors duration-200"
        >
          <FiList className="text-white text-xl" />
        </button>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-5xl bg-white p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="title" className="block mb-2 font-semibold text-[#333]">Policy Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A294F9] focus:outline-none transition-all duration-200"
                  placeholder="Enter policy title"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block mb-2 font-semibold text-[#333]">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A294F9] focus:outline-none appearance-none bg-white transition-all duration-200"
                  required
                >
                  {policyCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block mb-2 font-semibold text-[#333]">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A294F9] focus:outline-none appearance-none bg-white transition-all duration-200"
                  required
                >
                  {statusOptions.map((status, idx) => (
                    <option key={idx} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="effectiveDate" className="block mb-2 font-semibold text-[#333]">Effective Date</label>
                <input
                  type="date"
                  id="effectiveDate"
                  name="effectiveDate"
                  value={formData.effectiveDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A294F9] focus:outline-none transition-all duration-200"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block mb-2 font-semibold text-[#333]">Policy Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="6"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A294F9] focus:outline-none resize-y transition-all duration-200"
                  placeholder="Enter policy description"
                  required
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => navigate("/policies-list")}
                className="px-6 py-3 rounded-lg shadow-md text-white bg-gray-500 hover:bg-gray-600 transition-colors duration-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg shadow-md text-white bg-[#A294F9] hover:bg-[#8e7be0] transition-colors duration-200 font-semibold"
              >
                {id ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PoliciesForm;
