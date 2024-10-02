import { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Container,
  // FormControl,
  // InputLabel,
  // Select,
  // MenuItem,
  Box,
} from "@mui/material";
import LocationPicker from "./LocationPicker";

function SuggestionForm() {
  const [report, setReport] = useState({
    title: "",
    description: "",
    images: [],
    status: "open",
  });
  const [position, setPosition] = useState([27.7172, 85.324]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the report data to your backend
    console.log(report);
  };

  return (
    <Container maxWidth="sm">
      <Typography
        variant="h4"
        align="center"
        gutterBottom
      >
        Make a Suggestion
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
            <Typography
              variant="subtitle1"
              gutterBottom
            >
              Select Location on Map
            </Typography>
            <LocationPicker
              position={position}
              setPosition={setPosition}
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
                Submit Suggestion
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default SuggestionForm;
