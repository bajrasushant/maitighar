import { useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  IconButton,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import IssuesList from "./IssuesList";
import SuggestionsList from "./SuggestionsList";
import GlobalIssueMap from "./GlobalIssueMap";
import { useUserDispatch } from "../context/UserContext";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const userDispatch = useUserDispatch();

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

  const handleLogout = () => {
    userDispatch({ type: "ADMIN_LOGOUT" });
    // Redirect to login page or home page
    window.location.href = "/login"; // Adjust the URL as necessary
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Admin Dashboard
          </Typography>
          <Button
            color="inherit"
            onClick={() => setActiveTab("dashboard")}
            sx={{
              backgroundColor:
                activeTab === "dashboard" ? "rgba(255, 255, 255, 0.1)" : "transparent",
            }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            onClick={() => setActiveTab("issues")}
            sx={{
              backgroundColor: activeTab === "issues" ? "rgba(255, 255, 255, 0.1)" : "transparent",
            }}
          >
            Issues
          </Button>
          <Button
            color="inherit"
            onClick={() => setActiveTab("suggestions")}
            sx={{
              backgroundColor:
                activeTab === "suggestions" ? "rgba(255, 255, 255, 0.1)" : "transparent",
            }}
          >
            Suggestions
          </Button>
          {/* <IconButton size="large" color="inherit" onClick={handleLogout}>
						<AccountCircle />
					</IconButton> */}
          <Button
            color="inherit"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4, height: "calc(100vh - 64px)" }}>
        <Grid
          container
          spacing={2}
          style={{ height: "100%" }}
        >
          <Grid
            item
            xs={12}
            style={{ height: "100%" }}
          >
            {renderContent()}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default AdminDashboard;
