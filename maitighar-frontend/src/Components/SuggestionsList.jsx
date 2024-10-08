import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import issueService from "../services/issues";

function SuggestionsList() {
  const [suggestions, setSuggestions] = useState([]);
  const adminData = JSON.parse(localStorage.getItem("loggedAdmin"));
  const { department } = adminData;
  const { token } = adminData;

  const handleStatusChange = async (id, newStatus) => {
    console.log("Updating status for issue ID:", id, "to:", newStatus);
    try {
      const updatedIssue = await issueService.updateStatus(id, newStatus);
      setSuggestions((prevIssues) => prevIssues.map((issue) => (issue.id === id ? { ...issue, status: newStatus } : issue)));
      console.log("Updated issue status:", updatedIssue);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    console.log("config", config);

    axios
      .get(`/api/issues/admin/${department}`, config)
      .then((response) => setSuggestions(response.data))
      .catch((error) => console.error(error));
  }, [department, token]);

  const suggestionsList = suggestions.filter((issue) => issue.type === "suggestion");

  return (
    <div>
      <Typography
        variant="h4"
        gutterBottom
      >
        Suggestions
      </Typography>
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
            {suggestionsList.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>{issue.upvotes}</TableCell>
                <TableCell>{issue.title}</TableCell>
                <TableCell>{issue.description}</TableCell>
                <TableCell>
                  <FormControl component="fieldset">
                    <RadioGroup
                      // row
                      value={issue.status}
                      onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                    >
                      <FormControlLabel
                        value="open"
                        control={<Radio />}
                        label="Open"
                      />
                      <FormControlLabel
                        value="received"
                        control={<Radio />}
                        label="Received"
                      />
                      <FormControlLabel
                        value="resolved"
                        control={<Radio />}
                        label="Resolved"
                      />
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
}

export default SuggestionsList;
