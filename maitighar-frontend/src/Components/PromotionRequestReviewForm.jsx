import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Box,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import helpers from "../helpers/helpers";
import { useNotification } from "../context/NotificationContext";

function PromotionRequestReviewForm({ requestId, onReviewed }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [decision, setDecision] = useState("");
  const [comments, setComments] = useState("");
  const { setNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequestDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const config = helpers.getConfig();
        const response = await axios.get(
          `/api/ward-officers/promotion-requests/${requestId}`,
          config,
        );
        setRequest(response.data);
      } catch (err) {
        setError("Failed to fetch request details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  const handleSubmit = async () => {
    if (!decision) {
      setNotification({ message: "Please select a decision before submitting.", status: "error" });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = helpers.getConfig();
      await axios.post(
        "/api/admins/promotion-review",
        { id: requestId, status: decision, comments },
        config,
      );
      setNotification({ message: "Review submitted successfully.", status: "success" });
      onReviewed();
      navigate("/admin-dashboard");
    } catch (err) {
      setError("Failed to submit review.");
      setNotification({ message: "Review submitted successfully.", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography
        variant="h6"
        gutterBottom
      >
        Review Promotion Request
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Request Details:</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography>
          <strong>User:</strong> {request.user.username} ({request.user.email})
        </Typography>
        <Typography>
          <strong>Current Role:</strong> {request.user.role}
        </Typography>
        <Typography>
          <strong>Requested Role:</strong> {request.promotionRequest.requestedRole}
        </Typography>
        <Typography>
          <strong>Reason:</strong> {request.promotionRequest.reason}
        </Typography>
        <Typography>
          <strong>Created At:</strong>{" "}
          {new Date(request.promotionRequest.createdAt).toLocaleString()}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">User Stats:</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography>
          <strong>Activity Score:</strong> {request.stats.activityScore}
        </Typography>
        <Typography>
          <strong>Comments Score:</strong> {request.stats.commentsScore}
        </Typography>
        <Typography>
          <strong>Total Activity Score:</strong> {request.stats.totalActivityScore}
        </Typography>
      </Box>

      <RadioGroup
        value={decision}
        onChange={(e) => setDecision(e.target.value)}
        sx={{ my: 2 }}
      >
        <FormControlLabel
          value="Accepted"
          control={<Radio />}
          label="Approve"
        />
        <FormControlLabel
          value="Declined"
          control={<Radio />}
          label="Reject"
        />
      </RadioGroup>

      <TextField
        label="Comments (optional)"
        fullWidth
        multiline
        rows={3}
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        sx={{ my: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
      >
        Submit Review
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={onReviewed}
        sx={{ ml: 2 }}
      >
        Cancel
      </Button>
    </Paper>
  );
}

export default PromotionRequestReviewForm;
