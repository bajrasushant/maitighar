import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Foundation,
  Add,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
} from "@mui/icons-material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { useNavigate } from "react-router-dom";
import { useUserValue, useUserDispatch } from "../context/UserContext";
import notificationService from "../services/notification";
import SearchBar from "./SearchBar";

function Navbar({ onIssueClick }) {
  const navigate = useNavigate();
  const currentUser = useUserValue();
  const userDispatch = useUserDispatch();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [userNotifications, setUserNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAll(currentUser?.id);
      const sortedNotifications = response.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      );
      setUserNotifications(sortedNotifications);
      setUnreadCount(response.filter((notification) => !notification.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    if (currentUser) fetchNotifications();
  }, [currentUser]);

  const handleOpenNotification = async (event) => {
    setAnchorElNotifications(event.currentTarget);
    await fetchNotifications();
  };

  const handleCloseNotifications = () => setAnchorElNotifications(null);

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

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleLogout = () => {
    userDispatch({ type: "LOGOUT" });
    navigate("/login");
  };
  const handleUserProfile = () => navigate("/profile");
  const handleOpenPromotionForm = () => navigate("/promotion-form");
  const handleCreate = () => navigate("/create");

  const handleCardClick = (id) => {
    navigate(`/details/${id}`);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    const intervals = [
      { label: "yr", divisor: 31536000 },
      { label: "mon", divisor: 2592000 },
      { label: "d", divisor: 86400 },
      { label: "hr", divisor: 3600 },
      { label: "min", divisor: 60 },
    ];
    for (let interval of intervals) {
      const count = Math.floor(seconds / interval.divisor);
      if (count >= 1) return `${count} ${interval.label}. ago`;
    }
    return "Just now";
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Box
            display="flex"
            alignItems="center"
            onClick={() => navigate("/")}
            sx={{ cursor: "pointer" }}
          >
            {/* <Foundation sx={{ mr: 1 }} /> */}
            <img
              src="/grs logo white.png"
              alt="logo"
              width="32"
              height="32"
              style={{ marginRight: 10 }}
            />
            GRS
          </Box>
        </Typography>

        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <SearchBar onIssueClick={onIssueClick} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<Add />}
            onClick={handleCreate}
            id="create-button"
          >
            Create
          </Button>
          <IconButton
            color="inherit"
            onClick={handleOpenNotification}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleOpenUserMenu}
          >
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Notifications Menu */}
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
                onClick={() => {
                  handleMarkNotificationAsRead(notification._id);
                  if (notification.issue) {
                    handleCardClick(notification.issue);
                  }
                }}
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
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "primary.main",
                      fontSize: "0.875rem",
                      mr: 2,
                    }}
                  >
                    {notification.message?.charAt(0).toUpperCase()}
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
                </Box>
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

      {/* User Menu */}
      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem onClick={handleUserProfile}>
          <PersonOutlineOutlinedIcon sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem
          color="inherit"
          startIcon={<Add />}
          onClick={handleOpenPromotionForm}
        >
          <AssignmentOutlinedIcon sx={{ mr: 1 }} />
          Apply for ward officer
        </MenuItem>
        {/* <MenuItem onClick={handleCloseUserMenu}>My Reports</MenuItem> */}
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} />
          Logout
        </MenuItem>
        {/* {currentUser.isWardOfficer && (
                <MenuItem onClick={handleIssuesAroundWard}>Issues around you</MenuItem>
              )} */}
      </Menu>
    </AppBar>
  );
}

export default Navbar;
