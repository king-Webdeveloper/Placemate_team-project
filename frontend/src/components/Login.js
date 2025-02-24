// Login.js [frontend]
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Login.css"; // Import CSS

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // จัดการ error
  const [loading, setLoading] = useState(false); // แสดงสถานะ loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/login", 
          { username, password },
          { withCredentials: true } // ต้องใช้เพื่อให้ axios ส่งคุกกี้ไปกับ request
      );
      
      // console.log("Login Successful:", response.data);
      // alert("Login Successful!");

      // Redirect ไปหน้า Dashboard หรือหน้าอื่นที่ต้องการ
      window.location.href = "/";
  } catch (err) {
      setError(err.response?.data?.error || "Login failed");
  }
};

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        <img src="/PM1.1.png" alt="Logo" className="logo" />
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p>
          Don't have an account? <a href="/register">Register</a>
        </p>
        <Link to="/" className="back-button">← Back to Homepage</Link>
      </div>
    </div>
  );
}

export default Login;
