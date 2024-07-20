import {
  BrowserRouter as Router,
  Routes, Route
} from 'react-router-dom'
import SignIn from "./Components/Login"
import SignUp from "./Components/Register"
import IssueForm from "./Components/IssueForm"

function App() {
  return (
    <>
      {/* <SignIn /> */}
      <Router>
        <Routes>
          <Route path="/" element={<IssueForm />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
