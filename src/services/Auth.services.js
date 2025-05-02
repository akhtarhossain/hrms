import { HttpService } from './HttpClient.service';

export class AuthService extends HttpService {
  constructor() {
    super();
  }

  signUp(data) {
    return this.post('/users/create', data);
  }

  verifyAccount(verification) {
    return this.post('/verify-email', { verification });
  }

  resendVerificationEmail(email) {
    return this.post('/resend-verify-email', { email });
  }

  logIn(data) {
    return this.post('/users/login', data);
  }

  resetPassword(data) {
    return this.post('users/reset-password', data);
  }

  forgotPassword(data) {
    return this.post('users/forgot-password', data);
  }

  forgotPasswordVerify(data) {
    return this.post('users/forgot-password-verify', data);
  }

  changePassword(data) {
    return this.post('users/change-password', data);
  }
};