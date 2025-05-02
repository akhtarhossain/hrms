// src/services/LocalStorageService.js

export class LocalStorageService {
  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving key "${key}" to localStorage:`, error);
    }
  }

  get(key) {
    const value = localStorage.getItem(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(`Error parsing JSON for key "${key}" from localStorage:`, error);
      return null;
    }
  }

  remove(key) {
    localStorage.removeItem(key);
  }
}
