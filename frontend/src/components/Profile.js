import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ใช้ useNavigate สำหรับการเปลี่ยนเส้นทาง

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ใช้ useNavigate เพื่อเปลี่ยนเส้นทาง

  // ดึงข้อมูลโปรไฟล์ของผู้ใช้จาก /api/cookies-check
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/cookies-check", {
          method: "GET",
          credentials: "include", // สำคัญ: ให้ส่งคุกกี้ไปด้วย
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ฟังก์ชันสำหรับการออกจากระบบ
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include", // สำคัญ: ให้ส่งคุกกี้ไปด้วย
      });

      if (response.ok) {
        console.log("Logout successful");
        navigate("/login"); // เปลี่ยนเส้นทางไปยังหน้า Login
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Error: Unable to load profile.</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center" }}>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {user.username}</p>
      
      <button onClick={handleLogout} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
}

export default Profile;