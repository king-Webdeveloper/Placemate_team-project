import React, { useState } from "react";
import "./Register.css"; // Import CSS
import { Link } from "react-router-dom"; 

function Register() {
  const [username, setUsername] = useState(""); // ✅ เปลี่ยนจาก name เป็น username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // จัดการ Error Message
  const [loading, setLoading] = useState(false); // แสดงสถานะ Loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }), // ✅ เปลี่ยน name เป็น username
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        window.location.href = "/login"; // Redirect ไป Login
      } else {
        setError(data.error || "Registration failed!");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="register-container">
        <h2>Register</h2>
        <img src="/PM1.1.png" alt="Logo" className="logo" />
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // ✅ ใช้ setUsername
              required
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
        <Link to="/" className="back-button">← Back to Homepage</Link>
      </div>
    </div>
  );
}

export default Register;
