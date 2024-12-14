import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Container, Box, Grid, Paper } from "@mui/material";
import { useNavigate, Outlet } from "react-router-dom";
import { useUserDispatch, useUserValue } from "../context/UserContext";
import GlobalIssueMap from "./GlobalIssueMap";
import IssuesSuggestionsLineChart from "./IssuesSuggestionsLineChart";
import IssuesSuggestionsPieChart from "./IssuesSuggestionsPieChart";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const userDispatch = useUserDispatch();
  const userData = useUserValue();
  const navigate = useNavigate();

  const handleLogout = () => {
    userDispatch({ type: "ADMIN_LOGOUT" });
    window.location.href = "/admin-login";
  };

  const navItems = [
    { label: "Active Users", path: "/admin-dashboard/active-users", tabKey: "activeUsers" },
    { label: "Dashboard", path: "/admin-dashboard", tabKey: "dashboard" },
    { label: "Issues", path: "/admin-dashboard/issues-list", tabKey: "issues" },
    { label: "Suggestions", path: "/admin-dashboard/suggestion-list", tabKey: "suggestions" },
    {
      label: "WardOfficer Request",
      path: "/admin-dashboard/wardofficer-request",
      tabKey: "promotionRequests",
    },
  ];

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
          {navItems.map((item) => (
            <Button
              key={item.tabKey}
              color="inherit"
              onClick={() => {
                setActiveTab(item.tabKey);
                navigate(item.path);
              }}
              sx={{
                backgroundColor:
                  activeTab === item.tabKey ? "rgba(255, 255, 255, 0.1)" : "transparent",
              }}
            >
              {item.label}
            </Button>
          ))}
          <Button
            color="inherit"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      {/* <Container sx={{ mt: 4, height: "calc(100vh - 64px)" }}>
        <Outlet /> {/* This will render child routes
      </Container> */}
      <Container sx={{ mt: 4, height: "calc(100vh - 64px)" }}>
        {activeTab === "dashboard" && (
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
              // md={6}
            >
              <Paper
                elevation={3}
                sx={{ p: 2, height: "100%" }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                >
                  Global Issue Map
                </Typography>
                <GlobalIssueMap />
              </Paper>
            </Grid>
            {/* TODO: fix responsiveness */}
            <Grid
              item
              xs={12}
              md={6}
            >
              <Paper
                elevation={3}
                sx={{ p: 2, height: "100%" }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                >
                  Issues and Suggestions Over Time
                </Typography>
                <IssuesSuggestionsLineChart />
              </Paper>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
            >
              <Paper
                elevation={3}
                sx={{ p: 2, height: "100%" }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                >
                  Issues and Suggestions Overview
                </Typography>
                <IssuesSuggestionsPieChart />
              </Paper>
            </Grid>
          </Grid>
        )}
        <Outlet />
      </Container>
    </Box>
  );
}

export default AdminDashboard;
