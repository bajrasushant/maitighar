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

const getIssueId = async (id) => {
  const config = helpers.getConfig();
  const request = await axios.get(`${baseUrl}/${id}`, config);
  return request.data;
};

export default { getAll, createIssue, getIssueId };
