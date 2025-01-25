import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, CircularProgress, Typography, Button, Box } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNotification } from "../../context/NotificationContext";
import issueService from "../../services/issues";
import commentService from "../../services/comment";
import IssueCard from "./IssueCard";
import CommentSection from "./CommentSection";
import useCommentState from "./hooks/useCommentState";
import useLocationName from "./hooks/useLocationName";

function Details({ isAdmin = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const { setNotification } = useNotification();
  const { locationName, fetchLocationName } = useLocationName();
  const {
    comments,
    setComments,
    newComment,
    setNewComment,
    replyContent,
    showReplyForm,
    repliesState,
    handleCommentSubmit,
    handleReplySubmit,
    handleReplyContentChange,
    toggleReplies,
    setShowReplyForm,
  } = useCommentState(id);

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

        const replyPromises = fetchedComments.map((comment) => toggleReplies(comment.id));

        // Wait for all replies to be fetched
        await Promise.all(replyPromises);

        if (fetchedIssue?.latitude && fetchedIssue?.longitude) {
          await fetchLocationName(fetchedIssue.latitude, fetchedIssue.longitude);
        }
      } catch (err) {
        if (!isMounted) return;
        setErrorMessage("Failed to fetch issue details. Issue might have been closed or deleted.");
        setNotification({ message: "Error loading issue details. Issue might have been closed or deleted.", status: "error" });
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
  }, [id, fetchLocationName, setNotification, setComments]);

  const handleBackToHome = () => {
    if (isAdmin) {
      navigate("/admin-dashboard");
    } else {
      navigate("/");
    }
  };

  const handleDelete = async (issueId) => {
    try {
      await issueService.deleteIssue(issueId);
      setNotification({ message: "Issue deleted successfully", status: "success" });
      navigate("/");
    } catch (error) {
      console.error("Failed to delete issue:", error);
      setNotification({ message: "Failed to delete issue", status: "error" });
    }
  };

  if (loading) {
    return (
      <Container className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Container>
    );
  }

  if (errorMessage) {
    return (
      <Container>
        <Typography color="error">{errorMessage}</Typography>
        <Button onClick={handleBackToHome}>Go back to Home</Button>
      </Container>
    );
  }

  if (!issue) {
    return (
      <Container>
        <Typography>No report found with this ID.</Typography>
        <Button onClick={handleBackToHome}>Go back to Home</Button>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{ mt: 4, mb: 4 }}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={handleBackToHome}
        sx={{ mb: 3 }}
      >
        Back to Home
      </Button>

      {!issue || !issue.isActive ? (
        <Typography
          variant="h6"
          color="error"
        >
          This issue has been deleted.
        </Typography>
      ) : (
        <>
          <IssueCard
            issue={issue}
            setIssue={setIssue}
            locationName={locationName}
            commentsCount={comments.length}
            onDelete={handleDelete}
          />

          <CommentSection
            issueId={id}
            comments={comments}
            newComment={newComment}
            setNewComment={setNewComment}
            handleCommentSubmit={handleCommentSubmit}
            replyContent={replyContent}
            showReplyForm={showReplyForm}
            setShowReplyForm={setShowReplyForm}
            repliesState={repliesState}
            handleReplyContentChange={handleReplyContentChange}
            handleReplySubmit={handleReplySubmit}
            toggleReplies={toggleReplies}
            isAdmin={isAdmin}
          />
        </>
      )}
    </Container>
  );
}

export default Details;
