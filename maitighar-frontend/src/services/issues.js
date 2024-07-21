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
  // const config = helpers.getConfig();
	const userInfo = JSON.parse(localStorage.getItem("loggedUser"));
	console.log((userInfo.token));
	const config = {
		headers:{
			Authorization: `Bearer ${userInfo.token}`
		}
	}
	console.log("config", config);

  const request = await axios.get(`${baseUrl}/${id}`, config);
  return request.data;
};

const upvoteIssue = async (id) => {
	const config = helpers.getConfig();
  const response = await axios.put(`${baseUrl}/${id}/upvote`,{}, config);
  return response.data;
};

export default { getAll, createIssue, upvoteIssue, getIssueId};
