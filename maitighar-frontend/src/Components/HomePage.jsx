import { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  // TextField,
  Grid,
  // List,
  // ListItem,
  // ListItemText,
  Dialog,
  // DialogTitle,
  DialogContent,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  // Badge,
  Chip,
  Box,
} from '@mui/material';
import {
  ArrowUpward,
  Comment,
  Add,
  // Notifications,
  AccountCircle,
  ArrowUpwardOutlined,
} from '@mui/icons-material';
import FoundationIcon from '@mui/icons-material/Foundation';
import { useNavigate } from 'react-router-dom';
import ReportForm from './IssueForm';
// import SuggestionForm from "./SuggestionForm";
import { useUserDispatch } from '../context/UserContext';
import issueService from '../services/issues';
import { useUserValue } from '../context/UserContext';

function HomePage() {
  const currentUser = useUserValue();
  // const [reports, setReports] = useState([
  // 	{
  // 		id: 1,
  // 		title: "Pothole on Main Street",
  // 		description: "Large pothole causing traffic issues",
  // 		upvotes: 5,
  // 		comments: [],
  // 	},
  // 	{
  // 		id: 2,
  // 		title: "Broken Streetlight",
  // 		description: "Streetlight out at corner of Elm and Oak",
  // 		upvotes: 3,
  // 		comments: [],
  // 	},
  // ]);

  const userDispatch = useUserDispatch();

  const [openForm, setOpenForm] = useState(false);
  // const [openReportForm, setOpenReportForm] = useState(false);
  // const [openSuggestionForm, setOpenSuggestionForm] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  // const [anchorElCreate, setAnchorElCreate] = useState(null);
  // const [anchorElNotifications, setAnchorElNotifications] = useState(null);

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
        setError('Failed to fetch issues');
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const handleUpvote = async (id) => {
    try {
      const updatedIssue = await issueService.upvoteIssue(id);
      setIssues(
        issues.map((issue) => (issue.id === id ? updatedIssue : issue)),
      );
    } catch (err) {
      console.error('Failed to update upvote', err);
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
      userDispatch({ type: 'LOGOUT' });
      navigate('/login');
    } catch (err) {
      console.error('Error', err.message);
    }
  };

  // const handleOpenNotifications = (event) => {
  // 	setAnchorElNotifications(event.currentTarget);
  // };

  // const handleCloseNotifications = () => {
  // 	setAnchorElNotifications(null);
  // };

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  // const handleCreateIssue = () => {
  // 	setOpenReportForm(true);
  // 	handleCloseCreateMenu();
  // };

  // const handleCreateSuggestion = () => {
  // 	setOpenSuggestionForm(true);
  // 	handleCloseCreateMenu();
  // };

  const handleCardClick = (id) => {
    navigate(`/details/${id}`);
  };

  const addIssue = async (issueObject) => {
    try {
      await issueService.createIssue(issueObject);
      const updatedIssues = await issueService.getAll();
      console.log('updatedIssues:', updatedIssues);
      setIssues(updatedIssues);
      setOpenForm(false);
    } catch (err) {
      console.error('Err:', err.message);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center">
              <FoundationIcon />
              Maitighar
            </Box>
          </Typography>
          <Button color="inherit" startIcon={<Add />} onClick={handleOpenForm}>
            Create
          </Button>
          {/* <IconButton
						size="large"
						color="inherit"
						onClick={handleOpenNotifications}
					>
						<Badge badgeContent={4} color="error">
							<Notifications />
						</Badge>
					</IconButton> */}
          <IconButton size="large" color="inherit" onClick={handleOpenUserMenu}>
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          issues.map((issue) => (
            <Card
              key={issue.id}
              style={{ marginBottom: '20px' }}
            >
              <CardContent style={{ padding: '16px' }}>
                <Grid container alignItems="center" spacing={2}>

                  <Grid item xs>
                    <Box onClick={() => handleCardClick(issue.id)}>
                      <Typography variant="h6">{issue.title}</Typography>
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
                        sx={{
                          mt: 2,
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 3,
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {issue.description}
                      </Typography>

                    </Box>
                    {issue.imagePaths && issue.imagePaths.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      {issue.imagePaths.map((imagePath, index) => (
                        <img
                          key={index}
                          src={`http://localhost:3003/${imagePath}`}
                          alt={`issue image ${index + 1}`}
                          style={{ maxWidth: '100%', marginBottom: '10px' }}
                        />
                      ))}
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
                      <Button
                        startIcon={<Comment />}
                        onClick={() => handleCardClick(issue.id)}
                      >
                        Comments (
                        {issue.comments ? issue.comments.length : 0}
                        )
                      </Button>
                    </Grid>

                  </Grid>
                </Grid>
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
        {/* <MenuItem onClick={handleCloseUserMenu}>My Reports</MenuItem> */}
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

      {/* Notifications Menu */}
      {/* <Menu
				anchorEl={anchorElNotifications}
				open={Boolean(anchorElNotifications)}
				onClose={handleCloseNotifications}
			>
				<MenuItem onClick={handleCloseNotifications}>Notification 1</MenuItem>
				<MenuItem onClick={handleCloseNotifications}>Notification 2</MenuItem>
				<MenuItem onClick={handleCloseNotifications}>Notification 3</MenuItem>
				<MenuItem onClick={handleCloseNotifications}>Notification 4</MenuItem>
			</Menu> */}

      {/* Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogContent>
          <ReportForm createIssue={addIssue} />
        </DialogContent>
      </Dialog>

      {/* Report Form Dialog
			<Dialog open={openReportForm} onClose={() => setOpenReportForm(false)}>
				<DialogContent>
					<ReportForm createIssue={addIssue} />
				</DialogContent>
			</Dialog>

			Suggestion Form Dialog
			<Dialog
				open={openSuggestionForm}
				onClose={() => setOpenSuggestionForm(false)}
			>
				<DialogContent>
					<SuggestionForm />
				</DialogContent>
			</Dialog> */}
    </>
  );
}

export default HomePage;
