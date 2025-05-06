// Profile.js[frontend]
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgUrl, setImgUrl] = useState(null);
  const [reviews, setReviews] = useState([]);
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
          fetchReviews(data.user_id); // ดึงข้อมูลรีวิวเมื่อได้ข้อมูลผู้ใช้
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

  const handleClickPlace = (placeId) => {
    // เพียงแค่นำทางไปยังหน้ารีวิวของสถานที่นั้น
    navigate(`/placereview/${placeId}`);
  };

  const fetchReviews = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-reviews/${userId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Unable to fetch reviews");
      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (user && user.user_id) {
      fetch(`http://localhost:5000/api/user-image/${user.user_id}`, {
        credentials: "include",
        cache: "no-store",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Image not found from frontend");
          return res.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setImgUrl(url);
        })
        .catch((err) => {
          console.error("Image not found or failed to load:", err);
          setImgUrl(null); // 👈 ล้าง imgUrl เพื่อไม่แสดง <img>
        });
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
  
    // 🖼️ แปลงไฟล์เป็น base64 เพื่อ preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imagePreview = e.target.result;
  
      // 🛑 แสดงกล่องยืนยันพร้อมรูปภาพ
      const result = await Swal.fire({
        title: "คุณต้องการใช้ภาพนี้หรือไม่?",
        imageUrl: imagePreview,
        imageAlt: "Preview image",
        showCancelButton: true,
        confirmButtonText: "อัปโหลดเลย!",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      });
  
      if (!result.isConfirmed) {
        return; // ถ้า user กดยกเลิก → ไม่อัปโหลด
      }
  
      // ✅ เริ่มอัปโหลดหลังจากยืนยัน
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
  
          await Swal.fire({
            title: "อัปโหลดสำเร็จ!",
            text: "ภาพโปรไฟล์ของคุณได้รับการอัปเดตเรียบร้อยแล้ว",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        await Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถอัปโหลดรูปได้ กรุณาลองใหม่",
          icon: "error",
        });
      }
    };
  
    // 🧠 เริ่มอ่านไฟล์ภาพ
    reader.readAsDataURL(file);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Error: Unable to load profile.</div>;

  return (
    <div className="profile-container">
      <h2>Profile</h2>
  
      <div className="profile-box">
        <div className="profile-image-wrapper">
          {imgUrl && <img src={imgUrl} alt="Profile" className="profile-image" />}
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

      {/* ปุ่ม Logout */}
      <div className="logout-container">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
  
      {/* แสดงรีวิวที่ผู้ใช้เคยทำ */}
      <div className="reviews-section">
        <h3>ประวัติการรีวิว</h3>
        {reviews.length > 0 ? (
          <ul className="reviews-list">
            {reviews.map((review) => (
              <li onClick={() => handleClickPlace(review.place_id)} key={review.review_id} className="review-item-history">
                {/* ทำให้ชื่อสถานที่สามารถคลิกได้ */}
                <h4 >
                  {review.place_name}
                </h4>
                <p className="rating">คะแนน: {review.rating} / 5</p>
                <p className="comment">ความคิดเห็น: {review.comment}</p>
                <p className="date">
                  รีวิวเมื่อ: {new Date(review.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-reviews-message">คุณยังไม่ได้รีวิวร้านใดๆ</p>
        )}
      </div>
    </div>
  );
}

export default Profile;

