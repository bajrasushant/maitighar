import React from "react";
import { Typography, Box, TextField, Button, Divider, List, ListItem, Paper } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import Comment from "./Comment";

function CommentSection({
  issueId,
  comments,
  newComment,
  setNewComment,
  handleCommentSubmit,
  replyContent,
  showReplyForm,
  setShowReplyForm,
  repliesState,
  handleReplyContentChange,
  handleReplySubmit,
  toggleReplies,
  isAdmin,
}) {
  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }} />

      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: "bold", mb: 1 }}
      >
        Comments ({comments.length})
      </Typography>

      {!isAdmin && (
        <Paper
          elevation={0}
          sx={{ p: 2, backgroundColor: "background.paper" }}
        >
          <form onSubmit={(e) => handleCommentSubmit(e, issueId)}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 2 }}
              multiline
              rows={3}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                endIcon={<SendIcon />}
              >
                Post Comment
              </Button>
            </Box>
          </form>
        </Paper>
      )}

      {comments.length > 0 && (
        <List sx={{ p: 0 }}>
          {comments.map((comment) => (
            <ListItem
              key={comment.id}
              disableGutters
              sx={{ display: "block", p: 0, borderBottom: "1px solid #e0e0e0" }}
            >
              <Comment
                comment={comment}
                replyContent={replyContent}
                showReplyForm={showReplyForm}
                setShowReplyForm={setShowReplyForm}
                repliesState={repliesState}
                handleReplyContentChange={handleReplyContentChange}
                handleReplySubmit={handleReplySubmit}
                toggleReplies={toggleReplies}
                isAdmin={isAdmin}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default CommentSection;
