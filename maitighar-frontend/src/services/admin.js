import axios from "axios";
import helpers from "../helpers/helpers";

const baseUrl = "/api/admins";

export const adminSignUp = async (newUserDetail) => {
  try {
    const response = await axios.post(baseUrl, newUserDetail);
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

    const response = await axios.get(`${baseUrl}/me`, config);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const activeUsers = async (province, district, localGovId, ward) => {
  try {
    const config = helpers.getConfig();
    const res = await axios.get(`${baseUrl}/active-users`, {
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
