import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { adminSignUp } from "../services/admin"; // Ensure this service is correctly implemented

export const useAdminSignup = () => {
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: adminSignUp,
    onSuccess: () => {
      navigate("/admin-login");
    },
    onError: (error) => {
      console.error("Admin SignUp failed", error);
    },
  });
  return signupMutation;
};
