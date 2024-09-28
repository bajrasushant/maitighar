import { useState } from 'react';
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
} from '@mui/material';
import LocationPicker from './LocationPicker';

const departments = [
  'Ward No.1',
  'Ward No.2',
  'Ward No.3',
  'Ward No.4',
  'Ward No.5',
  'Ward No.6',
  'Ward No.7',
  'Ward No.8',
  'Ward No.9',
  'Ward No.10',
  'Ward No.11',
  'Ward No.12',
  'Ward No.13',
  'Ward No.14',
  'Ward No.15',
  'Ward No.16',
  'Ward No.17',
  'Ward No.18',
  'Ward No.19',
  'Ward No.20',
  'Ward No.21',
  'Ward No.22',
  'Ward No.23',
  'Ward No.24',
  'Ward No.25',
  'Ward No.26',
  'Ward No.27',
  'Ward No.28',
  'Ward No.29',
  'Ward No.30',
  'Ward No.31',
  'Ward No.32',
];

const categories = [
  'Water',
  'Road',
  'Education',
  'Others',
];

function ReportForm({ createIssue }) {
  const defaultReportState = {
    title: '',
    description: '',
    department: '',
    category: '',
    position: {
      latitude: 27.7172,
      longitude: 85.324,
    },
    status: 'open',
    type: 'issue',
    upvotes: 0,
    images: [],
  };

  const [report, setReport] = useState(defaultReportState);

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
    formData.append('title', report.title);
    formData.append('description', report.description);
    formData.append('category', report.category);
    formData.append('department', report.department);
    formData.append('latitude', report.position.latitude);
    formData.append('longitude', report.position.longitude);
    formData.append('type', report.type);
    formData.append('status', report.status);
    formData.append('upvotes', report.upvotes);

    if (report.images) {
      report.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    // Log FormData entries
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      await createIssue(formData);
      setReport(defaultReportState);
    } catch (err) {
      console.error('Err: ', err.message);
    }
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
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={report.category}
                onChange={handleChange}
                label="Department"
              >
                {categories.map((catg) => (
                  <MenuItem key={catg} value={catg}>
                    {catg.charAt(0).toUpperCase() + catg.slice(1)}
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
              setPosition={(newPosition) => setReport((prevReport) => ({
                ...prevReport,
                position: {
                  latitude: newPosition[0],
                  longitude: newPosition[1],
                },
              }))}
            />
          </Grid>
          <Grid item xs={12}>
            <input
              accept="image/*,video/*,.mkv,.avi,.mov"
              id="image-upload"
              type="file"
              multiple
              name="images"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="image-upload">
              <Button variant="contained" component="span">
                Upload Image
              </Button>
            </label>
            {report.images.length > 0 && (
              <Typography variant="body2">
                {report.images.length}
                {' '}
                selected
              </Typography>
            )}
          </Grid>
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
}

export default ReportForm;
