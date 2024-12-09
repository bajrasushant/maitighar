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
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
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
  const [wardsDd, setWardsDd] = useState([]);

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

  useEffect(() => {
    const fetchWards = async () => {
      try {
        const response = await axios.get("/api/wards", {
          params: { localGovId: formData.assignedLocalGov },
        });
        console.log(response);
        setWardsDd(response.data);
      } catch (error) {
        console.error("Error fetching wards:", error);
      }
    };

    if (formData.assignedLocalGov) {
      fetchWards();
    }
  }, [formData.assignedLocalGov]);

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
    <Box
      maxWidth={600}
      mx="auto"
      my={4}
      p={2}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={handleBackToHome}
        sx={{ mb: 3 }}
      >
        Back to Home
      </Button>
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

        <Grid
          item
          xs={12}
        >
          <FormControl fullWidth>
            <InputLabel>Province</InputLabel>
            <Select
              value={formData.assignedProvince}
              name="assignedProvince"
              onChange={handleChange}
              label="Province"
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
        {/* District Select */}
        <Grid
          item
          xs={12}
        >
          <FormControl fullWidth>
            <InputLabel>District</InputLabel>
            <Select
              name="assignedDistrict"
              value={formData.assignedDistrict}
              onChange={handleChange}
              label="District"
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
        >
          <FormControl fullWidth>
            <InputLabel>Local Government</InputLabel>
            <Select
              value={formData.assignedLocalGov}
              name="assignedLocalGov"
              onChange={handleChange}
              label="Local Government"
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
        >
          <FormControl
            fullWidth
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
                  [...Array(localGov.number_of_wards).keys()]
                    .filter(
                      (ward) => !wardsDd.some((assignedWard) => assignedWard.number === ward + 1),
                    )
                    .map((ward) => (
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

        {/* <TextField */}
        {/*   label="Assigned Province" */}
        {/*   name="assignedProvince" */}
        {/*   value={formData.assignedProvince} */}
        {/*   onChange={handleChange} */}
        {/*   fullWidth */}
        {/*   margin="normal" */}
        {/*   required */}
        {/* /> */}
        {/* <TextField */}
        {/*   label="Assigned District" */}
        {/*   name="assignedDistrict" */}
        {/*   value={formData.assignedDistrict} */}
        {/*   onChange={handleChange} */}
        {/*   fullWidth */}
        {/*   margin="normal" */}
        {/*   required */}
        {/* /> */}
        {/* <TextField */}
        {/*   label="Assigned Local Government" */}
        {/*   name="assignedLocalGov" */}
        {/*   value={formData.assignedLocalGov} */}
        {/*   onChange={handleChange} */}
        {/*   fullWidth */}
        {/*   margin="normal" */}
        {/*   required */}
        {/* /> */}
        {/* <TextField */}
        {/*   label="Assigned Ward" */}
        {/*   name="assignedWard" */}
        {/*   value={formData.assignedWard} */}
        {/*   onChange={handleChange} */}
        {/*   fullWidth */}
        {/*   margin="normal" */}
        {/*   required */}
        {/*   type="number" */}
        {/*   InputProps={{ inputProps: { min: 1 } }} */}
        {/* /> */}
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
}

export default PromotionApplicationForm;
