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
import ReportForm from "./Components/IssueForm";
import PromotionApplicationForm from "./Components/PromotionApplicationForm";
import IssuesList from "./Components/IssuesList";
import SuggestionsList from "./Components/SuggestionsList";
import AdminRequestViewer from "./Components/AdminPromotionRequestViewer";
import ActiveUsers from "./Components/ActiveUsers";

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
          {/* <Route
            path="/admin-dashboard"
            element={<AdminDashboard />}
          />
          <Route
            path="/admin/issues-list"
            element={<IssuesList />}
          />
          <Route
            path="/admin/suggestion-list"
            element={<SuggestionsList />}
          />
          <Route
            path="/admin/wardofficer-request"
            element={<AdminRequestViewer />}
          />
          {/* <Route
            path="/admin/active-users"
            element={<ActiveUsers adminId={user.adminId} />}
          /> */}
          <Route
            path="/admin-dashboard"
            element={<AdminDashboard />}
          >
            {/* Default dashboard route */}
            <Route
              // index
              element={<GlobalIssueMap />}
            />

            {/* Other admin routes */}
            <Route
              path="issues-list"
              element={<IssuesList />}
            />
            <Route
              path="suggestion-list"
              element={<SuggestionsList />}
            />
            <Route
              path="wardofficer-request"
              element={<AdminRequestViewer />}
            />
            <Route
              path="active-users"
              // element={<ActiveUsers adminId={user.adminId} />}
              element={<ActiveUsers />}
            />
          </Route>
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
            element={<ReportForm />}
          />
          <Route
            path="/promotion-form"
            element={<PromotionApplicationForm />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
