import { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import issueService from "../services/issues";
import { useNotification } from "../context/NotificationContext";
import getDisplayUsername from "./Details/utils";

function RecentPosts() {
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentIssues = async () => {
      try {
        const issues = await issueService.getRecentIssues();
        setRecentIssues(issues);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recent issues:", error);
        setNotification({ message: "Failed to fetch recent issues.", status: "error" });
        setLoading(false);
      }
    };

    fetchRecentIssues();
  }, [setNotification]);

  const handleIssueClick = (id) => {
    navigate(`/details/${id}`);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent
        sx={{
          flexGrow: 1,
          overflowY: "auto", // Enable vertical scrolling
          overflowX: "hidden", // Disable horizontal scrolling
          "&::-webkit-scrollbar": {
            display: "none", // Hide scrollbar for Webkit browsers
          },
          "-ms-overflow-style": "none", // Hide scrollbar for IE and Edge
          "scrollbar-width": "none", // Hide scrollbar for Firefox
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          Recent Posts
        </Typography>
        <List>
          {recentIssues.map((issue) => (
            <ListItem
              key={issue.id}
              button
              onClick={() => handleIssueClick(issue.id)}
              sx={{
                flexDirection: "column",
                alignItems: "flex-start",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <ListItemText
                primary={
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          mr: 1,
                          bgcolor: "primary.main",
                          fontSize: "0.8rem",
                        }}
                      >
                        {getDisplayUsername(issue.createdBy).charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography
                        variant="caption"
                        display="block"
                      >
                        @{getDisplayUsername(issue.createdBy)} •{" "}
                        {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1">{issue.title}</Typography>
                  </>
                }
                secondary={`${issue.upvotes} upvotes  •   ${issue.comments.length} comments`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default RecentPosts;
