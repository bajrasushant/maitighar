import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { activeUsers, loggedInAdmin } from "../services/admin";

function ActiveUsers() {
  const [activeUsersInProvince, setActiveUsersInProvince] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchActiveUsers = async () => {
    try {
      const admin = loggedInAdmin();
      const response = activeUsers(admin.assigned_province);
      setActiveUsersInProvince(response.data);
    } catch (error) {
      console.error("Error fetching active users:", error);
    }
  };

  // const handlePromote = async () => {
  //   if (!selectedUser) return;
  //   try {
  //     const response = await axios.post("/api/admin/promote-active-user", {
  //       userId: selectedUser.id,
  //       assigned_province: "someProvinceId",
  //       assigned_district: "someDistrictId",
  //       assigned_local_gov: "someLocalGovId",
  //       assigned_ward: 1,
  //     });
  //     alert(response.data.message);
  //     setOpen(false);
  //     fetchActiveUsers();
  //   } catch (error) {
  //     console.error("Error promoting user:", error);
  //   }
  // };

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{ mb: 2 }}
      >
        Most Active Users
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Activity Score</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeUsersInProvince.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.activityScore}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setSelectedUser(user);
                      setOpen(true);
                    }}
                  >
                    Promote to Ward Officer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
      >
        <DialogTitle>
          Promote {selectedUser ? selectedUser.username : ""} to Ward Officer?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          {/* <Button */}
          {/*   variant="contained" */}
          {/*   color="primary" */}
          {/*   onClick={handlePromote} */}
          {/* > */}
          {/*   Promote */}
          {/* </Button> */}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ActiveUsers;
