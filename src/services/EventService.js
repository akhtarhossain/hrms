// src/services/EventService.js

import axios from "axios";

const API_BASE_URL = "http://localhost:3000/events";

const EventService = {
  createEvent: async (eventData) => {
    try {
      const response = await axios.post(API_BASE_URL, eventData);
      return response.data;
    } catch (error) {
      console.error("Error creating event:", error.response?.data || error.message);
      throw error;
    }
  },

  getAllEvents: async (filters = {}) => {
    try {
      // filters object se status field remove kiya gaya hai
      const { status, ...restFilters } = filters; // status ko destructure kar ke remove kiya
      const queryParams = new URLSearchParams(restFilters).toString(); // Baqi filters ko query params banaya
      const response = await axios.get(`${API_BASE_URL}?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching events:", error.response?.data || error.message);
      throw error;
    }
  },

  getEventById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event with ID ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}`, eventData);
      return response.data;
    } catch (error) {
      console.error(`Error updating event with ID ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      return { message: "Event successfully deleted" };
    } catch (error) {
      console.error(`Error deleting event with ID ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // In your EventService.js
//  sendEventNotification: async (eventData) => {
//     try {
//       // CORRECTED: use axios instead of api
//       const response = await axios.post(`${API_BASE_URL}/send-notification`, eventData);
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   },

  scheduleEventReminder: async (eventData) => {
    try {
      // CORRECTED: use axios instead of api
      const response = await axios.post(`${API_BASE_URL}/schedule-reminder`, eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sendEventNotification: async (eventData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/send-notification` , eventData);
    
    toast.success(response.data.message);
    return true;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to send notifications');
    return false;
  }
},
  uploadDocument: async (projectData) => {
    try {
      const response = await axios.post(`http://localhost:3000/upload`, projectData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
};

export default EventService;