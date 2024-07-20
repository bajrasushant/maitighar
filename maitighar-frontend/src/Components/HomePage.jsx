import { useEffect, useState } from "react";
import {
	Container,
	Card,
	CardContent,
	Typography,
	Button,
	IconButton,
	TextField,
	Grid,
	List,
	ListItem,
	ListItemText,
	Dialog,
	// DialogTitle,
	DialogContent,
	AppBar,
	Toolbar,
	Menu,
	MenuItem,
	Badge,
} from "@mui/material";
import {
	ArrowUpward,
	Comment,
	Add,
	Notifications,
	AccountCircle,
	ArrowUpwardOutlined,
} from "@mui/icons-material";
import ReportForm from "./IssueForm";
import SuggestionForm from "./SuggestionForm";
import { useUserDispatch } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import issueService from "../services/issues";
import {useUserValue} from "../context/UserContext";

const HomePage = () => {
	const currentUser = useUserValue();
	const [reports, setReports] = useState([
		{
			id: 1,
			title: "Pothole on Main Street",
			description: "Large pothole causing traffic issues",
			upvotes: 5,
			comments: [],
		},
		{
			id: 2,
			title: "Broken Streetlight",
			description: "Streetlight out at corner of Elm and Oak",
			upvotes: 3,
			comments: [],
		},
	]);

	const userDispatch = useUserDispatch();

	const [openComments, setOpenComments] = useState({});
	const [newComments, setNewComments] = useState({});
	const [openReportForm, setOpenReportForm] = useState(false);
	const [openSuggestionForm, setOpenSuggestionForm] = useState(false);
	const [anchorElUser, setAnchorElUser] = useState(null);
	const [anchorElCreate, setAnchorElCreate] = useState(null);
	const [anchorElNotifications, setAnchorElNotifications] = useState(null);

	const [issues, setIssues] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchIssues = async () => {
			try {
				const fetchedIssues = await issueService.getAll();
				console.log(fetchedIssues);
				setIssues(fetchedIssues);
				setLoading(false);
			} catch (err) {
				setError("Failed to fetch issues");
				setLoading(false);
			}
		};

		fetchIssues();
	}, []);

	const handleUpvote = (id) => {
		setReports(
			reports.map((report) =>
				report.id === id ? { ...report, upvotes: report.upvotes + 1 } : report,
			),
		);
	};

	const toggleComments = (id) => {
		setOpenComments((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	const handleCommentChange = (id, value) => {
		setNewComments((prev) => ({ ...prev, [id]: value }));
	};

	const submitComment = (id) => {
		if (newComments[id]) {
			setReports(
				reports.map((report) =>
					report.id === id
						? { ...report, comments: [...report.comments, newComments[id]] }
						: report,
				),
			);
			setNewComments((prev) => ({ ...prev, [id]: "" }));
		}
	};

	const handleOpenUserMenu = (event) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const navigate = useNavigate();

	const handleLogout = () => {
		try {
			userDispatch({ type: "LOGOUT" });
			navigate("/login");
		} catch (err) {
			console.error("Error", err.message);
		}
	};

	const handleOpenNotifications = (event) => {
		setAnchorElNotifications(event.currentTarget);
	};

	const handleCloseNotifications = () => {
		setAnchorElNotifications(null);
	};

	const handleOpenCreateMenu = (event) => {
		setAnchorElCreate(event.currentTarget);
	};

	const handleCloseCreateMenu = () => {
		setAnchorElCreate(null);
	};

	const handleCreateIssue = () => {
		setOpenReportForm(true);
		handleCloseCreateMenu();
	};

	const handleCreateSuggestion = () => {
		setOpenSuggestionForm(true);
		handleCloseCreateMenu();
	};

	const handleCardClick = (id) => {
		navigate(`/details/${id}`);
	  };

	const addIssue = async (issueObject) => {
		try {
			await issueService.createIssue(issueObject);
			issueService.getAll().then((issues) => setIssues(issues));
		} catch (err) {
			console.error("Err:", err.message);
		}
	};

	return (
		<>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						Maitighar
					</Typography>
					<Button
						color="inherit"
						startIcon={<Add />}
						onClick={handleOpenCreateMenu}
					>
						Create
					</Button>
					<IconButton
						size="large"
						color="inherit"
						onClick={handleOpenNotifications}
					>
						<Badge badgeContent={4} color="error">
							<Notifications />
						</Badge>
					</IconButton>
					<IconButton size="large" color="inherit" onClick={handleOpenUserMenu}>
						<AccountCircle />
					</IconButton>
				</Toolbar>
			</AppBar>

			<Container sx={{ mt: 4 }}>
				{/*
        {reports.map((report) => (
          <Card key={report.id} style={{ marginBottom: "20px" }}>
            <CardContent>
              <Grid container alignItems="center">
                <Grid item>
                  <IconButton onClick={() => handleUpvote(report.id)}>
                    <ArrowUpward />
                  </IconButton>
                  <Typography>{report.upvotes}</Typography>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6">{report.title}</Typography>
                  <Typography variant="body2">{report.description}</Typography>
                  <Button
                    startIcon={<Comment />}
                    onClick={() => toggleComments(report.id)}
                  >
                    Comments ({report.comments.length})
                  </Button>
                </Grid>
              </Grid>
              {openComments[report.id] && (
                <div>
                  <List>
                    {report.comments.map((comment, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={comment} />
                      </ListItem>
                    ))}
                  </List>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Add a comment"
                    value={newComments[report.id] || ""}
                    onChange={(e) =>
                      handleCommentChange(report.id, e.target.value)
                    }
                  />
                  <Button onClick={() => submitComment(report.id)}>
                    Submit Comment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
				*/}

				{loading ? (
					<Typography>Loading...</Typography>
				) : error ? (
					<Typography color="error">{error}</Typography>
				) : (
					issues.map((issue) => (
						<Card 
              key={issue.id} 
              style={{ marginBottom: "20px" }}
            >
							<CardContent>
								<Grid container alignItems="center">
									<Grid item>
										<IconButton onClick={() => handleUpvote(issue.id)}>
                      {issue.upvotedBy.includes(currentUser?.id) ? (
                        <ArrowUpward color="primary" />
                      ) : (
                        <ArrowUpwardOutlined/>
                      )}
                    </IconButton>
										<Typography>{issue.upvotes}</Typography>
									</Grid>
									<Grid item xs>
                    <Grid onClick={() => handleCardClick(issue.id)}>
                    <Typography variant="h6">{issue.title}</Typography>
										<Typography variant="body2">{issue.description}</Typography>
                    </Grid>
										<Button
											startIcon={<Comment />}
											onClick={() => toggleComments(issue.id)}
										>
											Comments ({issue.comments ? issue.comments.length : 0})
										</Button>
									</Grid>
								</Grid>
								{/* ... comments section */}
							</CardContent>
						</Card>
					))
				)}
			</Container>

			{/* User Menu */}
			<Menu
				anchorEl={anchorElUser}
				open={Boolean(anchorElUser)}
				onClose={handleCloseUserMenu}
			>
				<MenuItem onClick={handleCloseUserMenu}>Profile</MenuItem>
				<MenuItem onClick={handleCloseUserMenu}>My Reports</MenuItem>
				<MenuItem onClick={handleLogout}>Logout</MenuItem>
			</Menu>

			{/* Notifications Menu */}
			<Menu
				anchorEl={anchorElNotifications}
				open={Boolean(anchorElNotifications)}
				onClose={handleCloseNotifications}
			>
				<MenuItem onClick={handleCloseNotifications}>Notification 1</MenuItem>
				<MenuItem onClick={handleCloseNotifications}>Notification 2</MenuItem>
				<MenuItem onClick={handleCloseNotifications}>Notification 3</MenuItem>
				<MenuItem onClick={handleCloseNotifications}>Notification 4</MenuItem>
			</Menu>

			{/* Create Menu */}
			<Menu
				anchorEl={anchorElCreate}
				open={Boolean(anchorElCreate)}
				onClose={handleCloseCreateMenu}
			>
				<MenuItem onClick={handleCreateIssue}>Report an Issue</MenuItem>
				<MenuItem onClick={handleCreateSuggestion}>Make a Suggestion</MenuItem>
			</Menu>

			{/* Report Form Dialog */}
			<Dialog open={openReportForm} onClose={() => setOpenReportForm(false)}>
				{/* <DialogTitle>Create New Report</DialogTitle> */}
				<DialogContent>
					<ReportForm createIssue={addIssue} />
				</DialogContent>
			</Dialog>

			{/* Suggestion Form Dialog */}
			<Dialog
				open={openSuggestionForm}
				onClose={() => setOpenSuggestionForm(false)}
			>
				{/* <DialogTitle>Make a Suggestion</DialogTitle> */}
				<DialogContent>
					<SuggestionForm />
				</DialogContent>
			</Dialog>
		</>
	);
};

export default HomePage;
