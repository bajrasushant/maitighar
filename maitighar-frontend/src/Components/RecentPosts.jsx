import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
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
    <Card>
      <CardContent>
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
            >
              <ListItemText
                primary={issue.title}
                secondary={`Posted by ${getDisplayUsername(issue.createdBy)} on ${new Date(issue.createdAt).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default RecentPosts;
