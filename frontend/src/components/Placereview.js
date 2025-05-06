// Placereview.js [frontend]
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom"; // เพิ่ม Link สำหรับนำทางไปยังหน้า login
import Swal from "sweetalert2";
import "./Placereview.css";

const Placereview = () => {
    const { place_id } = useParams(); // รับ place_id จาก URL parameters
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]); // เก็บข้อมูลรีวิว
    const [rating, setRating] = useState(0); // เริ่มต้นที่ 0 คะแนน
    const [comment, setComment] = useState(""); // คอมเมนต์
    const [error, setError] = useState(""); // เก็บข้อความ error
    const [averageRating, setAverageRating] = useState(0); // เก็บคะแนนเฉลี่ย
    const [placeName, setPlaceName] = useState(""); // เก็บชื่อสถานที่
    const [isLoggedIn, setIsLoggedIn] = useState(false); // สถานะการล็อกอิน
    const [userId, setUserId] = useState(null); // user_id ที่ได้รับจากการล็อกอิน
    const [username, setUsername] = useState(""); // username ของผู้ใช้ที่ล็อกอิน

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

    // useEffect สำหรับตรวจสอบสถานะการล็อกอิน
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/cookies-check", {
                    method: "GET",
                    credentials: "include", // ส่งคุกกี้ไปกับคำขอ
                });
                if (!response.ok) {
                    setIsLoggedIn(false);
                    return;
                }
                const responseText = await response.text();
                let userdata;
                try {
                    userdata = JSON.parse(responseText); // ถอดรหัส JSON จากคุกกี้
                } catch (jsonError) {
                    console.error("Invalid JSON response:", jsonError);
                    setIsLoggedIn(false);
                    return;
                }
                setIsLoggedIn(true);
                setUsername(userdata.username); // เก็บ username
                setUserId(userdata.user_id); // เก็บ user_id
            } catch (error) {
                console.error("Error checking login status:", error);
                setIsLoggedIn(false);
            }
        };

        checkLoginStatus(); // เรียกฟังก์ชันตรวจสอบสถานะการล็อกอิน
    }, []); // เรียกใช้ useEffect เมื่อโหลดหน้า

    const handleGoGoogleMap = (userId, placeId) => {
        const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`; // You can adjust the zoom level (z) as needed
        // Open the URL in a new tab
        window.open(googleMapsUrl, "_blank");
      };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
    
        // ตรวจสอบว่าผู้ใช้เลือกคะแนนแล้วหรือไม่
        if (rating === 0) {
            await Swal.fire({
                title: "กรุณาเพิ่มคะแนน",
                text: "กรุณาเพิ่มคะแนนให้กับทางร้านก่อนที่จะส่งรีวิว",
                icon: "warning",
                confirmButtonText: "ตกลง"
            });
            return;
        }
    
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }
    
        const user_id = userId;
    
        // >>>> SweetAlert2 ยืนยันก่อนเพิ่ม <<<<
        const result = await Swal.fire({
            title: "คุณต้องการเพิ่มรีวิวหรือไม่?",
            text: "กรุณาตรวจสอบคะแนนและคอมเมนต์ก่อนยืนยัน",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก"
        });
    
        if (result.isConfirmed) {
            try {
                const response = await fetch("http://localhost:5000/api/reviews/add-comment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
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
    
                await Swal.fire({
                    title: "สำเร็จ!",
                    text: "รีวิวของคุณถูกเพิ่มแล้ว",
                    icon: "success",
                    confirmButtonText: "ตกลง"
                });
    
                setComment(""); 
                setRating(1); 
    
                // อัปเดตรีวิวใหม่
                const reviewsResponse = await fetch(`http://localhost:5000/api/reviews/${place_id}`);
                if (!reviewsResponse.ok) {
                    throw new Error("ไม่สามารถดึงข้อมูลรีวิวได้");
                }
                const reviewsData = await reviewsResponse.json();
                setReviews(reviewsData.reviews);
                setAverageRating(reviewsData.average_rating);
    
            } catch (err) {
                console.error("Error adding review:", err);
                setError("ไม่สามารถเพิ่มรีวิวได้");
    
                await Swal.fire({
                    title: "เกิดข้อผิดพลาด",
                    text: "ไม่สามารถเพิ่มรีวิวได้ กรุณาลองใหม่อีกครั้ง",
                    icon: "error",
                    confirmButtonText: "ตกลง"
                });
            }
        } else {
            // กรณีกดยกเลิก ไม่ต้องทำอะไร
        }
    };

    const handleDeleteReview = async (review_id) => {
        console.log("Review ID:", review_id);
        // ตรวจสอบว่า review_id มีค่าหรือไม่
        if (!review_id) {
            console.error("Review ID is missing");
            await Swal.fire({
                title: "เกิดข้อผิดพลาด",
                text: "ไม่พบรีวิวที่ต้องการลบ",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
            return;
        }
    
        // ตรวจสอบว่า user_id มีค่าหรือไม่
        if (!userId) {
            await Swal.fire({
                title: "กรุณาล็อกอิน",
                text: "คุณต้องล็อกอินก่อนถึงจะลบรีวิวได้",
                icon: "warning",
                confirmButtonText: "ไปที่หน้าเข้าสู่ระบบ"
            }).then((result) => {
                if (result.isConfirmed) {
                    // นำผู้ใช้ไปยังหน้าล็อกอิน
                    window.location.href = '/login';
                }
            });
            return;
        }
    
        // ใช้ SweetAlert2 ยืนยันก่อนลบ
        const result = await Swal.fire({
            title: "คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้?",
            text: "การลบรีวิวจะไม่สามารถย้อนกลับได้",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก"
        });
    
        if (result.isConfirmed) {
            try {
                // ส่งคำขอลบรีวิวไปยัง API
                const response = await fetch(`http://localhost:5000/api/reviews/${review_id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        user_id: userId, // ส่ง user_id ไปด้วยเพื่อเช็คสิทธิ์การลบ
                    }),
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "ไม่สามารถลบรีวิวได้");
                }
    
                // รีเฟรชข้อมูลรีวิวหลังจากลบสำเร็จ
                await Swal.fire({
                    title: "สำเร็จ!",
                    text: "รีวิวของคุณถูกลบแล้ว",
                    icon: "success",
                    confirmButtonText: "ตกลง"
                });
    
                // ดึงข้อมูลรีวิวใหม่
                if (!place_id) {
                    console.error("Place ID is missing");
                    await Swal.fire({
                        title: "เกิดข้อผิดพลาด",
                        text: "ไม่สามารถรีเฟรชข้อมูลรีวิวได้",
                        icon: "error",
                        confirmButtonText: "ตกลง"
                    });
                    return;
                }
    
                const reviewsResponse = await fetch(`http://localhost:5000/api/reviews/${place_id}`);
                if (!reviewsResponse.ok) {
                    throw new Error("ไม่สามารถดึงข้อมูลรีวิวได้");
                }
                const reviewsData = await reviewsResponse.json();
                setReviews(reviewsData.reviews);
                setAverageRating(reviewsData.average_rating);
    
            } catch (err) {
                console.error("Error deleting review:", err);
                await Swal.fire({
                    title: "เกิดข้อผิดพลาด",
                    text: "ไม่สามารถลบรีวิวได้ กรุณาลองใหม่อีกครั้ง",
                    icon: "error",
                    confirmButtonText: "ตกลง"
                });
            }
        }
    };    
    
    return (
        <div className="placereview">
            <h1>รีวิวสถานที่: {placeName || place_id}</h1> {/* แสดงชื่อสถานที่หรือ place_id */}
            {error && <p className="error">{error}</p>}

            <div className="average-rating">
                {averageRating > 0 ? (
                    <p>คะแนนเฉลี่ย: {averageRating.toFixed(1)}</p>
                ) : (
                    <p>ยังไม่มีคะแนนสำหรับสถานที่แห่งนี้</p>
                )}
            </div>

            <button onClick={(e) => { 
                  e.stopPropagation();  // หยุดการ propagate event สำหรับปุ่ม
                  handleGoGoogleMap(userId, place_id);
                }} className="placereviewgo-button">
                  ดูสถานที่
            </button>

            {/* แสดงภาพสถานที่ */}
            <div className="placereview-image-container">
                <img
                    src={`/place_images/${place_id}.jpg`}  // ดึงภาพจาก place_id
                    alt={`Place ${place_id}`}
                    className="review-place-image"
                    onClick={() => navigate(`/placereview/${place_id}`)}  // นำไปหน้ารีวิว
                />
            </div>

            <div className="review-list">
                <h2>รีวิวทั้งหมด</h2>
                {reviews.length > 0 ? (
                    reviews.map((review) => {
                        return (
                            <div key={review.created_at} className="review-item">
                                <p>รีวิวโดย: {review.username}</p> {/* แสดงชื่อผู้รีวิว */}
                                <p className="star-display">
                                    คะแนน:{" "}
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            style={{ color: i < review.rating ? "#ffd700" : "#ccc" }}
                                        >
                                            &#9733;
                                        </span>
                                    ))}
                                </p>
                                <p>คอมเมนต์: {review.comment}</p>
                                <p>รีวิวเมื่อ: {new Date(review.created_at).toLocaleString()}</p>

                                {isLoggedIn && review.user_id === userId && (
                                    <button
                                        className="delete-review-btn"
                                        onClick={() => handleDeleteReview(review.review_id)}
                                    >
                                        🗑️ ลบรีวิว
                                    </button>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p>ยังไม่มีรีวิวสำหรับสถานที่นี้</p>
                )}
            </div>


            {/* ฟอร์มเพิ่มรีวิวจะต้องแสดงเมื่อผู้ใช้ล็อกอิน */}
            {isLoggedIn && (
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

                        <button type="submit" >เพิ่มรีวิว</button> 
                    </form>
                </div>
            )}

            {!isLoggedIn && (
                <p style={{ textAlign: "center" }}>
                    กรุณาล็อกอินเพื่อเพิ่มรีวิว <Link to="/login">ไปยังหน้าเข้าสู่ระบบ</Link>
                </p>
            )}
        </div>
    );
};

export default Placereview;



