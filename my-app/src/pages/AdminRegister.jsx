
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";


const AdminRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:5000/api/admin/register";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(API_URL, {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (!data.token) {
        setError("Registration succeeded, but no token was returned.");
        return;
      }

      // Save token for protected admin pages
      localStorage.setItem("adminToken", data.token);

      // Save admin information for the frontend
      if (data.admin) {
        localStorage.setItem(
          "admin",
          JSON.stringify(data.admin)
        );
      }

      setMessage("Admin registered successfully!");

      // Navigate to the admin dashboard
      navigate("/");
    } catch (err) {
      console.error(
        "Admin registration error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Failed to register admin. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <h2>EIASC Admin Registration</h2>
          <p>Create an administrator account</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {message && (
          <div className="auth-success">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="admin-auth-button"
            disabled={loading}
          >
            {loading
              ? "Registering..."
              : "Register Admin"}
          </button>
        </form>

        <div className="admin-auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/admin/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;