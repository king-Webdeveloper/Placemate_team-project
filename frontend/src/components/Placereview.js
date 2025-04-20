// Placereview.js [frontend]
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom"; // เพิ่ม Link สำหรับนำทางไปยังหน้า login
import "./Placereview.css";

const Placereview = () => {
    const { place_id } = useParams(); // รับ place_id จาก URL parameters
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]); // เก็บข้อมูลรีวิว
    const [rating, setRating] = useState(1); // ค่าคะแนน
    const [comment, setComment] = useState(""); // คอมเมนต์
    const [error, setError] = useState(""); // เก็บข้อความ error
    const [averageRating, setAverageRating] = useState(0); // เก็บคะแนนเฉลี่ย
    const [placeName, setPlaceName] = useState(""); // เก็บชื่อสถานที่
    const [isLoggedIn, setIsLoggedIn] = useState(false); // สถานะการล็อกอิน

    // ฟังก์ชั่นดึงข้อมูลรีวิวและชื่อสถานที่จาก API
    useEffect(() => {
        const fetchPlaceAndReviews = async () => {
            try {
                // ดึงข้อมูลสถานที่ (ชื่อ) จาก API
                const placeResponse = await fetch(`http://localhost:5000/api/reviews/${place_id}`);
                if (!placeResponse.ok) {
                    throw new Error("ไม่สามารถดึงข้อมูลสถานที่ได้");
                }
                const placeData = await placeResponse.json();
                setPlaceName(placeData.place_name); // ตั้งชื่อสถานที่

                // ดึงข้อมูลรีวิวจาก API
                const reviewsResponse = await fetch(`http://localhost:5000/api/reviews/${place_id}`);
                if (!reviewsResponse.ok) {
                    throw new Error("ไม่สามารถดึงข้อมูลรีวิวได้");
                }
                const reviewsData = await reviewsResponse.json();
                setReviews(reviewsData.reviews);
                setAverageRating(reviewsData.average_rating);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("ไม่สามารถดึงข้อมูลรีวิวได้");
            }
        };

        fetchPlaceAndReviews();
    }, [place_id]);

    // ฟังก์ชั่นส่งรีวิวใหม่ไปที่ backend
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!isLoggedIn) {
            // หากผู้ใช้ยังไม่ได้ล็อกอิน, นำทางไปยังหน้าเข้าสู่ระบบ
            navigate("/login");
            return; // หยุดการทำงานของฟังก์ชั่น
        }
        
        const user_id = 1; // สมมติว่า user_id มาจากการ login ของผู้ใช้
        
        try {
            const response = await fetch("http://localhost:5000/api/reviews/add-comment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // ใส่ credentials เพื่อให้การส่งข้อมูลพร้อม session/cookie
                body: JSON.stringify({
                    user_id,
                    place_id,
                    rating,
                    comment,
                }),
            });

            if (!response.ok) {
                throw new Error("ไม่สามารถเพิ่มรีวิวได้");
            }

            alert("รีวิวของคุณถูกเพิ่มสำเร็จ!");
            setComment(""); // รีเซ็ตคอมเมนต์
            setRating(1); // รีเซ็ตคะแนน
            window.location.reload(); // รีเฟรชหน้าเพื่อดึงข้อมูลใหม่
        } catch (err) {
            console.error("Error adding review:", err);
            setError("ไม่สามารถเพิ่มรีวิวได้");
        }
    };

    return (
        <div className="placereview">
            <h1>รีวิวสถานที่: {placeName || place_id}</h1> {/* แสดงชื่อสถานที่หรือ place_id */}

            {error && <p className="error">{error}</p>}

            <div className="average-rating">
                <p>คะแนนเฉลี่ย: {averageRating.toFixed(1)}</p>
            </div>

            {/* แสดงภาพสถานที่ */}
            <div className="place-image-container">
                <img
                    src={`/place_images/${place_id}.jpg`}  // ดึงภาพจาก place_id
                    alt={`Place ${place_id}`}
                    className="place-image"
                    onClick={() => navigate(`/placereview/${place_id}`)}  // นำไปหน้ารีวิว
                />
            </div>

            <div className="review-list">
                <h2>รีวิวทั้งหมด</h2>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.user_id} className="review-item">
                            {/* <p>ผู้ใช้ ID: {review.user_id}</p> */}
                            <p className="star-display">
                            คะแนน:{" "}
                            {[...Array(5)].map((_, i) => (
                                <span key={i} style={{ color: i < review.rating ? "#ffd700" : "#ccc" }}>
                                &#9733;
                                </span>
                            ))}
                            </p>
                            <p>คอมเมนต์: {review.comment}</p>
                            <p>รีวิวเมื่อ: {new Date(review.created_at).toLocaleString()}</p>
                        </div>
                    ))
                ) : (
                    <p>ยังไม่มีรีวิวสำหรับสถานที่นี้</p>
                )}
            </div>

            <div className="add-review">
                <h2>เพิ่มรีวิวของคุณ</h2>
                <form onSubmit={handleSubmitReview}>
                <label>คะแนน:</label>
                <div className="custom-star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                    key={star}
                    className={`star ${star <= rating ? "filled" : ""}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setRating(star)} // เพิ่มถ้าอยากให้เปลี่ยนตอน hover
                    onMouseLeave={() => setRating(rating)} // ให้กลับมาเป็นค่าที่เลือกจริง
                    >
                    &#9733;
                    </span>
                ))}
                </div>

                    <label>คอมเมนต์:</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={1000}
                    ></textarea>

                    <button type="submit">เพิ่มรีวิว</button>
                </form>
            </div>

            {!isLoggedIn && (
                <p style={{ textAlign: "center" }}>
                กรุณาล็อกอินเพื่อเพิ่มรีวิว <Link to="/login">ไปยังหน้าเข้าสู่ระบบ</Link>
              </p>
            )}
        </div>
    );
};

export default Placereview;


