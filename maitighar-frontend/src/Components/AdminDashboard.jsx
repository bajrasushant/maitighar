import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import IssuesList from './IssuesList';
import SuggestionsList from './SuggestionsList';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('issues');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => setActiveTab('issues')}
            sx={{ backgroundColor: activeTab === 'issues' ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}
          >
            Issues
          </Button>
          <Button 
            color="inherit" 
            onClick={() => setActiveTab('suggestions')}
            sx={{ backgroundColor: activeTab === 'suggestions' ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}
          >
            Suggestions
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        {activeTab === 'issues' ? <IssuesList /> : <SuggestionsList />}
      </Container>
    </Box>
  );
};

export default AdminDashboard;