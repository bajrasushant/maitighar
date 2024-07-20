import { useState, useEffect } from 'react';
import axios from 'axios';
// import UpdateStatusForm from './UpdateStatusForm';
// import ForwardForm from './ForwardForm';

const IssuesList = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    axios.get('/api/admin/issues')
      .then(response => setIssues(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h2>Issues</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {issues.map(issue => (
            <tr key={issue._id}>
              <td>{issue.title}</td>
              <td>{issue.description}</td>
              <td>{issue.status}</td>
              <td>
                {/* <UpdateStatusForm issue={issue} />
                <ForwardForm issue={issue} /> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IssuesList;
