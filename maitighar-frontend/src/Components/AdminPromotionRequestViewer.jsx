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
  Chip,
  Box,
} from "@mui/material";
import axios from "axios";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ScoreIcon from "@mui/icons-material/EmojiEvents";
import helpers from "../helpers/helpers";
import PromotionRequestReviewForm from "./PromotionRequestReviewForm";

const statusColors = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

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
  }, [selectedRequest]);

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
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          mb: 4,
          fontWeight: "bold",
          display: "flex",
          gap: 1,
        }}
      >
        Promotion Requests
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {!loading && !selectedRequest && (
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ borderRadius: 2 }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "background.paper" }}>
              <TableRow>
                {["User", "Requested Role", "Reason", "Activity Score", "Status"].map((header) => (
                  <TableCell
                    key={header}
                    sx={{ fontWeight: "bold", fontSize: "1rem" }}
                  >
                    {header === "Activity Score" || header === "User" ? (
                      <TableSortLabel
                        active={sortField === header.toLowerCase().replace(" ", "")}
                        direction={sortOrder}
                        onClick={() => handleSort(header.toLowerCase().replace(" ", ""))}
                      >
                        {header}
                      </TableSortLabel>
                    ) : (
                      header
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedRequests.map((req) => (
                <TableRow
                  key={req._id}
                  hover
                  onClick={() => handleRequestClick(req)}
                  sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{req.user.username}</TableCell>
                  <TableCell>{req.requestedRole}</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>{req.reason}</TableCell>
                  <TableCell>
                    {/* <Chip
                      label={req.userStats.activityScore}
                      color="primary"
                      variant="outlined"
                    /> */}
                    <Chip
                      icon={<ScoreIcon />}
                      label={req.userStats.activityScore}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={req.status}
                      color={statusColors[req.status.toLowerCase()]}
                      icon={req.status === "approved" ? <CheckCircleOutlineIcon /> : null}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && requests.length === 0 && (
        <Typography
          align="center"
          sx={{ py: 4 }}
          color="text.secondary"
        >
          No promotion requests available
        </Typography>
      )}

      {selectedRequest && (
        <PromotionRequestReviewForm
          requestId={selectedRequest._id}
          onReviewed={() => setSelectedRequest(null)}
        />
      )}
    </Box>
  );
}

export default AdminRequestViewer;
