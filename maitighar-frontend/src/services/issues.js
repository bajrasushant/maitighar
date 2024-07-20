import helpers from "../helpers/helpers";
import axios from "axios";
const baseUrl = "/api/issues";

const getAll = async () => {
	const config = helpers.getConfig();
  const request = await axios.get(baseUrl, config);
  return request.data;
};

export default { getAll };
