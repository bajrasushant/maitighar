import { useState } from "react";
import "leaflet/dist/leaflet.css"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
} from "@mui/material";
import IssuesList from "./IssuesList";
import SuggestionsList from "./SuggestionsList";
import GlobalIssueMap from "./GlobalIssueMap";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <GlobalIssueMap />;
      case "issues":
        return <IssuesList />;
      case "suggestions":
        return <SuggestionsList />;
      default:
        return <GlobalIssueMap />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button
            color="inherit"
            onClick={() => setActiveTab("dashboard")}
            sx={{
              backgroundColor:
                activeTab === "dashboard"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",
            }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            onClick={() => setActiveTab("issues")}
            sx={{
              backgroundColor:
                activeTab === "issues"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",
            }}
          >
            Issues
          </Button>
          <Button
            color="inherit"
            onClick={() => setActiveTab("suggestions")}
            sx={{
              backgroundColor:
                activeTab === "suggestions"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",
            }}
          >
            Suggestions
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4, height: 'calc(100vh - 64px)' }}>
        <Grid container spacing={2} style={{ height: '100%' }}>
          <Grid item xs={12} style={{ height: '100%' }}>
            {renderContent()}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
