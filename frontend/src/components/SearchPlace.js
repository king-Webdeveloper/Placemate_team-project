import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./SearchPlace.css"; // ใช้ไฟล์ CSS ที่ปรับแล้ว

const SearchPlace = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get("query") || "";

    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);  // สถานะการโหลด
    const [error, setError] = useState("");  // ข้อผิดพลาด
    const [selectedPlaces, setSelectedPlaces] = useState([]);  // สถานที่ที่เลือก

    useEffect(() => {
        if (initialQuery.trim()) {
            handleSearch(initialQuery);
        }
    }, [initialQuery]);

    const handleSearch = async (query) => {
        if (!query.trim()) return;

        setLoading(true);  // เริ่มโหลดข้อมูล
        setError("");  // รีเซ็ตข้อผิดพลาดก่อนเริ่มการค้นหา

        try {
            const response = await axios.get(`http://localhost:5000/api/search/places?query=${encodeURIComponent(query)}`);
            const data = response.data;

            // ตรวจสอบ category และรูปภาพ
            const updatedResults = data.map((place) => ({
                ...place,
                category: Array.isArray(place.category) ? place.category.join(", ") : place.category || "ไม่ระบุ",
                photo: place.photo || "/default-placeholder.png", // ใช้รูปภาพ placeholder หากไม่มี
            }));

            setSearchResults(updatedResults);
        } catch (error) {
            console.error("Error fetching search results:", error);
            setError("ไม่สามารถค้นหาสถานที่ได้ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);  // หยุดโหลดข้อมูล
        }
    };

    const handleSelectPlace = (place) => {
        // เพิ่มสถานที่ที่เลือกลงใน selectedPlaces
        setSelectedPlaces(prevPlaces => {
            const exists = prevPlaces.some(p => p.place_id === place.place_id);
            if (exists) {
                return prevPlaces.filter(p => p.place_id !== place.place_id);  // ถ้าเลือกซ้ำให้ลบออก
            } else {
                return [...prevPlaces, place];  // เพิ่มสถานที่ใหม่
            }
        });
    };

    const handleAddPlaces = () => {
        // ส่งข้อมูลสถานที่ทั้งหมดไปยัง CreatePlan.js เพื่อให้ยืนยันการเลือก
        navigate(`/create-plan?selectedPlaces=${encodeURIComponent(JSON.stringify(selectedPlaces))}`);
    };

    return (
        <div className="searchplace-search-place-container">
            <h2>ค้นหาสถานที่</h2>

            {/* ปุ่มยืนยันการเลือกสถานที่ทั้งหมด */}
            <button onClick={handleAddPlaces} className="confirm-button">ยืนยันการเลือกสถานที่ทั้งหมด</button>

            <div className="searchbar-search-bar">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="พิมพ์ชื่อสถานที่"
                    className="searchplace-search-input"
                />
                <button onClick={() => handleSearch(searchTerm)} className="searchplace-search-button">
                    ค้นหา
                </button>
            </div>

            {loading && <p>กำลังค้นหา...</p>}  {/* แสดงข้อความระหว่างโหลดข้อมูล */}

            {error && <p className="error-message">{error}</p>}  {/* แสดงข้อผิดพลาด */}

            <div className="searchplace-search-results">
                {searchResults.length > 0 ? (
                    searchResults.map((place) => (
                        <div key={place.place_id} className="result-search">
                            <img
                                src={`/place_images/${place.place_id}.jpg`}
                                alt={`Place ${place.id}`}
                                className="place-image"
                            />
                            <div className="div-searchResult">
                                <strong>{place.name}</strong>
                                <p>{place.category}</p>
                                <p>⭐ {place.rating || "ไม่มีเรตติ้ง"}</p>
                            </div>
                            <div className="go-bottom">
                                <button 
                                    onClick={() => handleSelectPlace(place)} 
                                    className="go-button"
                                    style={{ backgroundColor: selectedPlaces.some(p => p.place_id === place.place_id) ? '#28a745' : '#007bff' }} // ปรับสีปุ่มเมื่อเลือกสถานที่แล้ว
                                >
                                    {selectedPlaces.some(p => p.place_id === place.place_id) ? 'ยกเลิกเลือก' : 'เลือก'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    !loading && <p>ไม่พบผลลัพธ์ที่ตรงกับคำค้นหาของคุณ</p>
                )}
            </div>
        </div>
    );
};

export default SearchPlace;
