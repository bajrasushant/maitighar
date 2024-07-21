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

const upvoteIssue = async (id) => {
	const config = helpers.getConfig();
  const response = await axios.put(`${baseUrl}/${id}/upvote`,{}, config);
  return response.data;
};

const getIssuesByDepartment = async (department) => {
  const config = helpers.getConfig();
  const request = await axios.get(`${baseUrl}/admin/${department}`, config);
  return request.data;
};

const updateStatus = (id, newStatus) => {
  return axios.put(`/api/issues/${id}/status`, { status: newStatus })
    .then(response => response.data);
};

export default { getAll, createIssue, upvoteIssue, getIssueId, getIssuesByDepartment, updateStatus };
