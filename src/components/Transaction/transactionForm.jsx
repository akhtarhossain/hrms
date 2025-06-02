import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiList } from "react-icons/fi";
import TransactionTypeService from "../../services/TransactionTypeService";
import { toast } from "react-toastify";



const TransactionTypeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    transactionType: "",
    name: "",
  });

  useEffect(() => {
    if (id) {
      TransactionTypeService.getTransactionTypeById(id)
        .then((response) => {
          setFormData({
            transactionType: response.transactionType || 'allowance',
            name: response.name || '',
          });
        })
        .catch((error) => {
          console.error('Error fetching transaction type:', error);
          toast.error('Failed to load transaction type');
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const transactionTypeData = {
      transactionType: formData.transactionType,
      name: formData.name,
    };

    if (id) {
      TransactionTypeService.updateTransactionType(id, transactionTypeData)
        .then(() => {
          toast.success('Transaction type updated successfully!');
          navigate('/transaction');
        })
        .catch((error) => {
          toast.error('Error updating transaction type');
          setIsSubmitting(false);
        });
    } else {
      TransactionTypeService.createTransactionType(transactionTypeData)
        .then(() => {
          toast.success("Transaction type created successfully!");
          navigate('/transaction');
        })
        .catch(error => {
          toast.error("Error saving transaction type");
          setIsSubmitting(false);
        });
    }
  };

  return (
    <div className="p-6 bg-[#F5EFFF] min-h-screen">
      <div className="py-4 px-2 flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {id ? "Edit Transaction Type" : "Add Transaction Type"}
        </h2>
        <button
          onClick={() => navigate('/transaction')}
          title="List"
          className="p-2 bg-[#A294F9] rounded shadow"
        >
          <FiList className="text-white" />
        </button>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-5xl">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4 mb-4 w-full">
              <div className="w-1/2">
                <label className="block mb-1 font-semibold text-[#333]">Transaction Type</label>
                <select
                  name="transactionType"
                  value={formData.transactionType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  required
                >
                  <option value="">Select transaction type</option>
                  <option value="allowance">Allowance</option>
                  <option value="deduction">Deduction</option>
                </select>
              </div>
              <div className="w-1/2">
                <label className="block mb-1 font-semibold text-[#333]">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#A294F9] focus:outline-none"
                  required
                  placeholder="Enter name"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/transaction')}
                className="px-4 py-2 rounded shadow text-white bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded shadow text-white bg-[#A294F9]"
              >
                {isSubmitting ? 'Saving...' : id ? 'Update' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionTypeForm;