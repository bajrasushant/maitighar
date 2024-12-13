import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Select,
  Button,
  MenuItem,
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
import issueService from "../services/issues";
import { useNotification } from "../context/NotificationContext";

function IssuesList() {
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const adminData = JSON.parse(localStorage.getItem("loggedAdmin"));
  const { token } = adminData;
  const { setNotification } = useNotification();

  const handleIssueClick = (id) => {
    navigate(`/admin/details/${id}`);
  };

  const handleStatusChange = async (id, newStatus) => {
    console.log("Updating status for issue ID:", id, "to:", newStatus);
    try {
      const updatedIssue = await issueService.updateStatus(id, newStatus);
      setIssues((prevIssues) =>
        prevIssues.map((issue) => (issue.id === id ? { ...issue, status: newStatus } : issue)),
      );
      console.log("Updated issue status:", updatedIssue);
      setNotification({ message: "Updated issue status sucessfully.", status: "success" });
    } catch (error) {
      console.error("Error updating status:", error);
      setNotification({ message: "Something went wrong.", status: "error" });
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [token]);

  const fetchIssues = async () => {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        adminId: adminData.id,
        sortBy,
        category: selectedCategory,
        sortOrder,
      },
    };
    try {
      const response = await axios.get("/api/issues/admin", config);
      console.log("Fetched issues:", response.data);
      setIssues(response.data);
    } catch (error) {
      console.error("Error fetching issues:", error);
      setNotification({ message: error.response.data.error, status: "error" });
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching issues:", err);
      }
    };
    fetchCategories();
  }, []);

  const issuesList = issues.filter((issue) => issue.type === "issue");

  return (
    <div>
      <Typography
        variant="h4"
        gutterBottom
      >
        Issues
      </Typography>

      <Box
        display="flex"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography>Sort by:</Typography>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="createdAt">Date</MenuItem>
            <MenuItem value="upvotes">Upvotes</MenuItem>
            <MenuItem value="sentimentScore">Sentiment Score</MenuItem>
          </Select>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </Box>

        <Box>
          <Typography>Filter by Category:</Typography>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem
                key={cat.id}
                value={cat.id}
              >
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Button
          variant="contained"
          onClick={fetchIssues}
        >
          Apply Filters
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Upvotes</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sentiment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issuesList.map((issue) => (
              <TableRow
                key={issue.id}
                onClick={() => handleIssueClick(issue.id)}
              >
                <TableCell>{issue.upvotes}</TableCell>
                <TableCell>{issue.title}</TableCell>
                <TableCell>{issue.summary}</TableCell>
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
                <TableCell>{issue.sentiment}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default IssuesList;
