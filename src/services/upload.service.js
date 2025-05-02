// src/services/UploadService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;


/**
 * Service for handling Projects API requests
 */
class UploadService {
  /**
   * Upload a new video project
   * @param {File} videoFile
   * @param {Object} projectData
   * @returns {Promise}
   */
  async uploadVideo( projectData) {
    try {
      const response = await axios.post(`${API_URL}/upload`, projectData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async uploadSrt(srt) {
    try {
      const response = await axios.post(`${API_URL}/upload/filename`, srt);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Common error handler
   * @param {Error} error - Error object
   */
  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
  }
}

export default new UploadService();