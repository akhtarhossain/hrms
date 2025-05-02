// src/services/UserService.js

import { HttpService } from './HttpClient.service';
import { toast } from "react-toastify";

class UserService extends HttpService {
  constructor() {
    super(); // Replace with your API's base URL
  }

  getUser(params) {
    toast.success('Toast Integrated Successfully');
    return this.get('/users', params)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching user:', error);
        toast.error('Failed to fetch user.');
        throw error;
      });
  }

  createUser(userData) {
    return this.post('/users', userData);
  }

  updateUser(userId, userData) {
    return this.put(`/users/${userId}`, userData);
  }

  deleteUser(userId) {
    return this.delete(`/users/${userId}`);
  }
}

export default new UserService();
