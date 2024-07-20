import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import IssuesList from './IssuesList';
import SuggestionsList from './SuggestionsList';

const AdminDashboard = () => (
  <Router>
    <div>
      <nav>
        <ul>
          <li><Link to="/admin/issues">Issues</Link></li>
          <li><Link to="/admin/suggestions">Suggestions</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/admin/issues" component={IssuesList} />
        <Route path="/admin/suggestions" component={SuggestionsList} />
      </Routes>
    </div>
  </Router>
);

export default AdminDashboard;
