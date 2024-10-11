import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { adminSignUp } from "../services/admin"; // Ensure this service is correctly implemented
import { useNotification } from "../context/NotificationContext";

export default function useAdminSignup() {
  const navigate = useNavigate();
  const { setNotification } = useNotification();

  const signupMutation = useMutation({
    mutationFn: adminSignUp,
    onSuccess: () => {
      navigate("/admin-login");
    },
    onError: (error) => {
      console.error("Admin SignUp failed", error);
      setNotification({ message: "Signup failed.", status: "error" });
    },
  });
  return signupMutation;
}
