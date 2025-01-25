import axios from "axios";
import helpers from "../helpers/helpers";

const baseUrl = "/api/users";

const getAll = async (userId) => {
  const config = helpers.getConfig();
  const request = await axios.get(`${baseUrl}/${userId}/notifications`, config);
  return request.data;
};

const markAsRead = async (userId, notificationId) => {
  const config = helpers.getConfig();
  await axios.patch(`/api/users/${userId}/notifications/${notificationId}`, config);
};

export default { getAll, markAsRead };
