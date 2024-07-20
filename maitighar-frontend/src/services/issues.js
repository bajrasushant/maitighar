import helpers from "../helpers/helpers";
import axios from "axios";
const baseUrl = "/api/issues";

const getAll = async () => {
  const config = helpers.getConfig();
  const request = await axios.get(baseUrl, config);
  return request.data;
};

const createIssue = async (newObject) => {
  const config = helpers.getConfig();
	console.log(newObject, config);
  const response = await axios.post(baseUrl, newObject, config);
  return response.data;
};

export default { getAll, createIssue };
