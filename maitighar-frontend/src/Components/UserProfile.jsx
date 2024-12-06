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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import helpers from "../helpers/helpers";

function UserProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchUserProfile();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCardClick = (id) => {
    navigate(`/details/${id}`);
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
    <Container maxWidth="lg">
      <Typography
        variant="h4"
        gutterBottom
      >
        User Profile
      </Typography>

      {/* User Info */}
      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Typography variant="h6">Basic Information</Typography>
          <Typography variant="body1">
            <strong>Username:</strong> {profileData.user.username}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {profileData.user.email}
          </Typography>
          <Typography variant="body1">
            <strong>Role:</strong> {profileData.user.role}
          </Typography>
        </CardContent>
      </Card>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ marginBottom: 2 }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Posted Issues" />
        <Tab label="Posted Comments" />
        <Tab label="Upvoted Issues" />
      </Tabs>

      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
            >
              Posted Issues
            </Typography>
            <List>
              {profileData.postedIssues.map((issue) => (
                <ListItemButton
                  key={issue.id}
                  onClick={() => handleCardClick(issue.id)}
                >
                  <ListItemText
                    primary={issue.title}
                    secondary={`Status: ${issue.status} | Created At: ${new Date(
                      issue.createdAt,
                    ).toLocaleDateString()}`}
                  />
                </ListItemButton>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
            >
              Posted Comments
            </Typography>
            <List>
              {profileData.postedComments.map((comment) => (
                <ListItemButton
                  key={comment.id}
                  onClick={() => comment.issue && handleCardClick(comment.issue.id)}
                  disabled={!comment.issue} // Disable click if the issue is null
                >
                  <ListItemText
                    primary={comment.description}
                    secondary={`Commented on: ${
                      comment.issue ? comment.issue.title : "Suggestion"
                    } | Created At: ${new Date(comment.createdAt).toLocaleDateString()}`}
                  />
                </ListItemButton>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
            >
              Upvoted Issues
            </Typography>
            <List>
              {profileData.upvotedIssues.map((issue) => (
                <ListItemButton key={issue.id}>
                  <ListItemText
                    primary={issue.title}
                    secondary={`Status: ${issue.status} | Created At: ${new Date(
                      issue.createdAt,
                    ).toLocaleDateString()}`}
                  />
                </ListItemButton>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default UserProfile;
