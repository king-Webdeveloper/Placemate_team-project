import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/Pathmanagement"; // ใช้ AuthContext
import "./Navbar.css";

const Navbar = () => {
  const { isLoggedIn, setIsLoggedIn, username, setUsername } = useAuth(); // ดึงข้อมูลจาก context

  useEffect(() => {
      const checkLoginStatus = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/cookies-check", {
            method: "GET",
            credentials: "include",
          });
    
          const responseText = await response.text();
          const data = JSON.parse(responseText);
    
          if (response.ok) {
            setIsLoggedIn(true);
            setUsername(data.username);
          } else {
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error("Error checking login status:", error);
          setIsLoggedIn(false);
        }
      };
    
      checkLoginStatus();
    }, []);

  return (
    <div className="Navbarspace">
      <header className="navbar">
        <Link to="/">
          <img src="/PM1.1.png" alt="Logo" className="navbar-logo" />
        </Link>
        <nav className="navbar-center">
          <Link to="/listtogo">List to Go</Link>
          <Link to="/planer">Planner</Link>
          <Link to="/aboutus">About us</Link>
        </nav>
        {/* แสดงปุ่มตามสถานะการล็อกอิน */}
        {isLoggedIn ? (
          <Link to="/profile" className="nav-profile">{username}</Link>
        ) : (
          <Link to="/login" className="login-btn">เข้าสู่ระบบ</Link>
        )}
      </header>
    </div>
  );
};

export default Navbar;
