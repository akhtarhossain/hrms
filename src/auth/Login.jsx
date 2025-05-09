import React from "react";
import { FaUser, FaLock } from "react-icons/fa";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">

      {/* Login Card */}
      <div className="rounded-2xl shadow-xl px-10 py-14 w-full max-w-md z-30" style={{ backgroundColor: '#F5EFFF' }}>
        <h2 className="text-3xl font-bold text-center text-[#A294F9] mb-8">Login</h2>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FaUser className="text-[#A294F9] mr-2" />
              <input
                type="text"
                placeholder="Enter your username"
                className="outline-none flex-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <FaLock className="text-[#A294F9] mr-2" />
              <input
                type="password"
                placeholder="Enter your password"
                className="outline-none flex-1"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <a href="#" className="text-sm text-[#A294F9] hover:underline">Forgot Password?</a>
          </div>
          <button
            type="submit"
            className="w-full bg-[#A294F9] hover:bg-[#8c7ff6] text-white font-semibold py-2.5 rounded-lg transition duration-300"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <a href="#" className="text-[#A294F9] hover:underline">Sign Up</a>
        </p>
      </div>
    </div>
  );
}