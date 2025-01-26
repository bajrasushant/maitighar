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
  Badge,
  Divider,
} from "@mui/material";
import {
  ArrowUpward,
  Comment,
  Add,
  Notifications,
  AccountCircle,
  ArrowUpwardOutlined,
} from "@mui/icons-material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FoundationIcon from "@mui/icons-material/Foundation";
import { useNavigate } from "react-router-dom";
import PromotionApplicationForm from "./PromotionApplicationForm";
import { useUserValue, useUserDispatch } from "../context/UserContext";
import issueService from "../services/issues";
import notificationService from "../services/notification";
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

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [anchorElFilter, setAnchorElFilter] = useState(null);
  const [sortType, setSortType] = useState("");

  const [userNotifications, setUserNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAll(currentUser?.id);
      // Sort notifications by date and take only the top 5
      const sortedNotifications = response.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      );
      // .slice(0, 5);
      setUserNotifications(sortedNotifications);
      // setUserNotifications(response);
      setUnreadCount(response.filter((notification) => !notification.read).length);
    } catch (errorHappens) {
      console.error("Failed to fetch notifications", errorHappens);
    }
  };

  const handleOpenNotification = async (event) => {
    setAnchorElNotifications(event.currentTarget);
    await fetchNotifications();
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(currentUser.id, notificationId);
      const updatedNotifications = userNotifications.map((notification) =>
        notification._id === notificationId ? { ...notification, read: true } : notification,
      );
      setUserNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

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
    fetchNotifications();
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
    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (years > 0) return `${years} yr. ago`;
    if (months > 0) return `${months} mon. ago`;
    if (days > 0) return `${days} d. ago`;
    if (hours > 0) return `${hours} hr. ago`;
    if (minutes > 0) return `${minutes} min. ago`;
    return "Just now";
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ display: "flex", alignItems: "center", minWidth: 100 }}
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
              onClick={handleOpenNotification}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
              >
                <Notifications />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleOpenUserMenu}
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>

        <Menu
          anchorEl={anchorElNotifications}
          open={Boolean(anchorElNotifications)}
          onClose={handleCloseNotifications}
          PaperProps={{
            sx: {
              maxWidth: 400,
              maxHeight: "40vh",
              overflowY: "auto",
              overflowX: "hidden",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              "-ms-overflow-style": "none",
              "scrollbar-width": "none",
            },
          }}
        >
          {userNotifications.length > 0 ? (
            <>
              {userNotifications.map((notification) => (
                <MenuItem
                  key={notification._id}
                  onClick={() => handleMarkNotificationAsRead(notification._id)}
                  sx={{
                    backgroundColor: !notification.read ? "action.hover" : "transparent",
                    borderLeft: !notification.read ? 4 : 0,
                    borderColor: "primary.main",
                    pl: !notification.read ? 1.5 : 2,
                    py: 2,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    minWidth: 320,
                    position: "relative", // Required for positioning the timestamp
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "primary.main",
                      fontSize: "0.875rem",
                    }}
                  >
                    {notification.username?.charAt(0).toUpperCase() || "U"}
                    {/* {getDisplayUsername(issue.createdBy).charAt(0).toUpperCase()} */}
                  </Avatar>
                  <Box sx={{ flex: 1, pr: 8, overflowWrap: "break-word" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: !notification.read ? 600 : 400,
                        wordBreak: "break-word", // Ensures long words break to avoid overflow
                        whiteSpace: "normal", // Allows wrapping of text
                      }}
                    >
                      {notification.message}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      position: "absolute",
                      right: 16,
                      top: 16,
                      whiteSpace: "nowrap", // Prevents the timestamp from wrapping
                    }}
                  >
                    {getTimeAgo(notification.timestamp)}
                  </Typography>
                </MenuItem>
              ))}
              <Divider />
            </>
          ) : (
            <MenuItem disabled>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                No notifications
              </Typography>
            </MenuItem>
          )}
        </Menu>

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
                <>
                  <Button
                    color="inherit"
                    startIcon={<FilterListIcon />}
                    onClick={handleOpenFilterMenu}
                  >
                    Filter
                  </Button>
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
                </>
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
                // overflowY: "auto",
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
