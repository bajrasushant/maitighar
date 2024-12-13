import { useEffect, useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, CloudUpload, Send } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LocationPicker from "./LocationPicker";
import issueService from "../services/issues";
import { useNotification } from "../context/NotificationContext";


function ReportForm() {
  const navigate = useNavigate();
  const { setNotification } = useNotification();
  const defaultReportState = {
    title: "",
    description: "",
    department: "",
    province: "",
    district: "",
    localGov: "",
    ward: "",
    category: "",
    position: {
      latitude: 27.7172,
      longitude: 85.324,
    },
    status: "open",
    type: "issue",
    upvotes: 0,
    images: [],
  };

  const [report, setReport] = useState(defaultReportState);
  const [provincesDd, setProvincesDd] = useState([]);
  const [districtsDd, setDistrictsDd] = useState([]);
  const [localGovsDd, setLocalGovsDd] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

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
      if (report.province) {
        try {
          const response = await axios.get(`/api/nepal/districts?provinceId=${report.province}`);
          setDistrictsDd(response.data);
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      } else {
        setDistrictsDd([]);
      }
    };
    fetchDistricts();
  }, [report.province]);

  useEffect(() => {
    const fetchLocalGovs = async () => {
      if (report.district) {
        try {
          const response = await axios.get(`/api/nepal/localgovs?districtId=${report.district}`);
          setLocalGovsDd(response.data);
        } catch (error) {
          console.error("Error fetching local governments:", error);
        }
      } else {
        setLocalGovsDd([]);
      }
    };
    fetchLocalGovs();
  }, [report.district]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReport((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setReport((prevState) => ({
      ...prevState,
      images: files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("title", report.title);
    formData.append("description", report.description);
    formData.append("category", report.category);
    formData.append("assigned_province", report.province);
    formData.append("assigned_district", report.district);
    formData.append("assigned_localGov", report.localGov);
    formData.append("assigned_ward", report.ward);
    formData.append("department", report.department);
    formData.append("latitude", report.position.latitude);
    formData.append("longitude", report.position.longitude);
    formData.append("type", report.type);
    formData.append("status", report.status);
    formData.append("upvotes", report.upvotes);

    if (report.images) {
      report.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    // Log FormData entries
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    try {
      await issueService.createIssue(formData);
      setReport(defaultReportState);
      navigate("/");
    } catch (err) {
      console.error("Err: ", err.message);
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
          Report an Issue or Make a Suggestion
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
            >
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={report.title}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid
              item
              xs={12}
            >
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={report.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
                variant="outlined"
              />
            </Grid>
            <Grid
              item
              xs={12}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
              >
                Type
              </Typography>
              <RadioGroup
                row
                name="type"
                value={report.type}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="issue"
                  control={<Radio />}
                  label="Issue"
                />
                <FormControlLabel
                  value="suggestion"
                  control={<Radio />}
                  label="Suggestion"
                />
              </RadioGroup>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
            >
              <FormControl
                fullWidth
                required
                variant="outlined"
              >
                <InputLabel>Province</InputLabel>
                <Select
                  name="province"
                  value={report.province}
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
            <Grid
              item
              xs={12}
              sm={6}
            >
              <FormControl
                fullWidth
                required
                variant="outlined"
              >
                <InputLabel>District</InputLabel>
                <Select
                  name="district"
                  value={report.district}
                  onChange={handleChange}
                  label="District"
                >
                  {districtsDd.map((district) => (
                    <MenuItem
                      key={district.id}
                      value={district.id}
                    >
                      {district.name}
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
                required
                variant="outlined"
              >
                <InputLabel>Local Government</InputLabel>
                <Select
                  name="localGov"
                  value={report.localGov}
                  onChange={handleChange}
                  label="Local Government"
                >
                  {localGovsDd.map((localGov) => (
                    <MenuItem
                      key={localGov.id}
                      value={localGov.id}
                    >
                      {localGov.name}
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
                required
                variant="outlined"
              >
                <InputLabel>Ward</InputLabel>
                <Select
                  name="ward"
                  value={report.ward}
                  onChange={handleChange}
                  label="Ward"
                >
                  {localGovsDd
                    .filter((localGov) => localGov.id === report.localGov)
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
              <FormControl
                fullWidth
                required
                variant="outlined"
              >
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={report.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories.map((catg) => (
                    <MenuItem
                      key={catg.id}
                      value={catg.id}
                    >
                      {catg.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
              >
                Select Location on Map
              </Typography>
              <Paper
                elevation={2}
                sx={{ p: 2, borderRadius: 2 }}
              >
                <LocationPicker
                  position={[report.position.latitude, report.position.longitude]}
                  setPosition={(newPosition) =>
                    setReport((prevReport) => ({
                      ...prevReport,
                      position: {
                        latitude: newPosition[0],
                        longitude: newPosition[1],
                      },
                    }))
                  }
                />
              </Paper>
            </Grid>
            <Grid
              item
              xs={12}
            >
              <input
                accept="image/*,video/*,.mkv,.avi,.mov"
                id="image-upload"
                type="file"
                multiple
                name="images"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  Upload Images or Videos
                </Button>
              </label>
              {report.images.length > 0 && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1 }}
                >
                  {report.images.length} file(s) selected
                </Typography>
              )}
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
                startIcon={loading ? <CircularProgress size={24} /> : <Send />}
              >
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default ReportForm;
