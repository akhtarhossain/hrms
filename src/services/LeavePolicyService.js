import { toast } from 'react-toastify';
import { HttpService } from './HttpClient.service';

class LeavePolicyService extends HttpService {
  constructor() {
    super();
  }

  getLeavePolicies(params) {
    return this.get(`/leavePolicy` ,params)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching leave policies:', error);
        toast.error(`${error}`);
        throw error;
      });
  }

  getLeavePolicyById(id) {
    return this.get(`/leavePolicy/${id}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching leave policy by ID:', error);
        toast.error(`${error}`);
        throw error;
      });
  }

  createLeavePolicy(leavePolicyData) {
    return this.post('/leavePolicy', leavePolicyData)
      .then(response => response.data)
      .catch(error => {
        console.error('Error creating leave policy:', error);
        toast.error(`${error}`);
        throw error;
      });
  }

  updateLeavePolicy(id, leavePolicyData) {
    return this.patch(`/leavePolicy/${id}`, leavePolicyData)
      .then(response => response.data)
      .catch(error => {
        console.error('Error updating leave policy:', error);
        toast.error(`${error}`);
        throw error;
      });
  }

  deleteLeavePolicy(id) {
    return this.delete(`/leavePolicy/${id}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error deleting leave policy:', error);
        toast.error(`${error}`);
        throw error;
      });
  }
}

export default new LeavePolicyService();
