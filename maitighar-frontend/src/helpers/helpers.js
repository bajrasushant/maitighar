let token = null;
let config;

const setToken = (newToken) => {
	token = `Bearer ${newToken}`;
	config = {
		headers: { Authorization: token },
	};
};

const getConfig = () => config;

export default { setToken, getConfig };
