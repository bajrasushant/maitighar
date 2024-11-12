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
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import issueService from "../services/issues";

function SuggestionsList() {
  const [suggestions, setSuggestions] = useState([]);
  const { setNotification } = useNotification();
  const navigate = useNavigate();
  const adminData = JSON.parse(localStorage.getItem("loggedAdmin"));
  const { token } = adminData;

  const handleIssueClick = (id) => {
    navigate(`/admin/details/${id}`);
  };

  const handleStatusChange = async (id, newStatus) => {
    console.log("Updating status for issue ID:", id, "to:", newStatus);
    try {
      const updatedIssue = await issueService.updateStatus(id, newStatus);
      setSuggestions((prevIssues) =>
        prevIssues.map((issue) => (issue.id === id ? { ...issue, status: newStatus } : issue)),
      );
      console.log("Updated issue status:", updatedIssue);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get("/api/issues/admin", {
          params: { adminId: adminData.id },
          ...config, // Spread the config here
        });
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching issues:", error);
        setNotification({ message: " Error Fetching issues.", status: "error" });
      }
    };
    fetchIssues();
  }, [token]);

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
              <TableRow
                key={issue.id}
                onClick={() => handleIssueClick(issue.id)}
              >
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
