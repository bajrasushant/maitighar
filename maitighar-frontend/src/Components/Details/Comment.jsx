import { Paper, Grid, Typography, Button, Box, TextField, CircularProgress } from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import getDisplayUsername from "./utils";

function Comment({
  comment,
  replyContent,
  showReplyForm,
  setShowReplyForm,
  replies,
  showReplies,
  loadingReplies,
  handleReplyContentChange,
  handleReplySubmit,
  toggleReplies,
}) {
  return (
    <Paper
      elevation={1}
      className="p-4 mb-4 bg-background-default"
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
            className="font-bold"
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
              className="mt-4"
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
                className="mt-2"
                onClick={() => handleReplySubmit(comment.id)}
              >
                Submit Reply
              </Button>
            </Box>
          )}

          {replies[comment.id]?.length > 0 && (
            <Button
              className="mt-4"
              onClick={() => toggleReplies(comment.id)}
              disabled={loadingReplies[comment.id]}
            >
              {loadingReplies[comment.id] ? (
                <CircularProgress size={20} />
              ) : (
                `${showReplies[comment.id] ? "Hide" : "Show"} ${replies[comment.id].length} ${
                  replies[comment.id].length === 1 ? "Reply" : "Replies"
                }`
              )}
            </Button>
          )}

          {showReplies[comment.id] && replies[comment.id]?.length > 0 && (
            <Box className="mt-4 pl-6">
              {replies[comment.id].map((reply) => (
                <Paper
                  key={reply.id}
                  className="p-4 mb-2"
                >
                  <Typography
                    variant="subtitle1"
                    className="font-bold"
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
}

export default Comment;
