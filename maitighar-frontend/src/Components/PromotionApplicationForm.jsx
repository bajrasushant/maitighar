import { useState, useEffect } from "react";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  TextField,
  MenuItem,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Container,
  Divider,
} from "@mui/material";
import { ArrowBack, CloudUpload } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import helpers from "../helpers/helpers";

function PromotionApplicationForm() {
  const navigate = useNavigate();
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

  const [provincesDd, setProvincesDd] = useState([]);
  const [districtsDd, setDistrictsDd] = useState([]);
  const [localGovsDd, setLocalGovsDd] = useState([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get("/api/nepal/provinces");
        setProvincesDd(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (formData.assignedProvince) {
        try {
          const response = await axios.get(
            `/api/nepal/districts?provinceId=${formData.assignedProvince}`,
          );
          setDistrictsDd(response.data);
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      } else {
        setDistrictsDd([]);
      }
    };
    fetchDistricts();
  }, [formData.assignedProvince]);

  useEffect(() => {
    const fetchLocalGovs = async () => {
      if (formData.assignedDistrict) {
        try {
          const response = await axios.get(
            `/api/nepal/localgovs?districtId=${formData.assignedDistrict}`,
          );
          setLocalGovsDd(response.data);
        } catch (error) {
          console.error("Error fetching local governments:", error);
        }
      } else {
        setLocalGovsDd([]);
      }
    };
    fetchLocalGovs();
  }, [formData.assignedDistrict]);

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
        "/api/ward-officers/apply-ward-officer",
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
      navigate("/");
    } catch (err) {
      setError("Failed to submit the promotion request.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <Container
      maxWidth="md"
      sx={{ mt: 4, mb: 4 }}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={handleBackToHome}
        sx={{ mb: 3 }}
      >
        Back to Home
      </Button>
      <Paper
        elevation={3}
        sx={{ p: 4, borderRadius: 2 }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ mb: 4, fontWeight: "bold" }}
        >
          Apply for Promotion
        </Typography>
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
          >
            {success}
          </Alert>
        )}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
            >
              <FormControl
                fullWidth
                variant="outlined"
              >
                <InputLabel>Requested Role</InputLabel>
                <Select
                  label="Requested Role"
                  name="requestedRole"
                  value={formData.requestedRole}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Ward Officer">Ward Officer</MenuItem>
                  {/* Add more roles here if needed */}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
            >
              <TextField
                label="Reason for Applying"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                required
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
            >
              <FormControl
                fullWidth
                variant="outlined"
              >
                <InputLabel>Province</InputLabel>
                <Select
                  value={formData.assignedProvince}
                  name="assignedProvince"
                  onChange={handleChange}
                  label="Province"
                  required
                >
                  {provincesDd.map((prov) => (
                    <MenuItem
                      key={prov.id}
                      value={prov.id}
                    >
                      {prov.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
            >
              <FormControl
                fullWidth
                variant="outlined"
              >
                <InputLabel>District</InputLabel>
                <Select
                  name="assignedDistrict"
                  value={formData.assignedDistrict}
                  onChange={handleChange}
                  label="District"
                  required
                >
                  {districtsDd.map((dist) => (
                    <MenuItem
                      key={dist.id}
                      value={dist.id}
                    >
                      {dist.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
            >
              <FormControl
                fullWidth
                variant="outlined"
              >
                <InputLabel>Local Government</InputLabel>
                <Select
                  value={formData.assignedLocalGov}
                  name="assignedLocalGov"
                  onChange={handleChange}
                  label="Local Government"
                  required
                >
                  {localGovsDd.map((lg) => (
                    <MenuItem
                      key={lg.id}
                      value={lg.id}
                    >
                      {lg.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
            >
              <FormControl
                fullWidth
                variant="outlined"
                required
              >
                <InputLabel>Ward</InputLabel>
                <Select
                  name="assignedWard"
                  value={formData.assignedWard}
                  onChange={handleChange}
                  label="Ward"
                >
                  {localGovsDd
                    .filter((localGov) => localGov.id === formData.assignedLocalGov)
                    .map((localGov) =>
                      [...Array(localGov.number_of_wards).keys()].map((ward) => (
                        <MenuItem
                          key={ward + 1}
                          value={ward + 1}
                        >
                          Ward No. {ward + 1}
                        </MenuItem>
                      )),
                    )}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
            >
              <Divider sx={{ my: 2 }} />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={24} /> : <CloudUpload />}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default PromotionApplicationForm;
