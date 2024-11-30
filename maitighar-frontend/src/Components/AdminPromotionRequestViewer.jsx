import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  TableSortLabel,
} from "@mui/material";
import axios from "axios";
import helpers from "../helpers/helpers";
import PromotionRequestReviewForm from "./PromotionRequestReviewForm";

function AdminRequestViewer() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sortField, setSortField] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const config = helpers.getConfig();
        const response = await axios.get("/api/admins/promotion-requests", config);
        setRequests(response.data);
      } catch (err) {
        setError("Failed to fetch promotion requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  const sortedRequests = [...requests].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.userStats[sortField] > b.userStats[sortField] ? 1 : -1;
    }
    return a.userStats[sortField] < b.userStats[sortField] ? 1 : -1;
  });

  return (
    <Paper
      sx={{
        maxWidth: 800,
        mx: "auto",
        my: 4,
        p: 2,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
      >
        Promotion Requests
      </Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && requests.length === 0 && (
        <Typography>No promotion requests available.</Typography>
      )}
      {selectedRequest ? (
        <PromotionRequestReviewForm
          requestId={selectedRequest._id}
          onReviewed={() => setSelectedRequest(null)}
        />
      ) : (
        sortedRequests.length > 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === "username"}
                      direction={sortOrder}
                      onClick={() => handleSort("username")}
                    >
                      User
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Requested Role</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === "activityScore"}
                      direction={sortOrder}
                      onClick={() => handleSort("activityScore")}
                    >
                      Activity Score
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRequests.map((req) => (
                  <TableRow
                    key={req._id}
                    onClick={() => handleRequestClick(req)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{req.user.username}</TableCell>
                    <TableCell>{req.requestedRole}</TableCell>
                    <TableCell>{req.reason}</TableCell>
                    <TableCell>{req.userStats.activityScore}</TableCell>
                    <TableCell>{req.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
    </Paper>
  );
}

export default AdminRequestViewer;
