// import { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import {
//   Container,
//   Typography,
//   Card,
//   CardContent,
//   Grid,
//   Button,
//   CircularProgress,
// } from '@mui/material';
// import { ArrowBack } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import LocationPicker from './LocationPicker';
// import issueService from "../services/issues";

// const Details = () => {
//   const { id } = useParams();
//   console.log(id);
//   const navigate = useNavigate();
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [locationName, setLocationName] = useState('');

//   useEffect(() => {
// 		const fetchIssueId = async () => {
// 			try {
// 				const fetchedIssues = await issueService.getIssueId(id);
// 				console.log(fetchedIssues);
// 				setIssues(fetchedIssues);
//         fetchLocationName(fetchedIssues.latitude, fetchedIssues.longitude);
// 				setLoading(false);
// 			} catch (err) {
// 				setError("Failed to fetch issues");
// 				setLoading(false);
// 			}
// 		};

// 		fetchIssueId();
// 	}, [id]);

//   const fetchLocationName = async (lat, lon) => {
//     try {
//       const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
//       const data = await response.json();
//       setLocationName(data.display_name || 'Location name not available');
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching location name:', err);
//       setLocationName('Unable to fetch location name');
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <Container maxWidth="md" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container maxWidth="md">
//         <Typography color="error">{error}</Typography>
//         <Button onClick={() => navigate('/')}>Go back to Home</Button>
//       </Container>
//     );
//   }
//   // For now, we'll use dummy data
//   // const report = {
//   //   id: id,
//   //   title: 'Sample Report',
//   //   description: 'This is a sample report description.',
//   //   department: 'roads',
//   //   status: 'open',
//   //   upvotes: 5,
//   //   createdAt: new Date().toLocaleDateString(),
//   //   latitude: 51.505,
//   //   longitude: -0.09,
//   //   images: ['https://via.placeholder.com/150'],
//   //   comments: ['Great report!', 'This needs to be fixed ASAP'],
//   // };

//   return (
//     <Container maxWidth="md">
//       <Button
//         startIcon={<ArrowBack />}
//         onClick={() => navigate('/')}
//         style={{ marginTop: '20px', marginBottom: '20px' }}
//       >
//         Back to Home
//       </Button>
//       <Card>
//         <CardContent>
//           <Typography variant="h4" gutterBottom>{issues.title}</Typography>
//           <Typography variant="body1" paragraph>{issues.description}</Typography>
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6}>
//               <Typography variant="subtitle1">Department: {issues.department}</Typography>
//               <Typography variant="subtitle1">Status: {issues.status}</Typography>
//               <Typography variant="subtitle1">Upvotes: {issues.upvotes}</Typography>
//               <Typography variant="subtitle1">Created: {issues.createdAt}</Typography>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <Typography variant="subtitle1">Location: {locationName}</Typography>
//             </Grid>
//           </Grid>
//           {/* {issues.images.length > 0 && (
//             <div style={{ marginTop: '20px' }}>
//               <Typography variant="h6" gutterBottom>Images:</Typography>
//               {issues.images.map((img, index) => (
//                 <img key={index} src={img} alt={`issues image ${index + 1}`} style={{ maxWidth: '100%', marginBottom: '10px' }} />
//               ))}
//             </div>
//           )} */}
//           {issues.length > 0 && (
//             <div style={{ marginTop: '20px' }}>
//               <Typography variant="h6" gutterBottom>Comments:</Typography>
//               {issues[0].comments.map((comment, index) => (
//                 <Typography key={index} variant="body2" paragraph>{comment}</Typography>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </Container>
//   );
// };

// export default Details;

import { useState, useEffect } from "react";
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
  Avatar,
} from "@mui/material";
import { ArrowUpward, Comment, Share, ArrowBack } from "@mui/icons-material";
import issueService from "../services/issues";
import commentService from "../services/comment";

const Details = () => {
  const { id } = useParams();
  console.log(id);
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchIssueId = async () => {
      try {
        const fetchedIssues = await issueService.getIssueId(id);
        console.log(fetchedIssues);
        setIssues(fetchedIssues);
        fetchLocationName(fetchedIssues.latitude, fetchedIssues.longitude);
        const fetchedComments = await commentService.getCommentByIssue(id);
        setComments(fetchedComments);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch issues");
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
      setLocationName(data.display_name || "Location name not available");
      setLoading(false);
    } catch (err) {
      console.error("Error fetching location name:", err);
      setLocationName("Unable to fetch location name");
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const newCommentData = {
        description: newComment,
        issue: id,
      };

      const savedComment = await commentService.createComment(newCommentData);
      setComments([...comments, savedComment]);
      setNewComment("");
    } catch (err) {
      console.error("Error creating comment:", err);
    }
  };

  if (loading) {
    return (
      <Container
        maxWidth="md"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
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
        <Button onClick={() => navigate("/")}>Go back to Home</Button>
      </Container>
    );
  }

  if (!issues) {
    return (
      <Container maxWidth="md">
        <Typography>No report found with this ID.</Typography>
        <Button onClick={() => navigate("/")}>Go back to Home</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/")}
        style={{ marginTop: "20px", marginBottom: "20px" }}
      >
        Back to Home
      </Button>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={1}>
              <IconButton>
                <ArrowUpward />
              </IconButton>
              <Typography align="center">{issues.upvotes}</Typography>
            </Grid>
            <Grid item xs={11}>
              <Typography variant="h5">{issues.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                Posted by {issues.createdBy} on{" "}
                {new Date(issues.createdAt).toLocaleDateString()}
              </Typography>
              <Typography
                variant="body1"
                paragraph
                style={{ marginTop: "16px" }}
              >
                {issues.description}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Department: {issues.department} | Status: {issues.status} |
                Location: {locationName}
              </Typography>
              {issues.images && issues.images.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  {issues.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`issues image ${index + 1}`}
                      style={{ maxWidth: "100%", marginBottom: "10px" }}
                    />
                  ))}
                </div>
              )}
              <Grid container spacing={2} style={{ marginTop: "16px" }}>
                <Grid item>
                  <Button startIcon={<Comment />}>
                    {comments.length} Comments
                  </Button>
                </Grid>
                <Grid item>
                  <Button startIcon={<Share />}>Share</Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider style={{ margin: "20px 0" }} />
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
            onClick={handleCommentSubmit}
          >
            Submit
          </Button>
          {comments.length > 0 && (
            <div>
              {comments.map((comment, index) => (
                <Grid
                  container
                  spacing={2}
                  key={index}
                  style={{ marginBottom: "16px" }}
                >
                  {/*
									<Grid item>
										<Avatar>{comment.createdBy}</Avatar>
									</Grid>
											*/}
                  <Grid item xs>
                    <Typography variant="subtitle2">
                      {comment.createdBy}
                    </Typography>
                    <Typography variant="body2">
                      {comment.description}
                    </Typography>
                  </Grid>
                </Grid>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Details;
