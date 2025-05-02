// src/services/SessionService.ts

import { LocalStorageService } from "./LocalStorage.services";
const SESSION_KEY = import.meta.env.VITE_SESSION_KEY;

class SessionService {
  constructor() {
    this.localStorageService = new LocalStorageService();
  }

  setLogin(info) {
    console.log(SESSION_KEY);
    this.localStorageService.save(SESSION_KEY, info);
  }

  getLoggedIn() {
    const user = this.localStorageService.get(SESSION_KEY);
    return user ?? null;
  }

  isAuthenticated() {
    return this.getLoggedIn() !== null;
  }

  logout() {
    this.localStorageService.remove(SESSION_KEY);
  }
}

export default new SessionService();
