let token = null;
let config;

// Initialize token from local storage if exists
const initializeToken = () => {
  const userInfo = JSON.parse(localStorage.getItem("loggedUser"));
  if (userInfo && userInfo.token) {
    setToken(userInfo.token);
  }
};

const setToken = (newToken) => {
  if (newToken) {
    token = `Bearer ${newToken}`;
    config = {
      headers: { Authorization: token },
    };
  } else {
    const userInfo = JSON.parse(localStorage.getItem("loggedUser"));
    if (userInfo && userInfo.token) {
      token = `Bearer ${userInfo.token}`;
      config = {
        headers: {
          Authorization: token,
        },
      };
    } else {
      token = null;
      config = null;
    }
  }
};

const getConfig = () => config;

export default { setToken, getConfig, initializeToken };
