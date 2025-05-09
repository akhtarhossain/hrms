import React, { useRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "../services/Auth.services";
import { toast } from "react-toastify";

const authService = new AuthService();

export default function OtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpValues = watch(["otp0", "otp1", "otp2", "otp3"]);
  const inputsRef = useRef([]);

  const focusInput = (index) => {
    if (inputsRef.current[index]) {
      inputsRef.current[index].focus();
    }
  };

  useEffect(() => {
    focusInput(0);
  }, []);

  const handleInput = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value)) {
      setValue(`otp${index}`, value);
      if (index < 3) focusInput(index + 1);
    } else {
      setValue(`otp${index}`, "");
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      focusInput(index - 1);
    }
  };

  const onSubmitOTP = (data) => {
    const otp = `${data.otp0}${data.otp1}${data.otp2}${data.otp3}`;
    const payload = {
      email,
      verification: otp,
    };

    setIsVerifying(true);
    authService
      .forgotPasswordVerify(payload)
      .then(() => {
        setTimeout(() => {
          toast.success("OTP verified successfully");
          navigate(`/reset?email=${email}`);
        }, 1000);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Invalid OTP");
      })
      .finally(() => {
        setIsVerifying(false);
      });
  };

  const handleResendOTP = () => {
    const payload = { email };
    setIsResending(true);
    reset({ otp0: "", otp1: "", otp2: "", otp3: "" });
    focusInput(0);

    authService
      .forgotPassword(payload)
      .then(() => {
        setTimeout(() => {
          toast.success("OTP resent successfully. Please check your email.");
        }, 1000);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to resend OTP");
      })
      .finally(() => {
        setIsResending(false);
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

      {/* OTP Card */}
      <div className="rounded-2xl shadow-xl px-10 py-12 w-full max-w-md z-10 bg-[#F5EFFF] mb-20">
        <h2 className="text-3xl font-bold text-center text-[#A294F9] mb-6">Verify OTP</h2>
        <form onSubmit={handleSubmit(onSubmitOTP)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter the 4-digit code sent to your email</label>
            <div className="flex space-x-3 justify-center">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  maxLength="1"
                  autoComplete="off"
                  value={otpValues[i] || ""}
                  className={`w-12 h-12 text-xl text-center border rounded-lg outline-none ${
                    errors[`otp${i}`] ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register(`otp${i}`, {
                    required: true,
                    pattern: {
                      value: /^[0-9]$/,
                      message: "Only numbers allowed",
                    },
                  })}
                  ref={(el) => (inputsRef.current[i] = el)}
                  onChange={(e) => handleInput(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                />
              ))}
            </div>
            {Object.keys(errors).length > 0 && (
              <p className="text-red-500 text-xs mt-2 text-center">
                Please enter a valid 4-digit OTP
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-[#A294F9] hover:bg-[#8c7ff6] text-white font-semibold py-2.5 rounded-lg transition duration-300"
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              disabled={isResending}
              onClick={handleResendOTP}
              className="text-sm text-[#A294F9] hover:underline disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
