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
  InputLabel,
  Grid,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import issueService from "../services/issues";

function SuggestionsList() {
  const [suggestions, setSuggestions] = useState([]);
  const { setNotification } = useNotification();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
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
      const response = await axios.get("/api/issues/admin", config); //TODO: Use issueService to get exact number of issues
      console.log("Fetched issues:", response.data);
      setSuggestions(response.data);
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

  const suggestionsList = suggestions.filter((issue) => issue.type === "suggestion");

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 4, fontWeight: "bold" }}
      >
        Reported Suggestions
      </Typography>

      {/* Filters Section */}
      <Paper
        elevation={1}
        sx={{ p: 3, mb: 3, borderRadius: 2 }}
      >
        <Grid
          container
          spacing={3}
          alignItems="center"
        >
          <Grid
            item
            xs={12}
            md={3}
          >
            <FormControl
              fullWidth
              variant="outlined"
            >
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
                startAdornment={<SortIcon sx={{ color: "action.active", mr: 1 }} />}
                defaultValue="createdAt"
              >
                <MenuItem value="createdAt">Date</MenuItem>
                <MenuItem value="upvotes">Upvotes</MenuItem>
                <MenuItem value="sentimentScore">Sentiment Score</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            md={3}
          >
            <FormControl
              fullWidth
              variant="outlined"
            >
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Order"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
          >
            <FormControl
              fullWidth
              variant="outlined"
            >
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
                startAdornment={<FilterListIcon sx={{ color: "action.active", mr: 1 }} />}
              >
                {/* <MenuItem value="">All Categories</MenuItem> */}
                {categories.map((cat) => (
                  <MenuItem
                    key={cat.id}
                    value={cat.id}
                  >
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            md={2}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={fetchIssues}
              startIcon={<SearchIcon />}
              sx={{ height: 56 }}
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table Section */}
      <TableContainer
        component={Paper}
        elevation={2}
      >
        <Table
          sx={{ minWidth: 650 }}
          aria-label="issues table"
        >
          <TableHead sx={{ bgcolor: "background.paper" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Upvotes</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Sentiment</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {suggestionsList.map((suggestion) => (
              <TableRow
                key={suggestion.id}
                hover
                onClick={(e) => {
                  const target = e.target.closest("[data-clickable]");
                  if (target) handleIssueClick(suggestion.id);
                }}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  data-clickable
                  sx={{ fontWeight: 500 }}
                >
                  {suggestion.upvotes}
                </TableCell>
                <TableCell
                  data-clickable
                  sx={{ fontWeight: 500 }}
                >
                  {suggestion.title}
                </TableCell>
                <TableCell data-clickable>{suggestion.summary}</TableCell>
                <TableCell>
                  <FormControl
                    fullWidth
                    size="small"
                  >
                    <Select
                      value={suggestion.status}
                      onChange={(e) => handleStatusChange(suggestion.id, e.target.value)}
                      variant="outlined"
                      sx={{
                        "& .MuiSelect-select": {
                          py: 1,
                          color:
                            suggestion.status === "resolved"
                              ? "success.main"
                              : suggestion.status === "received"
                                ? "warning.main"
                                : "text.primary",
                        },
                      }}
                    >
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="received">Received</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  {typeof suggestion.sentimentScore === "number" ? (
                    <Typography fontSize="1.5rem">
                      {suggestion.sentimentScore > 0.3
                        ? "😊"
                        : suggestion.sentimentScore < -0.3
                          ? "😡"
                          : "😐"}
                    </Typography>
                  ) : (
                    suggestion.sentiment
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default SuggestionsList;
