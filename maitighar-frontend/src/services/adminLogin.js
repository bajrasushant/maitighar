import axios from "axios";

const baseUrl = "/api/adminlogin";

export const adminlogin = async (credentials) => {
  const response = await axios.post(baseUrl, credentials);
  return response.data;
};
