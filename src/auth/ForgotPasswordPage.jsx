import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/Auth.services";
import SessionService from "../services/SessionService";
import { toast } from "react-toastify";
import { FaEnvelope } from "react-icons/fa";

const authService = new AuthService();

export default function ForgotPasswordPage() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = (data) => {
        setIsSubmitting(true);
        const startTime = Date.now();

        authService
            .forgotPassword(data)
            .then(() => {
                reset();
                const delay = Math.max(2000 - (Date.now() - startTime), 0);
                setTimeout(() => {
                    toast.success("Please check Email for OTP.");
                    navigate(`/otp?email=${data.email}`);
                }, delay);
            })
            .catch(() => {
                toast.error("Email not exist.");
            })
            .finally(() => {
                const delay = Math.max(2000 - (Date.now() - startTime), 0);
                setTimeout(() => {
                    setIsSubmitting(false);
                }, delay);
            });
    };

    const handleCancel = () => {
        navigate(-1);
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

            {/* Forgot Password Card */}
            <div className="rounded-2xl shadow-xl px-10 py-12 w-full max-w-md z-10 bg-[#F5EFFF] mb-20">
                <h2 className="text-3xl font-bold text-center text-[#A294F9] mb-6">Forgot Password</h2>
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                            <FaEnvelope className="text-[#A294F9] mr-2" />
                            <input
                                type="email"
                                placeholder="Enter your Email"
                                className="outline-none flex-1"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^\S+@\S+\.\S+$/,
                                        message: "Please enter a valid email",
                                    },
                                })}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#A294F9] hover:bg-[#8c7ff6] text-white font-semibold py-2.5 rounded-lg transition duration-300"
                    >
                        {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="w-full mt-2 bg-white text-[#A294F9] border border-[#A294F9] py-2.5 rounded-lg hover:bg-[#A294F9] hover:text-white transition duration-300"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
