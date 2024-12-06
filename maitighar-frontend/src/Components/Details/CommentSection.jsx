import { Typography, Box, TextField, Button, Divider, List, ListItem } from "@mui/material";
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

      {!isAdmin && (
        <form onSubmit={(e) => handleCommentSubmit(e, issueId)}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
          >
            Submit
          </Button>
        </form>
      )}

      {comments.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h6"
            gutterBottom
          >
            Comments ({comments.length})
          </Typography>
          <List>
            {comments.map((comment) => (
              <ListItem
                key={comment.id}
                disableGutters
                sx={{ display: "block", mb: 2 }}
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
        </Box>
      )}
    </Box>
  );
}

export default CommentSection;
