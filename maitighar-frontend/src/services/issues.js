import axios from "axios";
import helpers from "../helpers/helpers";

const baseUrl = "/api/issues";

const getAll = async () => {
  const config = helpers.getConfig();
  const request = await axios.get(baseUrl, config);
  return request.data;
};

const getNearby = async (latitude, longitude, maxDistance) => {
  const config = helpers.getConfig();
  const response = await fetch(
    `${baseUrl}/nearby?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}`,
    config,
  );
  return response.json();
};

const getIssuesWardWise = async () => {
  const config = helpers.getConfig();
  const req = await axios.get(`${baseUrl}/ward`, config);
  return req.json();
};

const createIssue = async (formData) => {
  const config = helpers.getConfig();
  try {
    const response = await fetch("/api/issues", {
      method: "POST",
      body: formData,
      // Don't set Content-Type header, let the browser set it with the correct boundary for FormData
      headers: config.headers,
    });
    if (!response.ok) throw new Error("Failed to create issue");
    return await response.json();
  } catch (error) {
    console.error("Error creating issue:", error);
    throw error;
  }
};

const getIssueId = async (id) => {
  const config = helpers.getConfig();
  const request = await axios.get(`${baseUrl}/${id}`, config);
  return request.data;
};

const upvoteIssue = async (id) => {
  const config = helpers.getConfig();
  const response = await axios.put(`${baseUrl}/${id}/upvote`, {}, config);
  return response.data;
};

const getIssuesByDepartment = async (department) => {
  const config = helpers.getConfig();
  const request = await axios.get(`${baseUrl}/admin/${department}`, config);
  return request.data;
};

const updateStatus = async (id, newStatus) => {
  const adminInfo = JSON.parse(localStorage.getItem("loggedAdmin"));
  const config = {
    headers: {
      Authorization: `Bearer ${adminInfo.token}`,
    },
  };
  const response = await axios.put(`/api/issues/${id}`, { status: newStatus }, config);
  return response.data;
};

const getRecentIssues = async (limit = 10) => {
  const config = helpers.getConfig();
  const response = await axios.get(`${baseUrl}/user?limit=${limit}`, config);
  return response.data;
};

const updateIssue = async (id, updatedIssue) => {
  try {
    const config = helpers.getConfig();
    const response = await axios.put(`${baseUrl}/${id}`, updatedIssue, config);
    return response.data;
  } catch (error) {
    console.error("Error updating the issue:", error.response?.data || error.message);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

const deleteIssue = async (id) => {
  try {
    const config = helpers.getConfig();
    const response = await axios.delete(`${baseUrl}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error("Error deleting the issue:", error.response?.data || error.message);
    throw error;
  }
};

export default {
  getAll,
  getNearby,
  createIssue,
  upvoteIssue,
  getIssueId,
  getIssuesByDepartment,
  updateStatus,
  getRecentIssues,
  updateIssue,
  deleteIssue,
};
