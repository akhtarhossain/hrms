import axios from 'axios';
import SessionService from './SessionService';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export class HttpService {

  constructor() {
    this.instance = axios.create({
      baseURL: baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      withCredentials: true,
    });

    // Interceptor to inject token
    this.instance.interceptors.request.use(this.injectToken, this.handleError);

    // Interceptor to handle responses
    this.instance.interceptors.response.use(
      (response) => response,
      this.handleError
    );
  }

  // Function to inject token into request
  injectToken = (config) => {
    const user = SessionService.getLoggedIn();
    if (user && user.data && user.data.accessToken) {
      config.headers.set('Authorization', `Bearer ${user.data.accessToken}`);
    }
    return config;
  };

  // Function to handle errors
  handleError = (error) => {
    const { response } = error;
    if (response) {
      if (response.status === 401) {
        SessionService.logout();
        window.location.href = '/login';
      } else if (response.status === 403) {
        // Handle 403 errors
      }
    }
    return Promise.reject(error);
  };

  // GET request
  get(path, params = {}, headers = {}) {
    let queryString = '';
    if (params) {
      queryString = this.objToQuery(params);
    }
    return this.instance.get(`${path}${queryString}`, { headers });
  }

  // POST request
  post(path, data, headers = {}) {
    return this.instance.post(path, data, { headers });
  }

  // PUT request
  put(path, data, headers = {}) {
    return this.instance.put(path, data, { headers });
  }

  // PATCH request
  patch(path, data, headers = {}) {
    return this.instance.patch(path, data, { headers });
  }

  // DELETE request
  delete(path, headers = {}) {
    return this.instance.delete(path, { headers });
  }

  // Utility function to convert an object to a query string
  objToQuery(obj) {
    if (!obj) {
      return '';
    }
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    return `?${params.toString()}`;
  }
}

