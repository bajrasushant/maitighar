import {
  BrowserRouter as Router,
  Routes, Route
} from 'react-router-dom'
import SignIn from "./Components/Login"
import SignUp from "./Components/Register"
import ReportForm from "./Components/IssueForm"
import HomePage from './Components/HomePage'

function App() {
  return (
    <>
      {/* <SignIn /> */}
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
