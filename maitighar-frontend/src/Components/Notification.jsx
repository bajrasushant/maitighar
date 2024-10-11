import { Alert, IconButton, Snackbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useEffect, useState } from "react";
import { useNotification } from "../context/NotificationContext";

function CusNotification() {
  const { notification } = useNotification();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (notification.message) {
      setOpen(true);
    }
  }, [notification]);

  const handleClose = (_event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const action = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      message={notification.message}
      action={action}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        variant="filled"
        severity={notification.status}
        sx={{ width: "100%" }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
}

export default CusNotification;
