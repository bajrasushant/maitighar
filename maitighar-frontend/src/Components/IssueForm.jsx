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
} from "@mui/material";
import LocationPicker from "./LocationPicker";

function ReportForm({ createIssue }) {
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

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get("/api/nepal/provinces");
        setProvincesDd(response.data);
      } catch (error) {
        console.error("Error fetching issues:", error);
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
          console.error("Error fetching issues:", error);
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
          console.log("Fetcching localgovs");
          const response = await axios.get(`/api/nepal/localgovs?districtId=${report.district}`);
          setLocalGovsDd(response.data);
        } catch (error) {
          console.error("Error fetching issues:", error);
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
    console.log(files); // Add this line to check the files being read
    setReport((prevState) => ({
      ...prevState,
      images: files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      await createIssue(formData);
      setReport(defaultReportState);
    } catch (err) {
      console.error("Err: ", err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography
        variant="h4"
        align="center"
        gutterBottom
      >
        Report an Issue or Make a Suggestion
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid
          container
          spacing={2}
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
            />
          </Grid>
          <Grid
            item
            xs={12}
          >
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
          >
            <FormControl
              fullWidth
              required
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
          >
            <FormControl
              fullWidth
              required
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
          >
            <FormControl
              fullWidth
              required
            >
              <InputLabel>Local Government</InputLabel>
              <Select
                name="localGov"
                value={report.localGov}
                onChange={handleChange}
                label="LocalGovernment"
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
          >
            <FormControl
              fullWidth
              required
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
                  .map((localGov) => [...Array(localGov.number_of_wards).keys()].map((ward) => (
                    <MenuItem
                      key={ward + 1}
                      value={ward + 1}
                    >
                      Ward No. {ward + 1}
                    </MenuItem>
                  )))}
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
                    {/* {catg.charAt(0).toUpperCase() + catg.slice(1)} */}
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
            {/* <LocationPicker */}
            {/*   position={[report.position.latitude, report.position.longitude]} */}
            {/*   setPosition={(newPosition) => */}
            {/*     setReport((prevReport) => ({ */}
            {/*       ...prevReport, */}
            {/*       position: { */}
            {/*         latitude: newPosition[0], */}
            {/*         longitude: newPosition[1], */}
            {/*       }, */}
            {/*     })) */}
            {/*   } */}
            {/* /> */}
            <LocationPicker
              position={[report.position.latitude, report.position.longitude]}
              setPosition={(newPosition) => setReport((prevReport) => ({
                ...prevReport,
                position: {
                  latitude: newPosition[0],
                  longitude: newPosition[1],
                },
              }))}
            />
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
                variant="contained"
                component="span"
              >
                Upload Image
              </Button>
            </label>
            {report.images.length > 0 && (
              <Typography variant="body2">{report.images.length} selected</Typography>
            )}
          </Grid>
          <Grid
            item
            xs={12}
          >
            <Box mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Submit Report
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default ReportForm;
