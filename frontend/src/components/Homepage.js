import React from "react";
import { Link } from "react-router-dom";
import "./Homepage.css";

function Homepage() {
  return (
    <div className="homepage">
      <header>
        <img src="/PM1.png" alt="Logo" className="logo" />
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <section className="hero">
        <h1>Welcome to My Website</h1>
        <p>Your one-stop solution for everything.</p>
        <Link to="/register" className="btn">Get Started</Link>
      </section>
    </div>
  );
}

export default Homepage;
