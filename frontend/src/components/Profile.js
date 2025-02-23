import React, { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // ดึง JWT Token จาก localStorage
        const response = await fetch(`${process.env.REACT_APP_API_URL}:5000/api/profile`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // ส่ง Token ไปใน Authorization Header
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Error: Unable to load profile.</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center" }}>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  );
}

export default Profile;

// import React from "react";
// import { useNavigate } from "react-router-dom";

// const Profile = () => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem("token"); // ลบ token ออกจาก localStorage
//     navigate("/login"); // ส่งไปยังหน้า Login
//   };

//   return (
//     <div className="profile-container">
//       <h1>Profile Page</h1>
//       <button onClick={handleLogout} className="text-red-500">ออกจากระบบ</button>
//     </div>
//   );
// };

// export default Profile;
