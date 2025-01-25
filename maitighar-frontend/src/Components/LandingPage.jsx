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
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { ThumbUp, Comment, ArrowUpward } from "@mui/icons-material";

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

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    return `${Math.floor(seconds)} seconds ago`;
  };

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
          <Card>
            <List>
              {trendingIssues.map((issue, index) => (
                <ListItem
                  key={issue.id}
                  alignItems="flex-start"
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        color="text.primary"
                      >
                        {issue.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {/* {issue.createdBy ? `@${issue.createdBy.username} • ` : ""} */}
                          {getTimeAgo(issue.createdAt)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          {issue.description.substring(0, 150)}...
                        </Typography>
                        {/* <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                          <Chip
                            label={issue.type}
                            color={issue.type === "issue" ? "error" : "success"}
                            size="small"
                          />
                          <Chip
                            label={`Ward No. ${issue.assigned_ward}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </Box> */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <ArrowUpward
                              fontSize="small"
                              color="action"
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {issue.upvotes}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Comment
                              fontSize="small"
                              color="action"
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {issue.comments.length}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                  {index < trendingIssues.length - 1 && (
                    <Divider
                      component="li"
                      sx={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Card>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default LandingPage;
