import axios from "axios";
import helpers from "../helpers/helpers";

const baseUrl = "/api/adminlogin";

export const adminSignUp = async (newUserDetail) => {
  try {
    const response = await axios.post(`${baseUrl}/register`, newUserDetail);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const loggedInAdmin = async () => {
  try {
    const config = helpers.getConfig();
    if (!config || !config.headers || !config.headers.Authorization) {
      throw new Error("Missing Authorization header in config");
    }

    const response = await axios.get("/api/admins/me", config);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const activeUsers = async (province, district, localGovId, ward) => {
  try {
    const config = helpers.getConfig();
    const res = await axios.get("/api/admins/active-users", {
      params: {
        province,
        district,
        localGovId,
        ward,
      },
      ...config,
    });
    return res.data;
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
