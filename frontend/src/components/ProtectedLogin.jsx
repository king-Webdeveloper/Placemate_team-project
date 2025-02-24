import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Login from "./Login";

function ProtectedLogin() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/cookies-check", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json(); // ✅ แก้เป็น .json()
        console.log("Auth Response:", data);

        // ✅ เช็คว่ามี error หรือไม่
        if (data.error) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <Login />;
}

export default ProtectedLogin;
