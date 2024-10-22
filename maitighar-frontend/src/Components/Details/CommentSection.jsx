import { Typography, Box, TextField, Button, Divider } from "@mui/material";
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
  replies,
  showReplies,
  loadingReplies,
  handleReplyContentChange,
  handleReplySubmit,
  toggleReplies,
}) {
  return (
    <>
      <Divider className="my-5" />

      <form onSubmit={(e) => handleCommentSubmit(e, issueId)}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Add a comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-5"
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
        >
          Submit
        </Button>
      </form>

      {comments.length > 0 && (
        <Box className="mt-4">
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
              replies={replies}
              showReplies={showReplies}
              loadingReplies={loadingReplies}
              handleReplyContentChange={handleReplyContentChange}
              handleReplySubmit={handleReplySubmit}
              toggleReplies={toggleReplies}
            />
          ))}
        </Box>
      )}
    </>
  );
}

export default CommentSection;
