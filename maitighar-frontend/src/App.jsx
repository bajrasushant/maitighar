import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./Components/Login";
import SignUp from "./Components/Register";
import IssueForm from "./Components/IssueForm";
import HomePage from "./Components/HomePage";
// import { useAuthStatus } from "./hooks/useAuth";
import { useUserDispatch, useUserValue } from "./context/UserContext";
import { useEffect } from "react";

function App() {
	// const { isAuthenticated } = useAuthStatus();

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
			<Router>
				<Routes>
					<Route path="/login" element={user ? <HomePage /> : <SignIn />} />
					<Route path="/register" element={<SignUp />} />
					<Route path="/newIssue" element={<IssueForm />} />
					<Route path="/" element={user ? <HomePage /> : <SignIn />} />{" "}
				</Routes>
			</Router>
		</>
	);
}

export default App;
