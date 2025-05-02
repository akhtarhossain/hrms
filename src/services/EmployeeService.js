import { toast } from 'react-toastify';
import { HttpService } from "./HttpClient.service";
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

  createEmployee(EmployeeData) {
    return this.post('/employ', EmployeeData);
  }

  updateEmployee(EmployeeId, EmployeeData) {
    return this.patch(`/license-rights/${EmployeeId}`, EmployeeData);
  }

  deleteEmployee(EmployeeId) {
    return this.delete(`/license-rights/${EmployeeId}`);
  }
}

export default new EmployeeService();
