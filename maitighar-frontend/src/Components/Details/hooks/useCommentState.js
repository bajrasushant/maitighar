import { useState, useCallback } from "react";
import { useNotification } from "../../../context/NotificationContext";
import commentService from "../../../services/comment";

export default function useCommentState(issueId) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [repliesState, setRepliesState] = useState({});
  const { setNotification } = useNotification();

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const savedComment = await commentService.createComment({
        description: newComment,
        issue: issueId,
      });
      setComments((prev) => [...prev, savedComment]);
      setNewComment("");
    } catch (err) {
      setNotification({ message: "Error creating comment", status: "error" });
    }
  };
  const handleReplyContentChange = (commentId, content) => {
    setReplyContent((prev) => ({
      ...prev,
      [commentId]: content,
    }));
  };

  const toggleReplies = useCallback(
    async (commentId) => {
      const { loaded, replies } = repliesState[commentId] || {};
      if (loaded) {
        setRepliesState((prev) => ({
          ...prev,
          [commentId]: { ...prev[commentId], show: !prev[commentId]?.show },
        }));
        return;
      }

      try {
        setRepliesState((prev) => ({
          ...prev,
          [commentId]: { ...prev[commentId], loading: true },
        }));
        const fetchedReplies = await commentService.getReplyByComment(commentId);

        setRepliesState((prev) => ({
          ...prev,
          [commentId]: {
            replies: fetchedReplies.length > 0 ? fetchedReplies : [],
            show: fetchedReplies > 0,
            loaded: true,
          },
        }));
      } catch (err) {
        setNotification({ message: "Error fetching replies", status: "error" });
      } finally {
        setRepliesState((prev) => ({
          ...prev,
          [commentId]: { ...prev[commentId], loading: false },
        }));
      }
    },
    [repliesState, setNotification],
  );

  const handleReplySubmit = async (commentId) => {
    if (!replyContent[commentId]?.trim()) return;

    try {
      const savedReply = await commentService.createReply(commentId, {
        description: replyContent[commentId],
        parentComment: commentId,
        issue: issueId,
      });

      setRepliesState((prev) => {
        const existingReplies = prev[commentId]?.replies || [];
        return {
          ...prev,
          [commentId]: {
            replies: [...existingReplies, savedReply],
            show: true,
            loaded: true,
          },
        };
      });

      setReplyContent((prev) => ({ ...prev, [commentId]: "" }));
      setShowReplyForm((prev) => ({ ...prev, [commentId]: false }));
    } catch (err) {
      setNotification({ message: "Error submitting reply", status: "error" });
    }
  };

  return {
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
  };
}
