import helpers from "../helpers/helpers";
import axios from "axios";
const baseUrl = "/api/comments";

const getCommentByIssue = async (issueId) => {
	const config = helpers.getConfig();
	const response = await axios.get(`${baseUrl}/issue/${issueId}`, config);
	return response.data;
};

const createComment = async (commentData) => {
	const config = helpers.getConfig();
	const response = await axios.post(baseUrl, commentData, config);
	return response.data;
};


export default { getCommentByIssue , createComment};
