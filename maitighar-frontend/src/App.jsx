import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import SignIn from "./Components/Login";
import SignUp from "./Components/Register";
import HomePage from "./Components/HomePage";
import { useUserDispatch, useUserValue } from "./context/UserContext";
import AdminLogin from "./Components/AdminLogin";
import AdminDashboard from "./Components/AdminDashboard";
import AdminRegister from "./Components/AdminRegister";
import GlobalIssueMap from "./Components/GlobalIssueMap";
import Details from "./Components/Details";
import OtpVerification from "./Components/OTPverification";
import CusNotification from "./Components/Notification";

function App() {
  const userDispatch = useUserDispatch();
  const user = useUserValue();

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedUser");
    if (loggedUserJSON) {
      const userDetails = JSON.parse(loggedUserJSON);
      userDispatch({ type: "LOGIN", payload: userDetails });
    }
  }, []);

  return (
    <>
      {/* <SignIn /> */}
      <CusNotification />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={user ? <HomePage /> : <SignIn />}
          />
          <Route
            path="/register"
            element={<SignUp />}
          />
          <Route
            path="/verifyOTP"
            element={<OtpVerification />}
          />
          <Route
            path="/"
            element={user ? <HomePage /> : <SignIn />}
          />{" "}
          <Route
            path="/details/:id"
            element={<Details />}
          />
          <Route
            path="/admin-login"
            element={<AdminLogin />}
          />
          <Route
            path="/admin-dashboard"
            element={<AdminDashboard />}
          />
          <Route
            path="/admin-register"
            element={<AdminRegister />}
          />
          <Route
            path="/admin-map"
            element={<GlobalIssueMap />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
