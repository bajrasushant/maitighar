import { useState, useCallback } from "react";
import { useNotification } from "../../../context/NotificationContext";
import commentService from "../../../services/comment";

export default function useCommentState(issueId) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [replies, setReplies] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [repliesLoaded, setRepliesLoaded] = useState({});
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
      // If replies are already loaded, just toggle visibility
      if (repliesLoaded[commentId]) {
        setShowReplies((prev) => ({
          ...prev,
          [commentId]: !prev[commentId],
        }));
        return;
      }

      try {
        setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
        const fetchedReplies = await commentService.getReplyByComment(commentId);

        setReplies((prev) => ({ ...prev, [commentId]: fetchedReplies }));
        setShowReplies((prev) => ({ ...prev, [commentId]: true }));
        setRepliesLoaded((prev) => ({ ...prev, [commentId]: true }));
      } catch (err) {
        setNotification({ message: "Error fetching replies", status: "error" });
      } finally {
        setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
      }
    },
    [repliesLoaded, setNotification],
  );

  const handleReplySubmit = async (commentId) => {
    if (!replyContent[commentId]?.trim()) return;

    try {
      const savedReply = await commentService.createReply(commentId, {
        description: replyContent[commentId],
        parentComment: commentId,
        issue: issueId,
      });

      setReplies((prev) => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), savedReply],
      }));

      if (!repliesLoaded[commentId]) {
        setRepliesLoaded((prev) => ({ ...prev, [commentId]: true }));
      }

      setShowReplies((prev) => ({ ...prev, [commentId]: true }));
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
    replies,
    showReplies,
    loadingReplies,
    repliesLoaded,
    handleCommentSubmit,
    handleReplySubmit,
    handleReplyContentChange,
    toggleReplies,
    setShowReplyForm,
  };
}
