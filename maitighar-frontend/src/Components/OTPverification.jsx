import React, { useState, useEffect } from "react";
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


const defaultTheme = createTheme();

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // Get the email from the previous page's state
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(120); // 4 minutes in seconds
  const [canResend, setCanResend] = useState(false);//Track if the resend button can be shown
  const [isLoading, setIsLoading] = useState(false); // Loading state for resend OTP

  

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(countdown);
          setCanResend(true); //Enable the resend button
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdown);
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
    console.log("Email:", email);
    event.preventDefault();
    const otpString = otp.join(""); // Join the array into a string
    console.log("OTP:", otpString);

    // Call the OTP verification API
    try {
      await verifyOtp({ email, otp: otpString });
      navigate("/login"); // Redirect to login on success
    } catch (error) {
      console.error("OTP verification failed", error);
      alert("OTP verification failed. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email }); // Call the resend OTP API
      alert("OTP has been resent to your email.");
      setTimer(120); // Reset the timer to 2 minutes
      setCanResend(false); // Hide the resend button again
    }catch (error) {
      console.error("Failed to resend OTP", error);
      alert("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }} />
          <Typography component="h1" variant="h5">
            Enter OTP
          </Typography>
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Verify OTP
            </Button>
          </Box>
          {canResend && (
            <Button
            variant="outlined"
            onClick={handleResendOtp}
            sx={{ mt: 2 }}
            >
              Resend OTP
            </Button>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}
