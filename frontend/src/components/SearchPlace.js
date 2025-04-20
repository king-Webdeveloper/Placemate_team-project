import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { getUserLocation } from "./getGeo";
import "./SearchPlace.css"; // ใช้ไฟล์ CSS ที่ปรับแล้ว
import { haversine } from "./haversine"; // Import the haversine function

const SearchPlace = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get("query") || "";

    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedPlaces, setSelectedPlaces] = useState([]);

    const [userLocation, setUserLocation] = useState({ lat: null, lng: null }); // เก็บค่าพิกัด
    const [locationReady, setLocationReady] = useState(false); // ตรวจสอบว่าโหลดค่าพิกัดเสร็จแล้วหรือยัง

    useEffect(() => {
        if (initialQuery.trim()) {
            handleSearch(initialQuery);
        }
    }, [initialQuery]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryFromUrl = params.get("query") || "";
    
        if (queryFromUrl.trim()) {
          setSearchTerm(queryFromUrl); // อัปเดตค่า searchTerm
          handleSearch(queryFromUrl);  // เรียกค้นหาทันที
        }
    
        // เช็คว่า localStorage มีข้อมูลพิกัดหรือไม่
        const savedLocation = JSON.parse(localStorage.getItem('userLocation'));
        if (savedLocation) {
          setUserLocation(savedLocation);
          setLocationReady(true); // ถ้ามีข้อมูล ให้ set ค่าพิกัดและบอกว่า location พร้อมแล้ว
        } else {
          // ถ้าไม่มีข้อมูลใน localStorage, ให้เรียกใช้ฟังก์ชัน getUserLocation
          getUserLocation(setUserLocation);
        }
      }, [location.search]);

    useEffect(() => {
        if (userLocation.lat && userLocation.lng) {
          setLocationReady(true); // Set the location as ready once lat and lng are available
        }
      }, [userLocation]);

    const handleSearch = async (query) => {
        if (!query.trim()) return;

        setLoading(true);
        setError("");

        try {
            const response = await axios.get(`http://localhost:5000/api/search/places?query=${encodeURIComponent(query)}`);
            const data = response.data;

            // const updatedResults = data.map((place) => ({
            //     ...place,
            //     category: Array.isArray(place.category) ? place.category.join(", ") : place.category || "ไม่ระบุ",
            //     photo: place.photo || "/default-placeholder.png",
            // }));

            // setSearchResults(updatedResults);

            // Calculate distance for each place and sort by distance
            const updatedPlaces = data.map((place) => {
            const distance = haversine(userLocation.lat, userLocation.lng, place.lat, place.lng);
            return { ...place, distance };
            });
    
            // Sort the places by distance in ascending order
            const sortedPlaces = updatedPlaces.sort((a, b) => a.distance - b.distance);
    
            setSearchResults(sortedPlaces); // Update the search results with sorted places

        } catch (error) {
            console.error("Error fetching search results:", error);
            setError("ไม่สามารถค้นหาสถานที่ได้ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlace = (place) => {
        setSelectedPlaces(prevPlaces => {
            const exists = prevPlaces.some(p => p.place_id === place.place_id);
            return exists ? prevPlaces.filter(p => p.place_id !== place.place_id) : [...prevPlaces, place];
        });
    };

    const handleAddPlaces = () => {
        navigate(`/create-plan?selectedPlaces=${encodeURIComponent(JSON.stringify(selectedPlaces))}`);
    };

    return (
        <div className="searchplace-search-place-container">
            <h2>ค้นหาสถานที่</h2>
            <button onClick={handleAddPlaces} className="searchplace-confirm-button">ยืนยันการเลือกสถานที่ทั้งหมด</button>

            <div className="searchplace-search-bar">
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

            {loading && <p>กำลังค้นหา...</p>}
            {error && <p className="searchplace-error-message">{error}</p>}

            <div className="searchplace-search-results">
                {searchResults.length > 0 ? (
                    searchResults.map((place) => (
                        <div key={place.place_id} className="searchplace-result-search">
                            <div className="searchplace-image-container">
                                <div className="searchplace-place-tags">
                                    {place.tag && place.tag.map((tagObj, index) => (
                                        <span key={index} className="searchplace-place-tag">{tagObj.tag_name}</span>
                                    ))}
                                </div>
                                <img
                                    src={`/place_images/${place.place_id}.jpg`}
                                    alt={`Place ${place.id}`}
                                    className="searchplace-place-image"
                                />
                            </div>

                            <div className="searchplace-div-searchResult">
                                <strong>{place.name} ({place.distance.toFixed(2)}km.)  </strong>
                                <span>{place.name}{isNaN(place.rating) && place.rating == "NaN" ? "" : "⭐" + place.rating}</span>
                            </div>
                            <div className="searchplace-go-bottom">
                                <button 
                                    onClick={() => handleSelectPlace(place)} 
                                    // className="searchplace-go-button"
                                    className={`searchplace-go-button ${selectedPlaces.some(p => p.place_id === place.place_id) ? 'selected' : ''}`}
                                    // style={{ backgroundColor: selectedPlaces.some(p => p.place_id === place.place_id) ? '#28a745' : '#007bff' }}
                                >
                                    {selectedPlaces.some(p => p.place_id === place.place_id) ? 'ยกเลิกเลือก' : 'เลือก'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    !loading && <p></p>
                )}
            </div>
        </div>
    );
};

export default SearchPlace;