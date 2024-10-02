import axios from "axios";
import helpers from "../helpers/helpers";

const baseUrl = "/api/issues";

const getAll = async () => {
  const config = helpers.getConfig();
  const request = await axios.get(baseUrl, config);
  return request.data;
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
  // const config = helpers.getConfig();
  const userInfo = JSON.parse(localStorage.getItem("loggedUser"));
  console.log(userInfo.token);
  const config = {
    headers: {
      Authorization: `Bearer ${userInfo.token}`,
    },
  };
  console.log("config", config);

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

export default {
  getAll,
  createIssue,
  upvoteIssue,
  getIssueId,
  getIssuesByDepartment,
  updateStatus,
};
