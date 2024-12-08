import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Avatar,
} from "@mui/material";
import { ArrowUpward, ArrowUpwardOutlined, Comment } from "@mui/icons-material";
import { useUserValue } from "../../context/UserContext";
import issueService from "../../services/issues";
import MediaRenderer from "./MediaRenderer";
import getDisplayUsername from "./utils";

function IssueCard({ issue, setIssue, locationName, commentsCount }) {
  const currentUser = useUserValue();

  const handleUpvote = async () => {
    try {
      const updatedIssue = await issueService.upvoteIssue(issue.id);
      setIssue(updatedIssue);
    } catch (err) {
      console.error("Failed to upvote:", err);
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        {/* <Typography
          variant="caption"
          display="block"
          gutterBottom
        >
          {getDisplayUsername(issue.createdBy)} • {getTimeAgo(issue.createdAt)}
        </Typography> */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: "primary.main" }}>
            {getDisplayUsername(issue.createdBy).charAt(0).toUpperCase()}
          </Avatar>
          <Typography
            variant="caption"
            color="textSecondary"
          >
            @{getDisplayUsername(issue.createdBy)} •{" "}
            {new Date(issue.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
        <Box
          sx={{
            mt: 1,
            mb: 2,
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
        <Typography
          variant="h6"
          gutterBottom
        >
          {issue.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, mb: 2 }}
        >
          {issue.description}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Status: {issue.status} <br />
          Location: {locationName.split(",").slice(0, 5).join(", ")}
        </Typography>
        {issue.imagePaths?.length > 0 && (
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
            {issue.imagePaths.map((mediaPath, index) => (
              <MediaRenderer
                key={index}
                mediaPath={mediaPath}
              />
            ))}
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mt: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              size="small"
              onClick={handleUpvote}
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
              color="action"
              sx={{ mr: 1, verticalAlign: "middle" }}
            />
            {commentsCount} comments
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default IssueCard;
