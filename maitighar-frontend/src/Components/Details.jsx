import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  CircularProgress,
  TextField,
  Divider,
  Box,
  Chip,
  Paper,
} from "@mui/material";
import { ArrowUpward, ArrowUpwardOutlined, Comment, ArrowBack } from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import issueService from "../services/issues";
import commentService from "../services/comment";
import { useUserValue } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";

// helper to get username
const getDisplayUsername = (user) => {
  if (!user || !user.username) {
    return "Deleted User";
  }
  return user.username;
};

// Separate components for better organization
function MediaRenderer({ mediaPath }) {
  const appUrl = "http://localhost:3003";
  const isVideo = /\.(mp4|mkv|avi)$/.test(mediaPath);
  const videoTypes = {
    mp4: "video/mp4",
    mkv: "video/x-matroska",
    avi: "video/x-msvideo",
  };

  if (isVideo) {
    const extension = mediaPath.split(".").pop();
    return (
      <video
        controls
        className="max-w-full mb-2.5 h-120"
      >
        <source
          src={`${appUrl}/${mediaPath}`}
          type={videoTypes[extension]}
        />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <img
      src={`${appUrl}/${mediaPath}`}
      alt="Issue media"
      className="max-w-auto mb-2.5 h-120"
    />
  );
}

function CommentSection({
  comment,
  onReply,
  showReplyForm,
  replyContent,
  onReplySubmit,
  replies,
  showReplies,
  onToggleReplies,
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

          <Button onClick={() => onReply(comment.id)}>{showReplyForm ? "Cancel" : "Reply"}</Button>

          {showReplyForm && (
            <Box
              component="form"
              className="mt-4"
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Write a reply..."
                value={replyContent || ""}
                onChange={(e) => onReplySubmit(comment.id, e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                className="mt-2"
                onClick={() => onReplySubmit(comment.id)}
              >
                Submit Reply
              </Button>
            </Box>
          )}

          {replies && (
            <Button
              className="mt-4"
              onClick={() => onToggleReplies(comment.id)}
            >
              {showReplies ? "Hide Replies" : "View Replies"} ({replies.length || 0})
            </Button>
          )}

          {replies && showReplies && (
            <Box className="mt-4 pl-6">
              {replies.map((reply, index) => (
                <Paper
                  key={index}
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

function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const currentUser = useUserValue();
  const [replyContent, setReplyContent] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [replies, setReplies] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const { setNotification } = useNotification();

  const fetchLocationName = useCallback(
    async (lat, lon) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        );
        const data = await response.json();
        setLocationName(data.display_name || "Location name not available");
      } catch (err) {
        console.error("Error fetching location name:", err);
        setNotification({ message: "Error fetching location. Please try again.", status: "error" });
        setLocationName("Unable to fetch location name");
      }
    },
    [setNotification],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchIssueData = async () => {
      try {
        const [fetchedIssue, fetchedComments] = await Promise.all([
          issueService.getIssueId(id),
          commentService.getCommentByIssue(id),
        ]);

        if (!isMounted) return;

        setIssue(fetchedIssue);
        setComments(fetchedComments);

        if (fetchedIssue?.latitude && fetchedIssue?.longitude) {
          await fetchLocationName(fetchedIssue.latitude, fetchedIssue.longitude);
        }
      } catch (err) {
        if (!isMounted) return;
        setError("Failed to fetch issue details");
        setNotification({ message: "Error loading issue details", status: "error" });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchIssueData();

    return () => {
      isMounted = false;
    };
  }, [id, fetchLocationName, setNotification]);

  const handleUpvote = async () => {
    try {
      const updatedIssue = await issueService.upvoteIssue(id);
      setIssue(updatedIssue);
    } catch (err) {
      setNotification({ message: "Failed to update upvote", status: "error" });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const savedComment = await commentService.createComment({
        description: newComment,
        issue: id,
      });
      setComments((prev) => [...prev, savedComment]);
      setNewComment("");
    } catch (err) {
      setNotification({ message: "Error creating comment", status: "error" });
    }
  };

  const toggleReplies = useCallback(
    async (commentId) => {
      setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));

      if (!replies[commentId]) {
        try {
          const fetchedReplies = await commentService.getReplyByComment(commentId);
          setReplies((prev) => ({ ...prev, [commentId]: fetchedReplies }));
        } catch (err) {
          setNotification({ message: "Error fetching replies", status: "error" });
        }
      }
    },
    [replies, setNotification],
  );

  const handleReplySubmit = async (commentId) => {
    if (!replyContent[commentId]?.trim()) return;

    try {
      const savedReply = await commentService.createReply(commentId, {
        description: replyContent[commentId],
        parentComment: commentId,
        issue: id,
      });

      setReplies((prev) => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), savedReply],
      }));
      setReplyContent((prev) => ({ ...prev, [commentId]: "" }));
      setShowReplyForm((prev) => ({ ...prev, [commentId]: false }));
    } catch (err) {
      setNotification({ message: "Error submitting reply", status: "error" });
    }
  };

  if (loading) {
    return (
      <Container className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => navigate("/")}>Go back to Home</Button>
      </Container>
    );
  }

  if (!issue) {
    return (
      <Container>
        <Typography>No report found with this ID.</Typography>
        <Button onClick={() => navigate("/")}>Go back to Home</Button>
      </Container>
    );
  }

  return (
    <Container>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/")}
        className="mt-5 mb-5"
      >
        Back to Home
      </Button>

      <Card>
        <CardContent className="p-8">
          {/* Issue Details */}
          <Typography variant="h5">{issue.title}</Typography>
          <Typography
            variant="body2"
            color="textSecondary"
          >
            Posted by {getDisplayUsername(issue.createdBy)}
            on {new Date(issue.createdAt).toLocaleDateString()}
          </Typography>

          {/* Tags */}
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

          {/* Description and Details */}
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

          {/* Media */}
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

          {/* Actions */}
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
            <Button startIcon={<Comment />}>{comments.length} Comments</Button>
          </Grid>

          <Divider className="my-5" />

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit}>
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

          {/* Comments Section */}
          {comments.length > 0 && (
            <Box className="mt-4">
              <Typography
                variant="h6"
                gutterBottom
              >
                Comments ({comments.length})
              </Typography>
              {comments.map((comment, index) => (
                <CommentSection
                  key={index}
                  comment={comment}
                  onReply={(commentId) =>
                    setShowReplyForm((prev) => ({ ...prev, [commentId]: !prev[commentId] }))
                  }
                  showReplyForm={showReplyForm[comment.id]}
                  replyContent={replyContent[comment.id]}
                  onReplySubmit={handleReplySubmit}
                  replies={replies[comment.id]}
                  showReplies={showReplies[comment.id]}
                  onToggleReplies={toggleReplies}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default Details;
