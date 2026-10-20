
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  MenuItem,
} from "@mui/material";
import API from "./api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      // Register user
      const registerResponse = await API.post("/users/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      console.log("Registration response:", registerResponse.data);

      // Login automatically after registration
      const loginResponse = await API.post("/token/", {
        username: formData.username,
        password: formData.password,
      });

      const accessToken = loginResponse.data.access;
      const refreshToken = loginResponse.data.refresh;

      // Save login details
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refresh", refreshToken);
      localStorage.setItem("role", formData.role);
      localStorage.setItem("username", formData.username);

      // Get user profile to get user ID
      const profileResponse = await API.get("/users/profile/");

      localStorage.setItem("userId", profileResponse.data.id);

      // Redirect based on role
      if (formData.role === "teacher") {
        navigate("/teacher-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.log("Registration error:", error.response?.data);

      const errorData = error.response?.data;

      if (errorData?.username) {
        setMessage(errorData.username[0]);
      } else if (errorData?.email) {
        setMessage(errorData.email[0]);
      } else if (errorData?.password) {
        setMessage(errorData.password[0]);
      } else if (errorData?.role) {
        setMessage(errorData.role[0]);
      } else if (errorData?.detail) {
        setMessage(errorData.detail);
      } else if (errorData?.error) {
        setMessage(errorData.error);
      } else {
        setMessage("Registration failed. Please try again.");
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 5 }}>
      <Paper elevation={4} sx={{ p: 4 }}>

        <Typography variant="h4" align="center" gutterBottom>
          Registration
        </Typography>

        <Typography
          variant="body2"
          align="center"
          sx={{ mb: 3 }}
        >
          Create your Student or Teacher account
        </Typography>

        <Box component="form" onSubmit={handleRegister}>

          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            select
            fullWidth
            label="Register As"
            name="role"
            value={formData.role}
            onChange={handleChange}
            margin="normal"
            required
          >
            <MenuItem value="student">
              Student
            </MenuItem>

            <MenuItem value="teacher">
              Teacher
            </MenuItem>
          </TextField>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
          >
            Register
          </Button>

          <Button
            variant="text"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => navigate("/login")}
          >
            Already have an account? Login
          </Button>

          {message && (
            <Typography
              sx={{ mt: 2 }}
              align="center"
              color="error"
            >
              {message}
            </Typography>
          )}

        </Box>
      </Paper>
    </Container>
  );
}

export default Register;

