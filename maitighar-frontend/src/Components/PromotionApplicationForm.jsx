import React, { useState } from "react";
import {
  TextField,
  MenuItem,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";
import helpers from "../helpers/helpers";

const PromotionApplicationForm = () => {
  const [formData, setFormData] = useState({
    requestedRole: "Ward Officer",
    reason: "",
    assignedProvince: "",
    assignedDistrict: "",
    assignedLocalGov: "",
    assignedWard: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const config = helpers.getConfig();
      const response = await axios.post(
        "/api/users/apply-ward-officer",
        {
          ...formData,
          assigned_province: formData.assignedProvince,
          assigned_district: formData.assignedDistrict,
          assigned_local_gov: formData.assignedLocalGov,
          assigned_ward: parseInt(formData.assignedWard, 10),
        },
        config,
      );
      setSuccess("Promotion request submitted successfully.");
      setFormData({
        requestedRole: "Ward Officer",
        reason: "",
        assignedProvince: "",
        assignedDistrict: "",
        assignedLocalGov: "",
        assignedWard: "",
      });
    } catch (err) {
      setError("Failed to submit the promotion request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxWidth={600}
      mx="auto"
      my={4}
      p={2}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
      >
        Apply for Promotion
      </Typography>
      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Requested Role"
          name="requestedRole"
          value={formData.requestedRole}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        >
          <MenuItem value="Ward Officer">Ward Officer</MenuItem>
          {/* Add more roles here if needed */}
        </TextField>
        <TextField
          label="Reason for Applying"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          required
        />
        <TextField
          label="Assigned Province"
          name="assignedProvince"
          value={formData.assignedProvince}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Assigned District"
          name="assignedDistrict"
          value={formData.assignedDistrict}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Assigned Local Government"
          name="assignedLocalGov"
          value={formData.assignedLocalGov}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Assigned Ward"
          name="assignedWard"
          value={formData.assignedWard}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          type="number"
          InputProps={{ inputProps: { min: 1 } }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Submit Application"}
        </Button>
      </form>
    </Box>
  );
};

export default PromotionApplicationForm;
