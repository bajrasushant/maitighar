import React from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  CircularProgress,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import getDisplayUsername from "./utils";
import helpers from "../../helpers/helpers";

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

    const handleApprove = async (commentId) => {
      const config = helpers.getConfig();
      try {
        const response = await axios.post(`/api/comments/${commentId}/approve`, {}, config);
        if (response.status === 200) {
          const updatedComment = response.data;
          console.log("Approval successful:", updatedComment);
        } else {
          console.error("Error approving comment:", response.data.error);
        }
      } catch (error) {
        console.error("Error:", error.message);
      }
    };

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: comment.isCommunityNote ? "primary.light" : "background.default",
          border: comment.isCommunityNote ? "2px solid" : "none",
          borderColor: comment.isCommunityNote ? "primary.main" : "transparent",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: "primary.main" }}>
            {getDisplayUsername(comment.createdBy).charAt(0).toUpperCase()}
          </Avatar>

          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold" }}
          >
            {getDisplayUsername(comment.createdBy)}{" "}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            &nbsp; • &nbsp;
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{ mb: 2, ml: 6 }}
        >
          {comment.description}
        </Typography>

        <Box sx={{ ml: 6, display: "flex", justifyContent: "flex-start", gap: 1 }}>
          {comment.isCommunityNote && (
            <Typography
              variant="subtitle2"
              color="primary"
              sx={{ fontWeight: "bold", mb: 1 }}
            >
              Community Note
            </Typography>
          )}
          {comment.canApprove && !comment.parentComment && (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleApprove(comment.id)}
            >
              Approve
            </Button>
          )}

          {!isAdmin && (
            <Button
              size="small"
              startIcon={<ReplyIcon />}
              onClick={() =>
                setShowReplyForm((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))
              }
            >
              {showReplyForm[comment.id] ? "Cancel" : "Reply"}
            </Button>
          )}

          {replies.length > 0 && (
            <Button
              size="small"
              onClick={() => toggleReplies(comment.id)}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={16} />
                ) : show ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )
              }
            >
              {loading
                ? "Loading"
                : `${show ? "Hide" : "Show"} ${replies.length} ${replies.length === 1 ? "Reply" : "Replies"}`}
            </Button>
          )}
        </Box>

        {!isAdmin && showReplyForm[comment.id] && (
          <Box
            component="form"
            sx={{ mt: 2, ml: 6 }}
          >
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Write a reply..."
              value={replyContent[comment.id] || ""}
              onChange={(e) => handleReplyContentChange(comment.id, e.target.value)}
              multiline
              rows={2}
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleReplySubmit(comment.id)}
              endIcon={<ReplyIcon />}
            >
              Post Reply
            </Button>
          </Box>
        )}

        {show && replies.length > 0 && (
          <Box sx={{ mt: 2, ml: 6 }}>
            <Divider sx={{ mb: 2 }} />
            {replies.map((reply) => (
              <Paper
                key={reply.id}
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      mr: 2,
                      bgcolor: "primary.main",
                      fontSize: "0.8rem",
                    }}
                  >
                    {getDisplayUsername(reply.createdBy).charAt(0).toUpperCase()}
                  </Avatar>

                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
                  >
                    {getDisplayUsername(reply.createdBy)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    &nbsp; • &nbsp;
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.8rem" }}
                  >
                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ ml: 4 }}
                >
                  {reply.description}
                </Typography>
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
