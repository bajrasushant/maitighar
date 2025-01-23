import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Box,
  Tabs,
  Tab,
  Button,
  Avatar,
  Chip,
  Divider,
  Paper,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Person, Comment, ThumbUp } from "@mui/icons-material";
import helpers from "../helpers/helpers";
import { useNotification } from "../context/NotificationContext";

function UserProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setNotification } = useNotification();
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    try {
      const config = helpers.getConfig();
      const response = await axios.get("/api/userProfile/me", config);
      setProfileData(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load profile. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const canReopen = (issue) => {
    if (!issue || issue.status !== "resolved" || !issue.resolvedAt) {
      return false;
    }

    const resolvedAt = new Date(issue.resolvedAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return resolvedAt >= oneWeekAgo;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCardClick = (id) => {
    navigate(`/details/${id}`);
  };

  const handleReopenIssue = async (id) => {
    try {
      const response = await axios.put(`/api/issues/${id}/reopen`, {}, helpers.getConfig());
      setNotification({ message: "Issue reopened successfully.", status: "success" });
      fetchUserProfile(); // Refresh the data
    } catch (error) {
      console.error("Error reopening issue:", error);
      setNotification({ message: "Failed to reopen issue.", status: "error" });
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography
          color="error"
          variant="h6"
          textAlign="center"
        >
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{ mt: 4, mb: 4 }}
    >
      <Paper
        elevation={3}
        sx={{ p: 3, mb: 4, borderRadius: 2 }}
      >
        <Grid
          container
          spacing={3}
          alignItems="center"
        >
          <Grid item>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "primary.main",
                fontSize: "3rem",
              }}
            >
              {profileData.user.username.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          <Grid
            item
            xs
          >
            <Typography
              variant="h4"
              gutterBottom
            >
              {profileData.user.username}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
            >
              {profileData.user.email}
            </Typography>
            <Chip
              label={profileData.user.role}
              color="primary"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper
        elevation={3}
        sx={{ borderRadius: 2 }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<Person />}
            label="Posted Issues"
          />
          <Tab
            icon={<Comment />}
            label="Posted Comments"
          />
          <Tab
            icon={<ThumbUp />}
            label="Upvoted Issues"
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <List>
              {profileData.postedIssues.map((issue) => (
                <ListItemButton
                  key={issue.id}
                  onClick={() => handleCardClick(issue.id)}
                >
                  <ListItemText
                    primary={issue.title}
                    secondary={
                      <Box>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          Status: {issue.status}
                        </Typography>
                        {" — "}
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </Box>
                    }
                  />
                  {canReopen(issue) && (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReopenIssue(issue.id);
                      }}
                    >
                      Reopen
                    </Button>
                  )}
                  <Divider
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}

          {tabValue === 1 && (
            <List>
              {profileData.postedComments.map((comment) => (
                <ListItemButton
                  key={comment.id}
                  onClick={() => comment.issue && handleCardClick(comment.issue.id)}
                  disabled={!comment.issue}
                >
                  <ListItemText
                    primary={comment.description}
                    secondary={
                      <Box>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {comment.issue ? comment.issue.title : "Suggestion"}
                        </Typography>
                        {" — "}
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Box>
                    }
                  />
                  <Divider
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}

          {tabValue === 2 && (
            <List>
              {profileData.upvotedIssues.map((issue) => (
                <ListItemButton
                  key={issue.id}
                  onClick={() => handleCardClick(issue.id)}
                >
                  <ListItemText
                    primary={issue.title}
                    secondary={
                      <Box>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          Status: {issue.status}
                        </Typography>
                        {" — "}
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </Box>
                    }
                  />
                  <Divider
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default UserProfile;
