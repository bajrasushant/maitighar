import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signUp } from "../services/user";

export const useSignup = () => {
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      navigate("/login");
    },
    onError: (error) => {
      console.error("SignUp failed", error);
    },
  });
  return signupMutation;
};
