import React from "react";
import { Link } from "react-router-dom"; // ใช้สำหรับเปลี่ยนหน้า
import "./Homepage.css"; // Import CSS

function Homepage() {
    return (
    <div className="homepage">
      {/* ✅ ส่วนของ Header */}
      <header>
        <img src="/logo.png" alt="Logo" className="logo" />
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      {/* ✅ ส่วนของ Hero Section */}
      <section className="hero">
        <h1>Welcome to My Website</h1>
        <p>Your one-stop solution for everything.</p>
        <Link to="/register" className="btn">Get Started</Link>
      </section>

      {/* ✅ ส่วนของ Feature Section */}
      <section className="features">
        <h2>Our Features</h2>
        <div className="feature-list">
          <div className="feature">
            <h3>Secure Login</h3>
            <p>Fast and secure authentication using JWT.</p>
          </div>
          <div className="feature">
            <h3>User Dashboard</h3>
            <p>Manage your profile and settings easily.</p>
          </div>
          <div className="feature">
            <h3>Fast Performance</h3>
            <p>Optimized for speed and performance.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
