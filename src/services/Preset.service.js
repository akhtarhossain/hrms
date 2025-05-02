// src/services/projectsService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Service for handling Projects API requests
 */
class PresetService {
  /**
   * Upload a new video project
   * @param {File} videoFile - The video file to upload
   * @param {Object} projectData - Project data (title, language, description)
   * @returns {Promise} - API response
   */
  async createPreset(presetData) {
    try {  
      const response = await axios.post(`${API_URL}/presets`, presetData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Upload response:', response.data);
      return response.data; 
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get all projects with optional filtering
   * @param {Object} filters - Query parameters for filtering
   * @returns {Promise} - API response with projects list
   */
  async getAllPresets(filters = {}) {
    try {
      const response = await axios.get(`${API_URL}/presets`, {
        params: filters,
      });
      
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get a project by ID
   * @param {string} id - Project ID
   * @returns {Promise} - API response with project details
   */
  async getPresetById(id) {
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get a project by URL
   * @param {string} url - Project URL
   * @returns {Promise} - API response with project details
   */
  async getProjectByUrl(url) {
    try {
      const response = await axios.get(`${API_URL}/projects/url/${url}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Update a project
   * @param {string} id - Project ID
   * @param {Object} updateData - Data to update (title, language, description, etc.)
   * @returns {Promise} - API response with updated project
   */
  async updatePreset(id, updateData) {
    try {
      const response = await axios.patch(`${API_URL}/presets/${id}`, updateData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Delete a project
   * @param {string} id - Project ID
   * @returns {Promise} - API response
   */
  async deletePreset(id) {
    try {
      const response = await axios.delete(`${API_URL}/presets/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Translate a project to another language
   * @param {string} id - Project ID
   * @param {string} language - Target language code
   * @returns {Promise} - API response with translation details
   */
  async translateProject(id, language) {
    try {
      const response = await axios.post(`${API_URL}/projects/${id}/translate/${language}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Mark a project as proofread
   * @param {string} id - Project ID
   * @returns {Promise} - API response
   */
  async markAsProofread(id) {
    try {
      const response = await axios.patch(`${API_URL}/projects/${id}/proofread`);
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

export default new PresetService();