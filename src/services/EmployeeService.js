import { toast } from 'react-toastify';
import { HttpService } from "./HttpClient.service";
import axios from 'axios';

class EmployeeService extends HttpService {
  constructor() {
    super();
  }

  getEmployee(EmployeeData) {
    return this.get('/employ', EmployeeData).then((response) => response.data)
        .catch((error) => {
          console.error('Error fetching license rights:', error);
          toast.error(`${error}`);
          throw error;
        });
  }
    getEmployeeById(employeeId) {
      return this.get(`/employ/${employeeId}`).then((response) => response.data)
        .catch((error) => {
          console.error('Error fetching employee data:', error);
          toast.error(`${error}`);
          throw error;
        });
    }  

  createEmployee(EmployeeData) {
    return this.post('/employ', EmployeeData);
  }

  updateEmployee(EmployeeId, EmployeeData) {
    return this.patch(`/employ/${EmployeeId}`, EmployeeData);
  }

  deleteEmployee(EmployeeId) {
    return this.delete(`/employ/${EmployeeId}`);
  }
  async uploadImage( projectData) {
    try {
      const response = await axios.post(`http://localhost:3000/upload`, projectData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async uploadDocument( projectData) {
    try {
      const response = await axios.post(`http://localhost:3000/upload`, projectData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

}

export default new EmployeeService();
