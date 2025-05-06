// Register.js[frontend]
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css"; // Import CSS

function Register() {
  const [username, setUsername] = useState(""); // ✅ เปลี่ยนจาก name เป็น username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // จัดการ Error Message
  const [loading, setLoading] = useState(false); // แสดงสถานะ Loading
  const [passwordFocus, setPasswordFocus] = useState(false); // ตรวจสอบว่า focus อยู่ในช่อง password หรือไม่
  const [passwordValid, setPasswordValid] = useState(null); // ตรวจสอบว่า password valid หรือไม่ (null คือยังไม่ได้ตรวจสอบ)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // รีเซ็ต error message ก่อนที่จะทำการสมัคร

    // ตรวจสอบ username: ต้องไม่มีอักขระพิเศษ และมีความยาวมากกว่า 2 ตัว
    const usernamePattern = /^[a-zA-Z0-9]+$/; // ไม่ให้มีอักขระพิเศษ
    if (username.length <= 2 || !usernamePattern.test(username)) {
      setError("Username ต้องไม่มีอักขระพิเศษ และมีความยาวมากกว่า 2 ตัว");
      setLoading(false);
      return; // หยุดการทำงานหากไม่ผ่านเงื่อนไข
    }

    // ตรวจสอบ password: ต้องมีความยาวมากกว่า 8 ตัว และประกอบด้วยตัวอักษรและตัวเลข
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordPattern.test(password)) {
      setError("Password ต้องมีความยาวมากกว่า 8 ตัว และประกอบด้วยตัวอักษรและตัวเลข");
      setLoading(false);
      return; // หยุดการทำงานหากไม่ผ่านเงื่อนไข
    }

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
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

  // ตรวจสอบความถูกต้องของ password
  const checkPasswordValidity = (password) => {
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    setPasswordValid(passwordPattern.test(password));
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
              onChange={(e) => {
                setPassword(e.target.value);
                checkPasswordValidity(e.target.value); // เช็คความถูกต้องเมื่อมีการเปลี่ยนแปลง
              }}
              onFocus={() => setPasswordFocus(true)} // เมื่อคลิกเข้าไปในช่อง password
              onBlur={() => setPasswordFocus(false)} // เมื่อออกจากช่อง password
              required
            />
            {passwordFocus && !passwordValid && (
              <p className="password-info">
                Password ต้องมีความยาวมากกว่า 8 ตัว และประกอบด้วยตัวอักษรและตัวเลข
              </p>
            )}
            {passwordValid && password && (
              <p className="password-valid">รหัสผ่านนี้สามารถใช้งานได้</p>
            )}
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


