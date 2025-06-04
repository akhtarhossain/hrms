import { toast } from 'react-toastify';
import { HttpService } from "./HttpClient.service";

class LeaveService extends HttpService {
  constructor() {
    super();
  }

  getLeaves(data) {
    return this.get(`/leave`, data)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching salary data:', error);
        toast.error(`${error}`);
        throw error;
      });
  }

  getLeaveById(id) {
    return this.get(`/leave/${id}`).then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching leave data by ID:', error);
        toast.error(`${error}`);
        throw error;
      });
  }

  createLeave(leaveData) {
    return this.post('/leave', leaveData).then((response) => response.data)
      .catch((error) => {
        console.error('Error creating leave:', error);
        toast.error(`${error}`);
        throw error;
      });
  }

  updateLeave(id, leaveData) {
    return this.patch(`/leave/${id}`, leaveData).then((response) => response.data)
      .catch((error) => {
        console.error('Error updating leave:', error);
        toast.error(`${error}`);
        throw error;
      });
  }

  deleteLeave(leaveId) {
    return this.delete(`/leave/${leaveId}`).then((response) => response.data)
      .catch((error) => {
        console.error('Error deleting leave:', error);
        toast.error(`${error}`);
        throw error;
      });
  }

  // Fixed updateLeaveStatus method
  updateLeaveStatus(id, status) {
    // Send status as an object property
    return this.patch(`/leave/${id}/status`, { status })
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error updating leave status:', error);
        // Improved error message
        const errorMessage = error.response?.data?.message || 
                           'Failed to update leave status';
        toast.error(errorMessage);
        throw error;
      });
  }
}

export default new LeaveService();