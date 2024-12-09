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
import Details from "./Components/Details/index";
import OtpVerification from "./Components/OTPverification";
import UserProfile from "./Components/UserProfile";
import CusNotification from "./Components/Notification";
import VerifyAdminOTP from "./Components/adminOTP";
import issueService from "./services/issues";
import ReportForm from "./Components/IssueForm";

function App() {
  const userDispatch = useUserDispatch();
  const user = useUserValue();

  const addIssue = async (issueObject) => {
    try {
      await issueService.createIssue(issueObject);
      const updatedIssues = await issueService.getAll();
      console.log("updatedIssues:", updatedIssues);
      // setIssues(updatedIssues);
      // setNotification({ message: "Issue successfully updated.", status: "success" });
      // setOpenForm(false);
    } catch (err) {
      console.error("Err:", err.message);
      // setNotification({ message: "Something went wrong.", status: "error" });
    }
  };

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
            path="/verifyAdminOTP"
            element={<VerifyAdminOTP />}
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
            path="/admin/details/:id"
            element={<Details isAdmin />}
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
          <Route
            path="/profile"
            element={<UserProfile />}
          />
          <Route
            path="/create"
            element={<ReportForm createIssue={addIssue} />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
