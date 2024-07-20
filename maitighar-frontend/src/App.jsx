import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./Components/Login";
import SignUp from "./Components/Register";
import HomePage from "./Components/HomePage";
import { useUserDispatch, useUserValue } from "./context/UserContext";
import { useEffect } from "react";
import AdminLogin from "./Components/AdminLogin";

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
			<Router>
				<Routes>
					<Route path="/login" element={user ? <HomePage /> : <SignIn />} />
					<Route path="/register" element={<SignUp />} />
					<Route path="/" element={user ? <HomePage /> : <SignIn />} />{" "}
					<Route path= "/adminLogin" element = {<AdminLogin/>} />
				</Routes>
			</Router>
		</>
	);
}

export default App;
