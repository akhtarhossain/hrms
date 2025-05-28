// services/PolicyService.js
import { toast } from 'react-toastify';
import { HttpService } from "./HttpClient.service";

function objectToQueryString(params) {
    const queryString = new URLSearchParams();
    for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            const value = params[key];
            if (value !== undefined && value !== null && value !== '') {
                queryString.append(key, value);
            }
        }
    }
    // IMPORTANT: This function returns the string WITH a leading '?' or an empty string
    return queryString.toString() ? `?${queryString.toString()}` : '';
}

class PolicyService extends HttpService {
    constructor() {
        super();
    }

    /**
     * Get all policies
     * @param {Object} params - Optional query parameters
     * @returns {Promise<any[]>}
     */
    getPolicies(params = {}) {
        // Correct usage if you wanted to use objectToQueryString (pass the object directly)
        const finalQueryStringWithQuestionMark = objectToQueryString(params); // Ye "?key=value" ya "" hoga
        console.log("Final Query String (with ?):", finalQueryStringWithQuestionMark);

        // Ab direct jor dein, kyunki finalQueryStringWithQuestionMark mein ? sign ya khali string hai
        const finalUrl = `/policies${finalQueryStringWithQuestionMark}`;
        console.log(finalUrl);
        

          return this.get('/policies', params ) // <--- THIS IS THE KEY CHANGE
            .then((response) => response.data)
            .catch((error) => {
                console.error('Error fetching policies:', error);
                toast.error('Error fetching policies');
                throw error;
            });
    }

    /**
     * Get a single policy by ID
     * @param {string} policyId - Policy ID
     * @returns {Promise<any>}
     */
    getPolicyById(policyId) {
        // Backend endpoint for fetching a single policy by ID
        return this.get(`/policies/${policyId}`)
            .then((response) => response.data)
            .catch((error) => {
                console.error('Error fetching policy by ID:', error);
                toast.error('Error fetching policy');
                throw error;
            });
    }

    /**
     * Create a new policy
     * @param {Object} policyData - Policy data
     * @returns {Promise<any>}
     */
    createPolicy(policyData) {
        // Backend endpoint for creating a new policy
        // Backend will generate 'id' and 'lastUpdateDate'
        return this.post('/policies', policyData)
            .then((response) => response.data)
            .catch((error) => {
                console.error('Error creating policy:', error);
                toast.error('Error creating policy');
                throw error;
            });
    }

    /**
     * Update a policy by ID
     * @param {string} policyId - Policy ID
     * @param {Object} policyData - Updated policy data
     * @returns {Promise<any>}
     */
    updatePolicy(policyId, policyData) {
        // Backend endpoint for updating an existing policy by ID
        // Backend will update 'lastUpdateDate'
        return this.patch(`/policies/${policyId}`, policyData) // Using PATCH for partial updates, consistent with TransactionTypeService
            .then((response) => response.data)
            .catch((error) => {
                console.error('Error updating policy:', error);
                toast.error('Error updating policy');
                throw error;
            });
    }

    /**
     * Delete a policy by ID
     * @param {string} policyId - Policy ID
     * @returns {Promise<any>}
     */
    deletePolicy(policyId) {
        // Backend endpoint for deleting a policy by ID
        return this.delete(`/policies/${policyId}`)
            .then((response) => response.data)
            .catch((error) => {
                console.error('Error deleting policy:', error);
                toast.error('Error deleting policy');
                throw error;
            });
    }


}

export default new PolicyService();
