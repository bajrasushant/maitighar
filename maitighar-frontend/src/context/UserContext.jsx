import { createContext, useContext, useReducer } from "react";
import helpers from "../helpers/helpers";

const userReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      window.localStorage.removeItem("loggedAdmin");
      window.localStorage.setItem("loggedUser", JSON.stringify(action.payload));
      helpers.setToken(action.payload.token);
      return action.payload;
    case "ADMIN_LOGIN":
      window.localStorage.removeItem("loggedUser");
      window.localStorage.setItem("loggedAdmin", JSON.stringify(action.payload));
      helpers.setToken(action.payload.token);
      return action.payload;
    case "LOGOUT":
      window.localStorage.removeItem("loggedUser");
      return null;
    case "ADMIN_LOGOUT":
      localStorage.removeItem("loggedAdmin");
      return null;
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const UserContext = createContext();

export function UserContextProvider(props) {
  const initialState = () => {
    const storedAdmin = window.localStorage.getItem("loggedAdmin");
    return storedAdmin ? JSON.parse(storedAdmin) : null;
  };
  const [user, userDispatch] = useReducer(userReducer, null, initialState);

  return <UserContext.Provider value={[user, userDispatch]}>{props.children}</UserContext.Provider>;
}

export const useUserValue = () => {
  const userAndDispatch = useContext(UserContext);
  return userAndDispatch[0];
};

export const useUserDispatch = () => {
  const userAndDispatch = useContext(UserContext);
  return userAndDispatch[1];
};

export default UserContext;
