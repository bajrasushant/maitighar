import React, { useState } from "react";
import { Button, Box, Typography, TextField, Alert, CircularProgress } from "@mui/material";
import axios from "axios";
import helpers from "../helpers/helpers";

const PromotionRequestReviewForm = ({ requestId, onReviewed }) => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const config = helpers.getConfig();
      await axios.post(`/api/admins/promotion-review/${requestId}`, { status }, config);
      onReviewed();
    } catch (err) {
      setError("Failed to review the promotion request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box my={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Set Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
          required
        >
          <MenuItem value="Accepted">Accept</MenuItem>
          <MenuItem value="Declined">Decline</MenuItem>
        </TextField>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Submit Review"}
        </Button>
      </form>
    </Box>
  );
};

export default PromotionRequestReviewForm;
