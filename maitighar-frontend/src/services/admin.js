import axios from "axios";

const baseUrl = "/api/admins";

export const adminSignUp = async (newUserDetail) => {
  try {
    const response = await axios.post(baseUrl, newUserDetail);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// OTP verification function for admin
export const verifyAdminOtp = async ({ email, otp }) => {
  try {
    const response = await axios.post(`${baseUrl}/verify-otp`, { email, otp });
    return response.data; // Return the response data if needed
  } catch (error) {
    throw error.response.data; // Throw the error if something goes wrong
  }
};

// Resend OTP function for admin
export const resendAdminOtp = async ({ email }) => {
  try {
    const response = await axios.post(`${baseUrl}/resend-otp`, { email });
    return response.data; // Return response data for success message
  } catch (error) {
    throw error.response.data; // Throw error in case of failure
  }
};