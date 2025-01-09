import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { ArrowUpward, ArrowUpwardOutlined, Comment, Edit, Delete } from "@mui/icons-material";
import { useState } from "react";
import { useUserValue } from "../../context/UserContext";
import issueService from "../../services/issues";
import MediaRenderer from "./MediaRenderer";
import getDisplayUsername from "./utils";
import EditIssueForm from "./EditIssueForm";

function IssueCard({ issue, setIssue, locationName, commentsCount, onDelete }) {
  const currentUser = useUserValue();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleUpvote = async () => {
    try {
      const updatedIssue = await issueService.upvoteIssue(issue.id);
      setIssue(updatedIssue);
    } catch (err) {
      console.error("Failed to upvote:", err);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditSubmit = async (updatedIssue) => {
    try {
      const response = await issueService.updateIssue(issue.id, updatedIssue);
      setIssue(response);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update issue:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await issueService.deleteIssue(issue.id);
      onDelete(issue.id);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete issue:", err);
    }
  };

  if (isEditing) {
    return (
      <EditIssueForm
        issue={issue}
        onSubmit={handleEditSubmit}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
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
            color="textSecondary"
          >
            @{getDisplayUsername(issue.createdBy)} •{" "}
            {new Date(issue.createdAt).toLocaleDateString()}
          </Typography>
          {currentUser && currentUser.id === issue.createdBy.id && (
            <Box sx={{ ml: "auto", display: "flex" }}>
              <IconButton
                onClick={handleEdit}
                size="small"
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => setIsDeleteDialogOpen(true)}
                size="small"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          )}
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
          variant="subtitle1"
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
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Issue?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this issue? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
export default IssueCard;
