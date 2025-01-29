import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { activeUsers, loggedInAdmin } from "../services/admin";
import ScoreIcon from "@mui/icons-material/EmojiEvents";

function ActiveUsers() {
  const [activeUsersInProvince, setActiveUsersInProvince] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchActiveUsers = async () => {
    try {
      const admin = await loggedInAdmin();
      const response = await activeUsers(
        admin.assigned_province,
        admin.assigned_district,
        admin.assigned_local_gov,
        admin.assigned_ward,
      );

      setActiveUsersInProvince(response);
    } catch (error) {
      console.error("Error fetching active users:", error);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 4,
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        Most Active Users
      </Typography>

      <TableContainer
        component={Paper}
        elevation={3}
        sx={{ borderRadius: 2 }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "background.paper" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Username</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>Activity Score</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {activeUsersInProvince?.length > 0 ? (
              activeUsersInProvince.map((user) => (
                <TableRow
                  key={user._id}
                  hover
                  sx={{ "&:last-child td": { border: 0 } }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<ScoreIcon />}
                      label={user.activityScore}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                  >
                    No active users found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ActiveUsers;
