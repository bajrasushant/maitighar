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
              {/* <TableCell>Actions</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {activeUsersInProvince && activeUsersInProvince.length > 0 ? (
              activeUsersInProvince?.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.activityScore}</TableCell>
                  {/* <TableCell> */}
                  {/*   <Button */}
                  {/*     variant="contained" */}
                  {/*     color="primary" */}
                  {/*     onClick={() => { */}
                  {/*       setSelectedUser(user); */}
                  {/*       setOpen(true); */}
                  {/*     }} */}
                  {/*   > */}
                  {/*     Promote to Ward Officer */}
                  {/*   </Button> */}
                  {/* </TableCell> */}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                >
                  No active users found
                </TableCell>
              </TableRow>
            )}
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
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ActiveUsers;
