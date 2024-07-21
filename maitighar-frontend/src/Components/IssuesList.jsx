import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import issueService from "../services/issues";

const IssuesList = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    issueService.getAll()
      .then(data => setIssues(data))
      .catch(error => console.error(error));
  }, []);

  const handleStatusChange = (id, newStatus) => {
    console.log("Updating status for issue ID:", id, "to:", newStatus); // Add this line for debugging

    issueService.updateStatus(id, newStatus)
      .then(updatedIssue => {
        setIssues(prevIssues => prevIssues.map(issue => 
          issue._id === id ? { ...issue, status: newStatus } : issue
        ));
        console.log("Updated issue status:", updatedIssue); // Add this line for debugging
      })
      .catch(error => console.error(error));
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Issues</Typography>
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
            {issues.map(issue => (
              <TableRow key={issue._id}>
                <TableCell>{issue.upvotes}</TableCell>
                <TableCell>{issue.title}</TableCell>
                <TableCell>{issue.description}</TableCell>
                <TableCell>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={issue.status}
                      onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                    >
                      <FormControlLabel value="open" control={<Radio />} label="Open" />
                      <FormControlLabel value="received" control={<Radio />} label="Received" />
                      <FormControlLabel value="resolved" control={<Radio />} label="Resolved" />
                    </RadioGroup>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default IssuesList;
