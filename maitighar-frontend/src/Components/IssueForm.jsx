import { useState } from "react";
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

const departments = ["roads", "water", "education", "garbage", "health"];

const ReportForm = ({ createIssue }) => {
  const defaultReportState = {
    title: "",
    description: "",
    department: "",
    position: {
      latitude: 27.7172,
      longitude: 85.324,
    },
    status: "open",
    type: "issue",
		upvotes: 0,
  };
  const [report, setReport] = useState(defaultReportState);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setReport((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // const handleImageUpload = (e) => {
  //   // This is a placeholder. You'll need to implement actual image upload logic
  //   const files = Array.from(e.target.files);
  //   setReport(prevState => ({
  //     ...prevState,
  //     images: files.map(file => URL.createObjectURL(file))
  //   }));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically send the report data to your backend
    const issueData = {
      title: report.title,
      description: report.description,
      department: report.department,
      latitude: report.position.latitude,
      longitude: report.position.longitude,
      status: report.status,
      type: report.type,
			upvotes: report.upvotes
    };

    try {
      await createIssue(issueData);
      setReport(defaultReportState);
    } catch (err) {
      console.error("Err: ", err.message);
    }
    // console.log(report);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Report an Issue or Make a Suggestion
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={report.title}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
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
          <Grid item xs={12}>
            <RadioGroup
              row
              name="type"
              value={report.type}
              onChange={handleChange}
            >
              <FormControlLabel value="issue" control={<Radio />} label="Issue" />
              <FormControlLabel value="suggestion" control={<Radio />} label="Suggestion" />
            </RadioGroup>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={report.department}
                onChange={handleChange}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Select Location on Map
            </Typography>
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
            {/* <Typography variant="body2" gutterBottom>
              Latitude: {position[0]}, Longitude: {position[1]}
            </Typography> */}
          </Grid>
          {/* <Grid item xs={12}>
            <input
              accept="image/*"
              id="image-upload"
              type="file"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="image-upload">
              <Button variant="contained" component="span">
                Upload Images
              </Button>
            </label>
          </Grid>
          {report.images.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                {report.images.length} image(s) selected
              </Typography>
            </Grid>
          )} */}
          {/* <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={report.status}
                onChange={handleChange}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid> */}
          <Grid item xs={12}>
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
};

export default ReportForm;
