let token = null;
let config;

// Initialize token from local storage if exists
const initializeToken = () => {
  const userInfo = JSON.parse(
    localStorage.getItem("loggedUser") || localStorage.getItem("loggedAdmin"),
  );
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
    const adminInfo = JSON.parse(localStorage.getItem("loggedAdmin"));
    const userInfo = JSON.parse(localStorage.getItem("loggedUser"));

    if (adminInfo && adminInfo.token) {
      token = `Bearer ${adminInfo.token}`;
    } else if (userInfo && userInfo.token) {
      token = `Bearer ${userInfo.token}`;
    } else {
      token = null;
    }

    config = token
      ? {
          headers: {
            Authorization: token,
          },
        }
      : null;
  }
};

const getConfig = () => config;

export default { setToken, getConfig, initializeToken };
