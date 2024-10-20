import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { verifyOtp, resendOtp } from "../services/user"; // Import the service to verify OTP
import { useNotification } from "../context/NotificationContext";

const defaultTheme = createTheme();

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setNotification } = useNotification();
  const email = location.state?.email; // Get the email from the previous page's state
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false); // Track if the resend button can be shown
  const endTimeRef = useRef(Date.now() + timer * 1000); // Use useRef to track end time
  
  useEffect(() => {
    const countdown = setInterval(() => {
      const timeLeft = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000)); // Calculate remaining time
  
      setTimer(timeLeft); // Update the timer state
  
      if (timeLeft === 0) {
        clearInterval(countdown);
        setCanResend(true); // Enable the resend button when time runs out
      }
    }, 1000);
  
    return () => clearInterval(countdown); // Clean up the interval when the component unmounts
  }, [timer]);

  const handleChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;

    // Move focus to the next input if current input is filled
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }

    // Update the OTP state
    setOtp(newOtp);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const otpString = otp.join(""); // Join the array into a string

    // Call the OTP verification API
    try {
      await verifyOtp({ email, otp: otpString });
      setNotification({ message: "Email verified", status: "success" });
      navigate("/login"); // Redirect to login on success
    } catch (error) {
      console.error("OTP verification failed", error);
      setNotification({ message: "OTP verification failed. Please try again.", status: "error" });
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email }); // Call the resend OTP API
      setNotification({ message: "OTP has been resent to your email.", status: "success" });

      // Reset timer and endTime after resending OTP
      setTimer(120);
      setCanResend(false); // Hide the resend button again
      endTimeRef.current = Date.now() + 120 * 1000; // Reset the end time
    } catch (error) {
      setNotification({ message: "Failed to resend OTP. Please try again.", status: "error" });
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }} />
          <Typography component="h1" variant="h5">Enter OTP</Typography>
          <Typography variant="body2" color="text.secondary">
            Time left: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2} justifyContent="center">
              {[0, 1, 2, 3].map((index) => (
                <Grid item key={index}>
                  <TextField
                    id={`otp-${index}`}
                    type="text"
                    inputProps={{ maxLength: 1 }}
                    required
                    onChange={(e) => handleChange(index, e.target.value)}
                    sx={{ width: "40px", textAlign: "center" }}
                  />
                </Grid>
              ))}
            </Grid>
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Verify OTP</Button>
          </Box>
          {canResend && (
            <Button variant="outlined" onClick={handleResendOtp} sx={{ mt: 2 }}>
              Resend OTP
            </Button>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}
