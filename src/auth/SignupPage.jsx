import React , { useState } from "react";
import { useForm } from "react-hook-form";
import { FaUser, FaLock } from "react-icons/fa";
import { AuthService } from "../services/Auth.services";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const authService = new AuthService();

export default function SignupPage() {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const onSubmit = (data) => {
        setIsSubmitting(true);
        authService.signUp(data)
          .then((res) => {
            reset();
            setTimeout(() => {
              navigate('/login', { state: { showLogin: true }, replace: true });
              toast.success('User created successful');
            }, 1000);
          })
          .catch((err) => {
            console.log(err);
            toast.error('Email already exist');
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      };

    return (
        <div className="min-h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: "url('/src/assets/login-background.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            ></div>

            {/* Card */}
            <div className="rounded-2xl shadow-xl px-10 py-12 w-full max-w-2xl z-10 bg-[#F5EFFF] mb-32">
                <h2 className="text-3xl font-bold text-center text-[#A294F9] mb-8">Sign Up</h2>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

                    {/* Row 1: First Name and Last Name */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                                <FaUser className="text-[#A294F9] mr-2" />
                                <input
                                    type="text"
                                    placeholder="Enter first name"
                                    className="outline-none flex-1 bg-transparent"
                                    {...register("firstName", { required: "First name is required" })}
                                />
                            </div>
                            {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>}
                        </div>

                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                                <FaUser className="text-[#A294F9] mr-2" />
                                <input
                                    type="text"
                                    placeholder="Enter last name"
                                    className="outline-none flex-1 bg-transparent"
                                    {...register("lastName", { required: "Last name is required" })}
                                />
                            </div>
                            {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    {/* Row 2: Email and Role */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                                <FaUser className="text-[#A294F9] mr-2" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="outline-none flex-1 bg-transparent"
                                    {...register("email", { required: "Email is required" })}
                                />
                            </div>
                            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <div className="border border-gray-300 rounded-lg px-3 py-2">
                                <select
                                    className="w-full outline-none bg-transparent"
                                    {...register("role", { required: "Role is required" })}
                                >
                                    <option value="">Select role</option>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>}
                        </div>
                    </div>

                    {/* Row 3: Password and Confirm Password */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                                <FaLock className="text-[#A294F9] mr-2" />
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="outline-none flex-1 bg-transparent"
                                    {...register("password", { required: "Password is required" })}
                                />
                            </div>
                            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
                        </div>

                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                                <FaLock className="text-[#A294F9] mr-2" />
                                <input
                                    type="password"
                                    placeholder="Confirm your password"
                                    className="outline-none flex-1 bg-transparent"
                                    {...register("confirmPassword", {
                                        required: "Please confirm your password",
                                        validate: (value) =>
                                            value === watch("password") || "Passwords do not match",
                                    })}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#A294F9] hover:bg-[#8c7ff6] text-white font-semibold py-2.5 rounded-lg transition duration-300"
                    >
                        {isSubmitting ? "Signing up..." : "Sign Up"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <a href="/login" className="text-[#A294F9] hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}
