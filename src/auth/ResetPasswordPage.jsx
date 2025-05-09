import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaLock } from "react-icons/fa";
import { AuthService } from "../services/Auth.services";

const authService = new AuthService();

export default function ResetPasswordPage() {
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmitReset = (data) => {
    if (!data || !email) {
      console.error("Missing required fields!");
      return;
    }
    const payload = {
      password: data.confirmPassword,
      email: email
    };
    setLoading(true);
    authService.resetPassword(payload)
      .then(response => {
        toast.success("Password reset successfully!");
        navigate("/login");
      })
      .catch(error => {
        console.error("Error resetting password:", error.response?.data || error);
        toast.error("Error: Password not reset!");
      })
      .finally(() => {
        setLoading(false);
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

      {/* Reset Password Card */}
      <div className="rounded-2xl shadow-xl px-10 py-12 w-full max-w-md z-10 bg-[#F5EFFF] mb-20">
        <h2 className="text-3xl font-bold text-center text-[#A294F9] mb-6">Reset Password</h2>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmitReset)}>
          {/* New Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FaLock className="text-[#A294F9] mr-2" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="outline-none flex-1"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" }
                })}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="ml-2 text-sm text-gray-600 focus:outline-none"
              >
                <i className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FaLock className="text-[#A294F9] mr-2" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="outline-none flex-1"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === getValues("newPassword") || "Passwords do not match"
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="ml-2 text-sm text-gray-600 focus:outline-none"
              >
                <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-[#A294F9] hover:bg-[#8c7ff6] text-white font-semibold py-2.5 rounded-lg transition duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            <div className="flex justify-center items-center">
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              )}
              {loading ? "Resetting..." : "Reset Password"}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
