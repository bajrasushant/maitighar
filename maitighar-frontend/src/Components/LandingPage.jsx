import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Box,
  Link,
  Chip,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { ThumbUp, Comment } from "@mui/icons-material";

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function LandingPage() {
  const [trendingIssues, setTrendingIssues] = useState([]);

  useEffect(() => {
    const fetchTrendingIssues = async () => {
      try {
        const response = await fetch("/api/landingpage/landingpage-issues");
        if (!response.ok) {
          throw new Error("Failed to fetch trending issues");
        }
        const data = await response.json();
        setTrendingIssues(data);
      } catch (error) {
        console.error("Error fetching trending issues:", error);
      }
    };

    fetchTrendingIssues();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            align="center"
          >
            Welcome to Grievance Redressal System
          </Typography>
          <Grid
            container
            spacing={4}
            sx={{ mb: 4 }}
          >
            <Grid
              item
              xs={12}
              md={6}
            >
              <Card>
                <CardContent>
                  <Typography
                    variant="h5"
                    component="div"
                    gutterBottom
                  >
                    Report Issues
                  </Typography>
                  <Typography variant="body1">
                    Join our community to report and track local issues in your area.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    color="primary"
                  >
                    Sign Up
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
            >
              <Card>
                <CardContent>
                  <Typography
                    variant="h5"
                    component="div"
                    gutterBottom
                  >
                    Already a member?
                  </Typography>
                  <Typography variant="body1">
                    Log in to interact with issues, comment, and upvote.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    color="primary"
                  >
                    Log In
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
          >
            Trending Issues Nearby
          </Typography>
          <Grid
            container
            spacing={3}
          >
            {trendingIssues.map((issue) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={issue.id}
              >
                <Card>
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="div"
                      gutterBottom
                    >
                      {issue.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {issue.description.substring(0, 100)}...
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      gutterBottom
                    >
                      Posted on {new Date(issue.createdAt).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                      <Chip
                        icon={<ThumbUp />}
                        label={issue.upvotes}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        icon={<Comment />}
                        label={issue.comments.length}
                        size="small"
                        color="secondary"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default LandingPage;
