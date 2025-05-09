import React , { useState } from "react";
import { useForm } from "react-hook-form";
import { FaUser, FaLock } from "react-icons/fa";
import { AuthService } from "../services/Auth.services";
import SessionService from "../services/SessionService";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

const authService = new AuthService();

export default function LoginPage() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const onSubmit = (data) => {
        setIsSubmitting(true);
        authService
          .logIn(data)
          .then((res) => {
            SessionService.setLogin(res);
            reset();
            setTimeout(() => {
              toast.success("User login successfully");
              navigate("/");
            }, 1000);
          })
          .catch((err) => {
            console.log(err);
            toast.error("Invalid email or password");
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

            {/* Login Card */}
            <div className="rounded-2xl shadow-xl px-10 py-12 w-full max-w-md z-10 bg-[#F5EFFF] mb-20">
                <h2 className="text-3xl font-bold text-center text-[#A294F9] mb-6">Login</h2>
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                            <FaUser className="text-[#A294F9] mr-2" />
                            <input
                                type="text"
                                placeholder="Enter your Email"
                                className="outline-none flex-1"
                                {...register("email", { required: "Email is required" })}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                            <FaLock className="text-[#A294F9] mr-2" />
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="outline-none flex-1"
                                {...register("password", { required: "Password is required" })}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <a href="/forgot" className="text-sm text-[#A294F9] hover:underline">Forgot Password?</a>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#A294F9] hover:bg-[#8c7ff6] text-white font-semibold py-2.5 rounded-lg transition duration-300"
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="mt-5 text-center text-sm text-gray-600">
                    Don't have an account? <a href="/signup" className="text-[#A294F9] hover:underline">Sign Up</a>
                </p>
            </div>
        </div>
    );
}
