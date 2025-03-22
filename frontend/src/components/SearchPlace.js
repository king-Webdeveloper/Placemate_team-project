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

    useEffect(() => {
        if (initialQuery.trim()) {
            handleSearch(initialQuery);
        }
    }, [initialQuery]);

    const handleSearch = async (query) => {
        if (!query.trim()) return;
        
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
        }
    };

    const handleSelectPlace = (place) => {
        navigate(`/create-plan?selectedPlace=${encodeURIComponent(JSON.stringify(place))}`);
    };

    return (
        <div className="searchplace-search-place-container">
            <h2>ค้นหาสถานที่</h2>
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
            <div className="searchplace-search-results">
                {searchResults.map((place) => (
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
                            <button onClick={() => handleSelectPlace(place)} className="go-button">
                                เลือก
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchPlace;
