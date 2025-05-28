import { toast } from 'react-toastify';
import { HttpService } from "./HttpClient.service";
import axios from 'axios';

class PayrollService extends HttpService {
  constructor() {
    super();
  }

  // getPayroll(params = {}) {
  //   const queryString = new URLSearchParams(params).toString();
  //   return this.get(`/payroll`)
  //     .then((response) => response.data)
  //     .catch((error) => {
  //       console.error('Error fetching payroll data:', error);
  //       toast.error(`${error}`);
  //       throw error;
  //     });
  // }

getPayroll(PayrollData) {
return this.get('/payroll', PayrollData).then((response) => response.data)
  .catch((error) => {
    console.error('Error fetching license rights:', error);
    toast.error(`${error}`);
    throw error;
  });
  }
  

getPayrollById(payrollId) {
  return this.get(`/payroll/${payrollId}`)
    .then((response) => {
      if (!response.data) {
        throw new Error('No data found for the given ID.');
      }
      return response.data;
    })
    .catch((error) => {
      console.error('Error fetching payroll data by ID:', error);
      toast.error(`Error: ${error.message}`);
      throw error;
    });
}


  createPayroll(PayrollData) {
    return this.post('/payroll', PayrollData).then((response) => response.data)
        .catch((error) => {
          console.error('Error creating payroll:', error);
          toast.error(`${error}`);
          throw error;
        });
  }

  updatePayroll(PayrollId, PayrollData) {
    return this.patch(`/payroll/${PayrollId}`, PayrollData).then((response) => response.data)
        .catch((error) => {
          console.error('Error updating payroll:', error);
          toast.error(`${error}`);
          throw error;
        });
  }

  deletePayroll(PayrollId) {
    return this.delete(`/payroll/${PayrollId}`).then((response) => response.data)
        .catch((error) => {
          console.error('Error deleting payroll:', error);
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

export default new PayrollService();
