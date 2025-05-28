import { toast } from 'react-toastify';
import { HttpService } from "./HttpClient.service";
import axios from 'axios';

class SupportService extends HttpService {
  constructor() {
    super();
  }

  getSupport(data) {
    return this.get(`/Support` , data)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching salary data:', error);
        toast.error(`${error}`);
        throw error;
      });
  }
  filterSupportTickets(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return this.get(`/Support${queryString ? `?${queryString}` : ''}`);
}
  

  getSupportById(id) {
    return this.get(`/Support/${id}`).then((response) => response.data)
        .catch((error) => {
          console.error('Error fetching salary data by ID:', error);
          toast.error(`${error}`);
          throw error;
        });
  }

  createSupport(SalaryData) {
    return this.post('/Support', SalaryData).then((response) => response.data)
        .catch((error) => {
          console.error('Error creating salary:', error);
          toast.error(`${error}`);
          throw error;
        });
  }

  updateSupport(id, SalaryData) {
    return this.patch(`/Support/${id}`, SalaryData).then((response) => response.data)
        .catch((error) => {
          console.error('Error updating salary:', error);
          toast.error(`${error}`);
          throw error;
        });
  }

  deleteSupport(ticketId) {
    return this.delete(`/Support/${ticketId}`).then((response) => response.data)
        .catch((error) => {
          console.error('Error deleting salary:', error);
          toast.error(`${error}`);
          throw error;
        });
  }

}

export default new SupportService();
