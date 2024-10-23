import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, CircularProgress, Typography, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNotification } from "../../context/NotificationContext";
import issueService from "../../services/issues";
import commentService from "../../services/comment";
import IssueCard from "./IssueCard";
import CommentSection from "./CommentSection";
import useCommentState from "./hooks/useCommentState";
import useLocationName from "./hooks/useLocationName";

function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  }, [id, fetchLocationName, setNotification, setComments]);

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

      <IssueCard
        issue={issue}
        setIssue={setIssue}
        locationName={locationName}
        commentsCount={comments.length}
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
      />
    </Container>
  );
}

export default Details;
