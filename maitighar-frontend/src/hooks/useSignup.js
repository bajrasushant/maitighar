import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signUp, verifyOtp } from "../services/user";

// Hook for signing up the user
export const useSignup = () => {
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      navigate("/verifyOTP"); // Redirect to OTP verification after signup
    },
    onError: (error) => {
      console.error("SignUp failed", error);
    },
  });

  return signupMutation;
};

// Hook for OTP verification
export const useVerifyOtp = () => {
  const navigate = useNavigate();

  const otpMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => {
      navigate("/login"); // Redirect to login on successful OTP verification
    },
    onError: (error) => {
      console.error("OTP verification failed", error);
    },
  });

  return otpMutation;
};
