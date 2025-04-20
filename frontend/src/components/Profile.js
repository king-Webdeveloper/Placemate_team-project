// Profile.js[frontend]
import React, { useEffect, useState } from "react" ;
import { useNavigate } from "react-router-dom" ;
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgUrl, setImgUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/cookies-check", {
          method: "GET",
          credentials: "include",
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

  useEffect(() => {
    if (user && user.user_id) {
      fetch(`http://localhost:5000/api/user-image/${user.user_id}`, {
        credentials: "include",
        cache: "no-store", // ป้องกัน cache
      })
        .then((res) => res.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setImgUrl(url);
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("userId", user.user_id);

    try {
      const response = await fetch("http://localhost:5000/api/upload-profile", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Error: Unable to load profile.</div>;

  return (
    <div className="profile-container">
      <h2>Profile</h2>
  
      <div className="profile-box">
        <div className="profile-image-wrapper">
          {imgUrl && (
            <img
              src={`http://localhost:5000/api/user-image/${user.user_id}?t=${Date.now()}`}
              alt="Profile"
              className="profile-image"
            />
          )}
          <label htmlFor="upload-input" className="camera-icon-overlay">
           📷
          </label>
          <input
            type="file"
            id="upload-input"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>
  
        <div className="profile-info">
          <p className="profile-name">{user.username}</p>
        </div>
      </div>
  
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );  
}

export default Profile;
