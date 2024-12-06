import React from "react";
import { Paper, Typography, Button, Box, TextField, CircularProgress } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import getDisplayUsername from "./utils";

const Comment = React.memo(
  ({
    comment,
    replyContent,
    showReplyForm,
    setShowReplyForm,
    repliesState,
    handleReplyContentChange,
    handleReplySubmit,
    toggleReplies,
    isAdmin,
  }) => {
    const { replies = [], show = false, loading } = repliesState[comment.id] || {};

    return (
      <Paper
        elevation={1}
        sx={{ p: 2, mb: 2, bgcolor: "background.default" }}
      >
        <Typography
          variant="caption"
          display="block"
          gutterBottom
        >
          {getDisplayUsername(comment.createdBy)} •{" "}
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 2 }}
        >
          {comment.description}
        </Typography>

        {!isAdmin && (
          <Button
            size="small"
            onClick={() =>
              setShowReplyForm((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))
            }
          >
            {showReplyForm[comment.id] ? "Cancel" : "Reply"}
          </Button>
        )}

        {!isAdmin && showReplyForm[comment.id] && (
          <Box
            component="form"
            sx={{ mt: 2 }}
          >
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Write a reply..."
              value={replyContent[comment.id] || ""}
              onChange={(e) => handleReplyContentChange(comment.id, e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => handleReplySubmit(comment.id)}
            >
              Submit Reply
            </Button>
          </Box>
        )}

        {replies.length > 0 && (
          <Button
            size="small"
            onClick={() => toggleReplies(comment.id)}
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? (
              <CircularProgress size={16} />
            ) : (
              `${show ? "Hide" : "Show"} ${replies.length} ${
                replies.length === 1 ? "Reply" : "Replies"
              }`
            )}
          </Button>
        )}

        {show && replies.length > 0 && (
          <Box sx={{ mt: 2, pl: 2 }}>
            {replies.map((reply) => (
              <Paper
                key={reply.id}
                sx={{ p: 2, mb: 2, bgcolor: "background.paper" }}
              >
                <Typography
                  variant="caption"
                  display="block"
                  gutterBottom
                >
                  {getDisplayUsername(reply.createdBy)} •{" "}
                  {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                </Typography>
                <Typography variant="body2">{reply.description}</Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    );
  },
);

Comment.displayName = "Comment";

export default Comment;
