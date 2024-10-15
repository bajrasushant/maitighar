import axios from "axios";

const baseUrl = "/api/users";

// Sign-up function
export const signUp = async (newUserDetail) => {
  try {
    const response = await axios.post(baseUrl, newUserDetail);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// New function for OTP verification
export const verifyOtp = async ({ email, otp }) => {
  try {
    const response = await axios.post(`${baseUrl}/verify-otp`, { email, otp });
    return response.data; // Return the response data if needed
  } catch (error) {
    throw error.response.data; // Throw the error if something goes wrong
  }
};
