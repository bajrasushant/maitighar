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
	Box,
	Chip,
	Paper,
} from "@mui/material";
import { ArrowUpward, ArrowUpwardOutlined, Comment, ArrowBack } from "@mui/icons-material";
import issueService from "../services/issues";
import commentService from "../services/comment";
import { formatDistanceToNow } from "date-fns";
import { useUserValue } from "../context/UserContext";

const Details = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [issue, setIssue] = useState(null); // Changed to null initially
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [locationName, setLocationName] = useState("");
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState("");
	const currentUser = useUserValue();

	useEffect(() => {
		const fetchIssueId = async () => {
			try {
				const fetchedIssue = await issueService.getIssueId(id);
				setIssue(fetchedIssue);
				fetchLocationName(fetchedIssue.latitude, fetchedIssue.longitude);
				const fetchedComments = await commentService.getCommentByIssue(id);
				setComments(fetchedComments);
				setLoading(false);
			} catch (err) {
				setError("Failed to fetch issue details");
				setLoading(false);
			}
		};

		fetchIssueId();
	}, [id]);

	const fetchLocationName = async (lat, lon) => {
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
			);
			const data = await response.json();
			setLocationName(data.display_name || "Location name not available");
		} catch (err) {
			console.error("Error fetching location name:", err);
			setLocationName("Unable to fetch location name");
		}
	};

	const handleUpvote = async () => {
		try {
			const updatedIssue = await issueService.upvoteIssue(id);
			setIssue(updatedIssue);
		} catch (err) {
			console.error("Failed to update upvote", err);
		}
	};

	const handleCommentSubmit = async (e) => {
		e.preventDefault();
		if (newComment.trim() === "") return; // Prevent empty comments

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

	if (!issue) {
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
							<IconButton onClick={handleUpvote}>
								{issue.upvotedBy.includes(currentUser?.id) ? (
									<ArrowUpward color="primary" />
								) : (
									<ArrowUpwardOutlined />
								)}
							</IconButton>
							<Typography align="center">{issue.upvotes}</Typography>
						</Grid>
						<Grid item xs={11}>
							<Typography variant="h5">{issue.title}</Typography>
							<Typography variant="body2" color="textSecondary">
								Posted by {issue.createdBy.username} on{" "}
								{new Date(issue.createdAt).toLocaleDateString()}
							</Typography>
							<Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
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
							<Typography
								variant="body1"
								paragraph
								style={{ marginTop: "16px" }}
							>
								{issue.description}
							</Typography>
							<Typography variant="body2" color="textSecondary">
								Department: {issue.department} | Status: {issue.status} |
								Location: {locationName}
							</Typography>
							{issue.imagePaths && issue.imagePaths.length > 0 && (
								<div style={{ marginTop: "20px" }}>
									{issue.imagePaths.map((imagePath, index) => (
										<img
											key={index}
											src={`http://localhost:3003/${imagePath}`}
											alt={`issue image ${index + 1}`}
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
								{/* <Grid item>
									<Button startIcon={<Share />}>Share</Button>
								</Grid> */}
							</Grid>
						</Grid>
					</Grid>
					<Divider style={{ margin: "20px 0" }} />
					<form onSubmit={handleCommentSubmit}>
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
					{comments.length > 0 && (
						<Box sx={{ mt: 2 }}>
							<Typography variant="h6" gutterBottom>
								Comments ({comments.length})
							</Typography>
							{comments.map((comment, index) => (
								<Paper
									key={index}
									elevation={1}
									sx={{
										p: 2,
										mb: 2,
										bgcolor: "background.default",
									}}
								>
									<Grid container spacing={2} alignItems="flex-start">
										{/*<Grid item>
											<Avatar sx={{ bgcolor: "primary.main" }}>
												{comment.createdBy.username ?? JSON.parse(localStorage.getItem("loggedUser")).username}
											</Avatar>
										</Grid>*/}
										<Grid item xs>
											<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
												{comment.createdBy.username ?? JSON.parse(localStorage.getItem("loggedUser")).username}
											</Typography>
											<Typography variant="body2" color="text.secondary" gutterBottom>
												{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
											</Typography>
											<Typography variant="body1">
												{comment.description}
											</Typography>
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
};

export default Details;
