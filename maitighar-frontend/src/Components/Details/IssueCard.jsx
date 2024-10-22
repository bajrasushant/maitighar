import React from "react";
import { Card, CardContent, Typography, Box, Chip, Grid, IconButton, Button } from "@mui/material";
import { ArrowUpward, ArrowUpwardOutlined, Comment } from "@mui/icons-material";
import { useUserValue } from "../../context/UserContext";
import issueService from "../../services/issues";
import MediaRenderer from "./MediaRenderer";
import { getDisplayUsername } from "./utils";

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
      <CardContent className="p-8">
        <Typography variant="h5">{issue.title}</Typography>
        <Typography
          variant="body2"
          color="textSecondary"
        >
          Posted by {getDisplayUsername(issue.createdBy)}
          on {new Date(issue.createdAt).toLocaleDateString()}
        </Typography>

        <Box className="mt-2 flex items-center gap-2">
          <Chip
            label={issue.type}
            color={issue.type === "issue" ? "error" : "success"}
            size="small"
          />
          <Chip
            label={issue.department}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

        <Typography
          variant="body1"
          paragraph
          className="mt-4"
        >
          {issue.description}
        </Typography>

        <Typography
          variant="body2"
          color="textSecondary"
        >
          Status: {issue.status} <br />
          Location: {locationName.split(",").slice(0, 5).join(", ")}
        </Typography>

        {issue.imagePaths?.length > 0 && (
          <div className="mt-5">
            {issue.imagePaths.map((mediaPath, index) => (
              <MediaRenderer
                key={index}
                mediaPath={mediaPath}
              />
            ))}
          </div>
        )}

        <Grid className="mt-2 flex items-center gap-4">
          <Box className="flex items-center">
            <IconButton onClick={handleUpvote}>
              {issue.upvotedBy.includes(currentUser?.id) ? (
                <ArrowUpward color="primary" />
              ) : (
                <ArrowUpwardOutlined />
              )}
            </IconButton>
            <Typography>{issue.upvotes}</Typography>
          </Box>
          <Button startIcon={<Comment />}>{commentsCount} Comments</Button>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default IssueCard;
