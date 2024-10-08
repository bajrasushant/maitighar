import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Select, MenuItem, InputLabel, FormControl,
} from "@mui/material";
import axios from "axios"; // Import axios for making HTTP requests

const theme = createTheme();

const departments = [
  "Ward No.1",
  "Ward No.2",
  "Ward No.3",
  "Ward No.4",
  "Ward No.5",
  "Ward No.6",
  "Ward No.7",
  "Ward No.8",
  "Ward No.9",
  "Ward No.10",
  "Ward No.11",
  "Ward No.12",
  "Ward No.13",
  "Ward No.14",
  "Ward No.15",
  "Ward No.16",
  "Ward No.17",
  "Ward No.18",
  "Ward No.19",
  "Ward No.20",
  "Ward No.21",
  "Ward No.22",
  "Ward No.23",
  "Ward No.24",
  "Ward No.25",
  "Ward No.26",
  "Ward No.27",
  "Ward No.28",
  "Ward No.29",
  "Ward No.30",
  "Ward No.31",
  "Ward No.32",
];

export default function AdminRegister() {
  const [department, setDepartment] = useState("");
  const [repassword, setRepassword] = useState(""); // State for repassword
  const [error, setError] = useState(""); // Error state
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get("username");
    const email = data.get("email");
    const password = data.get("password");
    const repassword = data.get("repassword");

    setIsLoading(true);
    setError(""); // Reset error state before making request

    try {
      const response = await axios.post("/api/admins", {
        username,
        email,
        password,
        repassword,
        department,
      });
      console.log("Admin registered successfully:", response.data);
      // Redirect to admin-login page after successful signup
      navigate("/admin-login");
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        component="main"
        maxWidth="xs"
      >
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>{/* Add icon if needed */}</Avatar>
          <Typography
            component="h1"
            variant="h5"
          >
            Sign up
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
              >
                <TextField
                  name="username"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  autoFocus
                />
              </Grid>
              <Grid
                item
                xs={12}
              >
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid
                item
                xs={12}
              >
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
              <Grid
                item
                xs={12}
              >
                <TextField
                  required
                  fullWidth
                  name="repassword"
                  label="Repeat Password"
                  type="password"
                  id="repassword"
                />
              </Grid>
              <Grid
                item
                xs={12}
              >
                <FormControl fullWidth>
                  <InputLabel id="department-label">Department</InputLabel>
                  <Select
                    labelId="department-label"
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    label="Department"
                  >
                    {departments.map((dept) => (
                      <MenuItem
                        key={dept}
                        value={dept}
                      >
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              Sign Up
            </Button>
            {error && <Typography color="error">{error}</Typography>}
            <Grid
              container
              justifyContent="flex-end"
            >
              <Grid item>
                <Link
                  to="/admin-login"
                  variant="body2"
                >
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
