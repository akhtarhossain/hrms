import { toast } from 'react-toastify';
import { HttpService } from "./HttpClient.service";
import axios from 'axios';

class SalaryService extends HttpService {
  constructor() {
    super();
  }

  getSalary(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/salary${queryString ? `?${queryString}` : ''}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching salary data:', error);
        toast.error(`${error}`);
        throw error;
      });
  }
  

  getSalaryById(salaryId) {
    return this.get(`/salary/${salaryId}`).then((response) => response.data)
        .catch((error) => {
          console.error('Error fetching salary data by ID:', error);
          toast.error(`${error}`);
          throw error;
        });
  }

  createSalary(SalaryData) {
    return this.post('/salary', SalaryData).then((response) => response.data)
        .catch((error) => {
          console.error('Error creating salary:', error);
          toast.error(`${error}`);
          throw error;
        });
  }

  updateSalary(SalaryId, SalaryData) {
    return this.patch(`/salary/${SalaryId}`, SalaryData).then((response) => response.data)
        .catch((error) => {
          console.error('Error updating salary:', error);
          toast.error(`${error}`);
          throw error;
        });
  }

  deleteSalary(SalaryId) {
    return this.delete(`/salary/${SalaryId}`).then((response) => response.data)
        .catch((error) => {
          console.error('Error deleting salary:', error);
          toast.error(`${error}`);
          throw error;
        });
  }

  async uploadImage(projectData) {
    try {
      const response = await axios.post('http://localhost:3000/upload', projectData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async uploadDocument(projectData) {
    try {
      const response = await axios.post('http://localhost:3000/upload', projectData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}

export default new SalaryService();
