import React from "react";
import { Paper, Grid, Typography, Button, Box, TextField, CircularProgress } from "@mui/material";
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
  }) => {
    console.log(repliesState, comment);

    const { replies = [], show = false, loading } = repliesState[comment.id] || {};

    return (
      <Paper
        elevation={1}
        // className="p-4 mb-4 bg-background-default"
        sx={{
          p: 2,
          mb: 2,
          bgcolor: "background.default",
        }}
      >
        <Grid
          container
          spacing={2}
          alignItems="flex-start"
        >
          <Grid
            item
            xs
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold" }}
              color={comment.createdBy ? "initial" : "textSecondary"}
            >
              {getDisplayUsername(comment.createdBy)}
              {!comment.createdBy && " (Account Deleted)"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
            >
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </Typography>

            <Typography variant="body1">{comment.description}</Typography>

            <Button
              onClick={() =>
                setShowReplyForm((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))
              }
            >
              {showReplyForm[comment.id] ? "Cancel" : "Reply"}
            </Button>

            {showReplyForm[comment.id] && (
              <Box
                component="form"
                sx={{ mt: 4 }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Write a reply..."
                  value={replyContent[comment.id] || ""}
                  onChange={(e) => handleReplyContentChange(comment.id, e.target.value)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => handleReplySubmit(comment.id)}
                >
                  Submit Reply
                </Button>
              </Box>
            )}

            {replies.length > 0 && (
              <Button
                onClick={() => toggleReplies(comment.id)}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={20} />
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
                    sx={{ p: 2, mb: 2 }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold" }}
                    >
                      {getDisplayUsername(reply.createdBy)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </Typography>
                    <Typography variant="subtitle2">{reply.description}</Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    );
  },
);

Comment.displayName = "Comment";

export default Comment;
