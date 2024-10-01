import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  // Avatar,
  Box,
  Chip,
  Paper,
} from '@mui/material';
import {
  ArrowUpward, ArrowUpwardOutlined, Comment, ArrowBack,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import issueService from '../services/issues';
import commentService from '../services/comment';
import { useUserValue } from '../context/UserContext';

function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null); // Changed to null initially
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const currentUser = useUserValue();
  const [replyContent, setReplyContent] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [replies, setReplies] = useState({});
  const [showReplies, setShowReplies] = useState({});

  useEffect(() => {
    const fetchIssueId = async () => {
      setError(null); // Clear any previous errors before trying
      try {
        const fetchedIssue = await issueService.getIssueId(id);
        setIssue(fetchedIssue);
        fetchLocationName(fetchedIssue.latitude, fetchedIssue.longitude);
        const fetchedComments = await commentService.getCommentByIssue(id);
        setComments(fetchedComments);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch issue details');
      } finally {
        setLoading(false);
      }
    };

    fetchIssueId();
  }, [id]);

  const fetchLocationName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      );
      const data = await response.json();
      setLocationName(data.display_name || 'Location name not available');
    } catch (err) {
      console.error('Error fetching location name:', err);
      setLocationName('Unable to fetch location name');
    }
  };

  const handleUpvote = async () => {
    try {
      const updatedIssue = await issueService.upvoteIssue(id);
      setIssue(updatedIssue);
    } catch (err) {
      console.error('Failed to update upvote', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return; // Prevent empty comments

    try {
      const newCommentData = {
        description: newComment,
        issue: id,
      };

      const savedComment = await commentService.createComment(newCommentData);
      setComments([...comments, savedComment]);
      setNewComment('');
    } catch (err) {
      console.error('Error creating comment:', err);
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    fetchReplies(commentId);
  };

  const toggleReplyForm = (commentId) => {
    setShowReplyForm((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
	  };

	  const handleReplySubmit = async (commentId) => {
    if (!replyContent[commentId]?.trim()) return; // Prevent empty replies

    try {
		  const replyData = {
        description: replyContent[commentId],
        parentComment: commentId,
        issue: id, // Optional, if needed for context
		  };

		  const savedReply = await commentService.createReply(commentId, replyData);

		  // Update the replies state
		  setReplies((prev) => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), savedReply],
		  }));

		  setReplyContent((prev) => ({ ...prev, [commentId]: '' })); // Reset the reply input
		  setShowReplyForm((prev) => ({ ...prev, [commentId]: false })); // Hide reply form
    } catch (err) {
		  console.error('Error submitting reply:', err);
    }
	  };

	  const fetchReplies = async (commentId) => {
    if (replies[commentId]) return;

    try {
		  const fetchedReplies = await commentService.getReplyByComment(commentId);
		  setReplies((prev) => ({ ...prev, [commentId]: fetchedReplies }));
    } catch (err) {
		  console.error('Error fetching replies:', err);
    }
	  };

  if (loading) {
    return (
      <Container
        maxWidth="md"
        style={{
				  display: 'flex',
				  justifyContent: 'center',
				  alignItems: 'center',
				  height: '100vh',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Typography color="error">{error}</Typography>
        <Button onClick={() => navigate('/')}>Go back to Home</Button>
      </Container>
    );
  }

  if (!issue) {
    return (
      <Container maxWidth="md">
        <Typography>No report found with this ID.</Typography>
        <Button onClick={() => navigate('/')}>Go back to Home</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        style={{ marginTop: '20px', marginBottom: '20px' }}
      >
        Back to Home
      </Button>
      <Card>
        <CardContent style={{ padding: '30px' }}>
          <Grid>
            <Grid item xs={11}>
              <Typography variant="h5">{issue.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                Posted by
                {' '}
                {issue.createdBy.username}
                {' '}
                on
                {' '}
                {new Date(issue.createdAt).toLocaleDateString()}
              </Typography>
              <Box sx={{
                mt: 1, display: 'flex', alignItems: 'center', gap: 1,
              }}
              >
                <Chip
                  label={issue.type}
                  color={issue.type === 'issue' ? 'error' : 'success'}
                  size="small"
                />
                <Chip
                  label={issue.department}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
              <Typography
                variant="body1"
                paragraph
                style={{ marginTop: '16px' }}
              >
                {issue.description}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {/* Department: {issue.department} <br/>    */}
                Status:
                {' '}
                {issue.status}
                {' '}
                <br />
                Location:
                {' '}
                {locationName.split(',').slice(0, 5).join(', ')}
              </Typography>
              {issue.imagePaths && issue.imagePaths.length > 0 && (
                      <div style={{ marginTop: '20px' }}>
                      {issue.imagePaths.map((mediaPath, index) => {
                        // Check if the mediaPath is an mp4 video
                        if (mediaPath.endsWith('.mp4')) {
                          return (
                            <video
                              key={index}
                              controls
                              style={{ maxWidth: '845px', marginBottom: '10px', height: '480px' }}
                            >
                              <source
                                src={`http://localhost:3003/${mediaPath}`}
                                type="video/mp4"
                              />
                              Your browser does not support the video tag.
                            </video>
                          );
                        } 
                        else if(mediaPath.endsWith('.mkv')){
                          return(
                          <video
                          key={index}
                          controls
                          style={{ maxWidth: '845px', marginBottom: '10px', height: '480px' }}
                        >
                          <source
                            src={`http://localhost:3003/${mediaPath}`}
                            type="video/x-matroska"
                          />
                          Your browser does not support the video tag.
                        </video>
                      );
                        }
                        else if(mediaPath.endsWith('.avi')){
                          return(
                          <video
                          key={index}
                          controls
                          style={{ maxWidth: '845px', marginBottom: '10px', height: '480px' }}
                        >
                          <source
                            src={`http://localhost:3003/${mediaPath}`}
                            type="video/x-msvideo"
                          />
                          Your browser does not support the video tag.
                        </video>
                      );
                        }
                        else {
                          // Else, treat it as an image
                          return (
                            <img
                              key={index}
                              src={`http://localhost:3003/${mediaPath}`}
                              alt={`media ${index + 1}`}
                              style={{ maxWidth: 'auto', marginBottom: '10px', height: '480px' }}
                            />
                          );
                        }
                      })}
                    </div>
                    )}
              <Grid
                item
                sx={{
                  mt: 1, display: 'flex', alignItems: 'center', gap: 2,
                }}
              >
                <Box display="flex" alignItems="center">
                  <IconButton onClick={() => handleUpvote(issue.id)}>
                    {issue.upvotedBy.includes(currentUser?.id) ? (
                      <ArrowUpward color="primary" />
                    ) : (
                      <ArrowUpwardOutlined />
                    )}
                  </IconButton>
                  <Typography>{issue.upvotes}</Typography>
                </Box>

                <Button startIcon={<Comment />}>
                  {comments.length}
                  {' '}
                  Comments
                </Button>
                {/* </Grid> */}
                {/* <Grid item>
									<Button startIcon={<Share />}>Share</Button>
								</Grid> */}
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{ margin: '20px 0' }} />
          <form onSubmit={handleCommentSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ marginBottom: '20px' }}
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
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Comments (
              {comments.length}
              )
            </Typography>
            {comments.map((comment, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{
									  p: 2,
									  mb: 2,
									  bgcolor: 'background.default',
                }}
              >
                <Grid container spacing={2} alignItems="flex-start">
                  {/* <Grid item>
											<Avatar sx={{ bgcolor: "primary.main" }}>
												{comment.createdBy.username ?? JSON.parse(localStorage.getItem("loggedUser")).username}
											</Avatar>
										</Grid> */}
                  <Grid item xs>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {comment.createdBy.username ?? JSON.parse(localStorage.getItem('loggedUser')).username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </Typography>
                    <Typography variant="body1">
                      {comment.description}
                    </Typography>

                    {/* Reply Button */}
                    <Button onClick={() => toggleReplyForm(comment.id)}>
                      {showReplyForm[comment.id] ? 'Cancel' : 'Reply'}
                    </Button>

                    {/* Reply Form */}
                    {showReplyForm[comment.id] && (
                    <Box component="form" sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Write a reply..."
                        value={replyContent[comment.id] || ''}
                        onChange={(e) => setReplyContent((prev) => ({
													    ...prev,
													    [comment.id]: e.target.value,
													  }))}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 1 }}
                        onClick={() => handleReplySubmit(comment.id)}
                      >
                        Submit Reply
                      </Button>
                    </Box>
                    )}

                    {/* View Replies Button */}
                    {(replies[comment.id] && replies[comment.id].length > 0) || !replies[comment.id] ? (
                      <Button
                        sx={{ mt: 2 }}
                        onClick={() => toggleReplies(comment.id)}
                      >
                        {showReplies[comment.id] ? 'Hide Replies' : 'View Replies'}
                        {' '}
                        (
                        {replies[comment.id]?.length || 'Show Replies'}
                        )
                      </Button>
                    ) : null}

                    {/* Display Replies */}
                    {replies[comment.id] && showReplies[comment.id] && (
                    <Box sx={{ mt: 2, pl: 3 }}>
                      {replies[comment.id].map((reply, replyIndex) => (
                        <Paper key={replyIndex} sx={{ p: 2, mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {reply.createdBy.username ?? JSON.parse(localStorage.getItem('loggedUser')).username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </Typography>
                          <Typography variant="subtitle2">
                            {reply.description}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                    )}

                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default Details;
