import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

const SuggestionsList = () => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    axios.get('/api/admin/suggestions')
      .then(response => setSuggestions(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>Suggestions</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Upvotes</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>  
            </TableRow>
          </TableHead>
          <TableBody>
            {suggestions.map(suggestion => (
              <TableRow key={suggestion._id}>
                <TableCell>{suggestion.upvotes}</TableCell>
                <TableCell>{suggestion.title}</TableCell>
                <TableCell>{suggestion.description}</TableCell>
                <TableCell>{suggestion.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SuggestionsList;