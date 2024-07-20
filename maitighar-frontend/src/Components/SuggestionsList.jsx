import { useState, useEffect } from 'react';
import axios from 'axios';
// import UpdateStatusForm from './UpdateStatusForm';
// import ForwardForm from './ForwardForm';

const SuggestionsList = () => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    axios.get('/api/admin/suggestions')
      .then(response => setSuggestions(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h2>Suggestions</h2>
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
          {suggestions.map(suggestion => (
            <tr key={suggestion._id}>
              <td>{suggestion.title}</td>
              <td>{suggestion.description}</td>
              <td>{suggestion.status}</td>
              <td>
                {/* <UpdateStatusForm suggestion={suggestion} />
                <ForwardForm suggestion={suggestion} /> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SuggestionsList;
