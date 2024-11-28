import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import axios from "axios";
import helpers from "../helpers/helpers";

const AdminRequestViewer = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <Paper sx={{ maxWidth: 800, mx: "auto", my: 4, p: 2 }}>
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
      {requests.length > 0 && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Requested Role</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>{req.user.username}</TableCell>
                  <TableCell>{req.requestedRole}</TableCell>
                  <TableCell>{req.reason}</TableCell>
                  <TableCell>{req.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default AdminRequestViewer;
