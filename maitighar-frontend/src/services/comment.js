import axios from "axios";
import helpers from "../helpers/helpers";

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

const createReply = async (commentId, replyData) => {
  const config = helpers.getConfig();
  const response = await axios.post(baseUrl, replyData, config);
  return response.data;
};

const getReplyByComment = async (commentId) => {
  const config = helpers.getConfig();
  const response = await axios.get(`${baseUrl}/replies/${commentId}`, config);
  return response.data;
};

export default {
  getCommentByIssue,
  createComment,
  createReply,
  getReplyByComment,
};
