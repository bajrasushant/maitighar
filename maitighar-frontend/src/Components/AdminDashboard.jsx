import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Container, Box, Grid, Paper } from "@mui/material";
import { useNavigate, Outlet } from "react-router-dom";
import { useUserDispatch, useUserValue } from "../context/UserContext";
import GlobalIssueMap from "./GlobalIssueMap";
import IssuesSuggestionsLineChart from "./IssuesSuggestionsLineChart";
import IssuesSuggestionsPieChart from "./IssuesSuggestionsPieChart";
import SentimentGauge from "./SentimentGaugeChart";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const userDispatch = useUserDispatch();
  const user = useUserValue();
  const navigate = useNavigate();

  const handleLogout = () => {
    userDispatch({ type: "ADMIN_LOGOUT" });
    window.location.href = "/admin-login";
  };

  const navItems = [
    {
      label: "Active Users",
      path: "/admin-dashboard/active-users",
      tabKey: "activeUsers",
      notVisible: "department",
    },
    { label: "Dashboard", path: "/admin-dashboard", tabKey: "dashboard", notVisible: null },
    { label: "Issues", path: "/admin-dashboard/issues-list", tabKey: "issues", notVisible: null },
    {
      label: "Suggestions",
      path: "/admin-dashboard/suggestion-list",
      tabKey: "suggestions",
      notVisible: null,
    },
    {
      label: "WardOfficer Request",
      path: "/admin-dashboard/wardofficer-request",
      tabKey: "promotionRequests",
      notVisible: "department",
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (user?.responsible === "department" && item.notVisible === "department") {
      return false;
    }
    return true;
  });
  console.log(filteredNavItems);

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
          {filteredNavItems.map((item) => (
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
      <Container
        maxWidth="xl"
        sx={{ mt: 4, mb: 4 }}
      >
        {activeTab === "dashboard" && (
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: 400,
                  borderRadius: 2,
                  // overflow: "hidden",
                  justifyContent: "center",
                  display: "flex",
                  flexDirection: "column",
                }}
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
            <Grid
              item
              xs={12}
              md={4}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: 400,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                >
                  Issues and Suggestions Over Time
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IssuesSuggestionsLineChart />
                </Box>
              </Paper>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: 400,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                >
                  Issues and Suggestions Overview
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IssuesSuggestionsPieChart />
                </Box>
              </Paper>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: 400,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                >
                  Sentiment Analysis Overview
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SentimentGauge />
                </Box>
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
