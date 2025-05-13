import { toast } from 'react-toastify';
import { HttpService } from "./HttpClient.service";

class TransactionTypeService extends HttpService {
  constructor() {
    super();
  }

  /**
   * Get all transaction types
   * @param {Object} params - Optional query parameters
   * @returns {Promise<any[]>}
   */
  getTransactionTypes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/transaction-type${queryString ? `?${queryString}` : ''}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching transaction types:', error);
        toast.error('Error fetching transaction types');
        throw error;
      });
  }

  /**
   * Get a single transaction type by ID
   * @param {string} transactionTypeId - Transaction Type ID
   * @returns {Promise<any>}
   */
  getTransactionTypeById(transactionTypeId) {
    return this.get(`/transaction-type/${transactionTypeId}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching transaction type by ID:', error);
        toast.error('Error fetching transaction type');
        throw error;
      });
  }

  /**
   * Create a new transaction type
   * @param {Object} transactionTypeData - Transaction type data
   * @returns {Promise<any>}
   */
  createTransactionType(transactionTypeData) {
    return this.post('/transaction-type', transactionTypeData)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error creating transaction type:', error);
        toast.error('Error creating transaction type');
        throw error;
      });
  }

  /**
   * Update a transaction type by ID
   * @param {string} transactionTypeId - Transaction Type ID
   * @param {Object} transactionTypeData - Updated transaction type data
   * @returns {Promise<any>}
   */
  updateTransactionType(transactionTypeId, transactionTypeData) {
    return this.patch(`/transaction-type/${transactionTypeId}`, transactionTypeData)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error updating transaction type:', error);
        toast.error('Error updating transaction type');
        throw error;
      });
  }

  /**
   * Delete a transaction type by ID
   * @param {string} transactionTypeId - Transaction Type ID
   * @returns {Promise<any>}
   */
  deleteTransactionType(transactionTypeId) {
    return this.delete(`/transaction-type/${transactionTypeId}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error deleting transaction type:', error);
        toast.error('Error deleting transaction type');
        throw error;
      });
  }
}

export default new TransactionTypeService();
