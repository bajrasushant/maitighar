import {
  Typography, Box, TextField, Button, Divider,
} from "@mui/material";
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
    <>
      <Divider style={{ margin: "20px 0" }} />

      {!isAdmin && (
        <form onSubmit={(e) => handleCommentSubmit(e, issueId)}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ marginBottom: "20px" }}
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
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="h6"
            gutterBottom
          >
            Comments ({comments.length})
          </Typography>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
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
          ))}
        </Box>
      )}
    </>
  );
}

export default CommentSection;
