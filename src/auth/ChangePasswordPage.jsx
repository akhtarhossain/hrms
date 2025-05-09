import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaLock } from 'react-icons/fa';
import { AuthService } from "../services/Auth.services";
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const authService = new AuthService();

export default function ChangePasswordPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = params.get('email') || '';

  const { register, handleSubmit, getValues, reset, formState: { errors } } = useForm({
    defaultValues: {
      email: email,
      password: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    mode: 'onChange',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (values) => {
    setIsSubmitting(true);
    const payload = {
      password: values.password,
      newPassword: values.newPassword,
    };

    authService.changePassword(payload)
      .then(() => {
        toast.success('Password changed successfully!');
        reset();
        setTimeout(() => navigate('/'), 1000);
      })
      .catch(() => {
        toast.error('Error: Invalid old password!');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/src/assets/login-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* Change Password Card */}
      <div className="rounded-2xl shadow-xl px-10 py-12 w-full max-w-md z-10 bg-[#F5EFFF] mb-20">
        <h2 className="text-3xl font-bold text-center text-[#A294F9] mb-6">Change Password</h2>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Old Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FaLock className="text-[#A294F9] mr-2" />
              <input
                type={showOld ? 'text' : 'password'}
                placeholder="Enter old password"
                className="outline-none flex-1"
                {...register('password', { required: 'Old password is required' })}
              />
              <button type="button" onClick={() => setShowOld(!showOld)} className="ml-2 text-xs">
                <i className={`fas ${showOld ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FaLock className="text-[#A294F9] mr-2" />
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                className="outline-none flex-1"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="ml-2 text-xs">
                <i className={`fas ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.newPassword && <p className="text-sm text-red-500 mt-1">{errors.newPassword.message}</p>}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FaLock className="text-[#A294F9] mr-2" />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                className="outline-none flex-1"
                {...register('confirmNewPassword', {
                  required: 'Please confirm your new password',
                  validate: value => value === getValues('newPassword') || 'Passwords do not match',
                })}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="ml-2 text-xs">
                <i className={`fas ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.confirmNewPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmNewPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#A294F9] hover:bg-[#8c7ff6] text-white font-semibold py-2.5 rounded-lg transition duration-300"
          >
            {isSubmitting ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
