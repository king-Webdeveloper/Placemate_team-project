import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/Pathmanagement"; // ใช้ AuthContext
import "./Navbar.css";

const Navbar = () => {
  const { isLoggedIn, setIsLoggedIn, username, setUsername } = useAuth(); // ดึงข้อมูลจาก context
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    const checkGoogleConnection = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/google/check-token", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setIsGoogleConnected(data.googleConnected);
      } catch (err) {
        console.error("Error checking google token", err);
      }
    };
    checkGoogleConnection();
  }, []);
  

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
          <Link to="/planner">Planner</Link>
          <Link to="/aboutme">About us</Link>
        </nav>
        {/* แสดงปุ่มตามสถานะการล็อกอิน */}
        {isLoggedIn ? (
           <div className="nav-user-area">
            <Link to="/profile" className="nav-profile">{username}</Link>
            {!isGoogleConnected ? (
              <button
                className="google-calendar-btn"
                onClick={() => window.location.href = "http://localhost:5000/api/google/auth/google"}
              >
                🔗 เชื่อม Google Calendar
              </button>
            ) : (
              <span className="google-calendar-connected">✅ Google Calendar</span>
            )}

            {isGoogleConnected && (
              <button
                className="google-calendar-disconnect"
                onClick={async () => {
                  await fetch("http://localhost:5000/api/google/disconnect", {
                    method: "POST",
                    credentials: "include",
                  });
                  window.location.reload(); // รีเฟรชให้ state update
                }}
              >
                ⛔ ยกเลิกการเชื่อม
              </button>
            )}

          </div>
        ) : (
          <Link to="/login" className="login-btn">เข้าสู่ระบบ</Link>
        )}
      </header>
    </div>
  );
};

export default Navbar;
