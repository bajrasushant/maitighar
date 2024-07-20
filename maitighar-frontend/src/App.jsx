import {
  BrowserRouter as Router,
  Routes, Route
} from 'react-router-dom'
import SignIn from "./Components/Login"
import SignUp from "./Components/Register"

function App() {
  return (
    <>
      {/* <SignIn /> */}
      <Router>
        <Routes>
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
