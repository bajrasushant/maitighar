let token = null;
let config;

const setToken = (newToken) => {
	token = `Bearer ${newToken}`;
	config = {
		headers: { Authorization: token },
	};
};

export default { setToken };
