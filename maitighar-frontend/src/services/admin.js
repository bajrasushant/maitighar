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
    const response = await axios.get(`${baseUrl}/me`, config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const activeUsers = async (province, district, localGovId, ward) => {
  try {
    const res = await axios.get(`${baseUrl}/active-users`, {
      params: {
        province,
        district,
        localGovId,
        ward,
      },
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};
