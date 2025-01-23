import { useEffect, useState } from "react";
import {
  Avatar,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  // TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  Dialog,
  // DialogTitle,
  DialogContent,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  // Badge,
  Chip,
  Box,
} from "@mui/material";
import {
  ArrowUpward,
  Comment,
  Add,
  // Notifications,
  AccountCircle,
  ArrowUpwardOutlined,
} from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FoundationIcon from "@mui/icons-material/Foundation";
import { useNavigate } from "react-router-dom";
import PromotionApplicationForm from "./PromotionApplicationForm";
import { useUserValue, useUserDispatch } from "../context/UserContext";
import issueService from "../services/issues";
import { useNotification } from "../context/NotificationContext";
import RecentPosts from "./RecentPosts";
import getDisplayUsername from "./Details/utils";
import SearchBar from "./SearchBar";

function HomePage() {
  const currentUser = useUserValue();
  const navigate = useNavigate();
  const { setNotification } = useNotification();
  const userDispatch = useUserDispatch();
  const [promotionForm, setPromotionForm] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  // const [anchorElCreate, setAnchorElCreate] = useState(null);
  // const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [anchorElFilter, setAnchorElFilter] = useState(null);
  const [sortType, setSortType] = useState("");

  // Function to open and close the filter menu
  const handleOpenFilterMenu = (event) => {
    setAnchorElFilter(event.currentTarget);
  };

  const handleSearchIssueClick = (issueId) => {
    navigate(`/details/${issueId}`);
  };

  const handleCloseFilterMenu = () => {
    setAnchorElFilter(null);
  };

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const fetchedIssues = await issueService.getAll();
        setIssues(fetchedIssues);
        setNotification({ message: "Fetched issues.", status: "success" });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch issues");
        setNotification({ message: "Failed to fetch issues.", status: "error" });
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const fetchNearbyIssues = async () => {
    if (!navigator.geolocation) {
      setNotification({
        message: "Geolocation is not supported by your browser.",
        status: "error",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const nearbyIssues = await issueService.getNearby(latitude, longitude, 5000);
          // Adjust distance as needed
          setIssues(nearbyIssues);
          setNotification({ message: "Fetched nearby issues.", status: "success" });
        } catch (err) {
          console.error("Failed to fetch nearby issues", err);
          setNotification({ message: "Failed to fetch nearby issues.", status: "error" });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setNotification({ message: "Failed to get location.", status: "error" });
      },
    );
  };

  const handleFilterSelection = (type) => {
    setSortType(type);
    setAnchorElFilter(null);
    if (type === "nearby") {
      fetchNearbyIssues();
    } else if (type === "upvotes") {
      setIssues([...issues].sort((a, b) => b.upvotes - a.upvotes));
    } else if (type === "comments") {
      setIssues([...issues].sort((a, b) => b.comments.length - a.comments.length));
    }
  };
  const handleUpvote = async (id) => {
    try {
      const updatedIssue = await issueService.upvoteIssue(id);
      setIssues(issues.map((issue) => (issue.id === id ? updatedIssue : issue)));
    } catch (err) {
      console.error("Failed to update upvote", err);
      setNotification({ message: "Failed to update upvote.", status: "error" });
    }
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    try {
      userDispatch({ type: "LOGOUT" });
      navigate("/login");
    } catch (err) {
      console.error("Error", err.message);
      setNotification({ message: "Failed to logout.", status: "error" });
    }
  };

  const handleUserProfile = () => {
    try {
      navigate("/profile");
    } catch (err) {
      console.error("Error", err.message);
      setNotification({ message: "Failed to get your details.", status: "error" });
    }
  };

  const handleIssuesAroundWard = async () => {
    try {
      const issuesWard = await issueService.getIssuesWardWise();
      setIssues(issuesWard);
    } catch (err) {
      setNotification({ message: "Something went wrong.", status: "error" });
    }
  };

  const handleOpenForm = () => {
    navigate("/create");
  };

  const handleOpenPromotionForm = () => {
    navigate("/promotion-form");
    // setPromotionForm(true);
  };

  const handleCardClick = (id) => {
    navigate(`/details/${id}`);
  };

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
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: "flex", alignItems: "center", minWidth: 200 }}
          >
            <Box
              display="flex"
              alignItems="center"
            >
              <FoundationIcon />
              GRS
            </Box>
          </Typography>

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <SearchBar onIssueClick={handleSearchIssueClick} />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", minWidth: 200 }}>
            <Button
              color="inherit"
              startIcon={<FilterListIcon />}
              onClick={handleOpenFilterMenu}
            >
              Filter
            </Button>
            <Button
              color="inherit"
              startIcon={<Add />}
              onClick={handleOpenPromotionForm}
            >
              Apply for ward officer
            </Button>
            <Button
              color="inherit"
              startIcon={<Add />}
              onClick={handleOpenForm}
              id="create-button"
            >
              Create
            </Button>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleOpenUserMenu}
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>

        {/* filter menu */}
        <Menu
          anchorEl={anchorElFilter}
          open={Boolean(anchorElFilter)}
          onClose={handleCloseFilterMenu}
        >
          <MenuItem onClick={() => handleFilterSelection("nearby")}>Nearby Issues</MenuItem>
          <MenuItem onClick={() => handleFilterSelection("upvotes")}>Sort by Upvotes</MenuItem>
          <MenuItem onClick={() => handleFilterSelection("comments")}>Sort by Comments</MenuItem>
        </Menu>
      </AppBar>

      <Box sx={{ paddingTop: "5px", display: "flex" }}>
        <Container sx={{ mt: 4 }}>
          <Grid
            container
            spacing={3}
            sx={{ mt: 4, px: 2, flexGrow: 1 }}
          >
            <Grid
              item
              xs={12}
              md={8}
            >
              {loading ? (
                <Typography>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <Card>
                  <CardContent sx={{ pt: 0, pb: 0 }}>
                    <List sx={{ p: 0 }}>
                      {issues.map((issue) => (
                        <ListItem
                          key={issue.id}
                          button
                          onClick={() => handleCardClick(issue.id)}
                          sx={{
                            flexDirection: "column",
                            alignItems: "flex-start",
                            borderBottom: "1px solid #e0e0e0",
                            py: 2,
                          }}
                        >
                          <ListItemText
                            primary={
                              <>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      mr: 1,
                                      bgcolor: "primary.main",
                                    }}
                                  >
                                    {getDisplayUsername(issue.createdBy).charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    // gutterBottom
                                  >
                                    @{getDisplayUsername(issue.createdBy)} •{" "}
                                    {getTimeAgo(issue.createdAt)}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    mt: 1,
                                    mb: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
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
                                </Box>
                                <Typography variant="h6">{issue.title}</Typography>
                              </>
                            }
                            secondary={
                              <>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    mt: 1,
                                    mb: 1,
                                    display: "-webkit-box",
                                    overflow: "hidden",
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 3,
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {issue.description}
                                </Typography>
                                {issue.imagePaths && issue.imagePaths.length > 0 && (
                                  <Box
                                    sx={{
                                      mt: 2,
                                      mb: 2,
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      gap: 2,
                                    }}
                                  >
                                    {issue.imagePaths.map((mediaPath, index) => {
                                      if (
                                        mediaPath.endsWith(".mp4") ||
                                        mediaPath.endsWith(".mkv") ||
                                        mediaPath.endsWith(".avi")
                                      ) {
                                        return (
                                          <video
                                            key={index}
                                            controls
                                            style={{
                                              maxWidth: "100%",
                                              // height: "720px",
                                            }}
                                          >
                                            <source
                                              src={`http://localhost:3003/${mediaPath}`}
                                              type={
                                                mediaPath.endsWith(".mp4")
                                                  ? "video/mp4"
                                                  : mediaPath.endsWith(".mkv")
                                                    ? "video/x-matroska"
                                                    : "video/x-msvideo"
                                              }
                                            />
                                            Your browser does not support the video tag.
                                          </video>
                                        );
                                      }
                                      return (
                                        <img
                                          key={index}
                                          src={`http://localhost:3003/${mediaPath}`}
                                          alt={`media ${index + 1}`}
                                          style={{
                                            maxWidth: "100%",
                                            // height: "240px",
                                            objectFit: "cover",
                                          }}
                                        />
                                      );
                                    })}
                                  </Box>
                                )}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpvote(issue.id);
                                      }}
                                    >
                                      {issue.upvotedBy.includes(currentUser?.id) ? (
                                        <ArrowUpward
                                          fontSize="small"
                                          color="primary"
                                        />
                                      ) : (
                                        <ArrowUpwardOutlined fontSize="small" />
                                      )}
                                    </IconButton>
                                    <Typography variant="body2">{issue.upvotes}</Typography>
                                  </Box>
                                  <Typography variant="body2">
                                    <Comment
                                      fontSize="small"
                                      sx={{ mr: 1, verticalAlign: "middle" }}
                                    />
                                    {issue.comments ? issue.comments.length : 0} comments
                                  </Typography>
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                position: "sticky",
                top: "78px",
                height: "calc(100vh - 80px)",
                overflowY: "auto",
              }}
            >
              <Card sx={{ height: "100%" }}>
                <RecentPosts />
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem onClick={handleUserProfile}>Profile</MenuItem>
        {/* <MenuItem onClick={handleCloseUserMenu}>My Reports</MenuItem> */}
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
        {currentUser.isWardOfficer && (
          <MenuItem onClick={handleIssuesAroundWard}>Issues around you</MenuItem>
        )}
      </Menu>

      <Dialog
        open={promotionForm}
        onClose={() => setPromotionForm(false)}
      >
        <DialogContent>
          <PromotionApplicationForm />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default HomePage;
