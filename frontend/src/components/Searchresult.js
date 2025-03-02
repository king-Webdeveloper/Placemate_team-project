import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserLocation } from "./getGeo";
import { haversine } from "./haversine"; // Import the haversine function
import "./Searchresult.css";

const Searchresult = () => {
  const [searchTerm, setSearchTerm] = useState(""); // ค่าค้นหา
  const [places, setPlaces] = useState([]); // รายการที่บันทึกไว้
  const [searchResults, setSearchResults] = useState([]); // ผลลัพธ์การค้นหา
  const [searched, setSearched] = useState(false); // เช็คว่ามีการกดค้นหาหรือยัง
  const navigate = useNavigate();
  const location = useLocation(); // ใช้สำหรับดึงค่า query จาก URL

  const [userLocation, setUserLocation] = useState({ lat: null, lng: null }); // เก็บค่าพิกัด
  const [locationReady, setLocationReady] = useState(false); // ตรวจสอบว่าโหลดค่าพิกัดเสร็จแล้วหรือยัง

  const token = localStorage.getItem("token"); // ดึง token จาก localStorage หรือแก้ไขตามวิธีที่คุณใช้

  // ✅ ดึงค่า query จาก URL เมื่อโหลดหน้า
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryFromUrl = params.get("query") || "";

    if (queryFromUrl.trim()) {
      setSearchTerm(queryFromUrl); // อัปเดตค่า searchTerm
      handleSearch(queryFromUrl);  // เรียกค้นหาทันที
    }

    getUserLocation(setUserLocation); // Get the user location when the component mounts
  }, [location.search]);

  useEffect(() => {
    if (userLocation.lat && userLocation.lng) {
      setLocationReady(true); // Set the location as ready once lat and lng are available
    }
  }, [userLocation]);

  // Trigger search automatically when the location is ready and search term is available
  useEffect(() => {
    if (locationReady && searchTerm.trim()) {
      handleSearch(searchTerm); // Automatically perform the search after location is ready
    }
  }, [locationReady, searchTerm]);

  const handleSearch = async (query) => {
    if (!query.trim() || !locationReady) return; // Only perform the search if location is ready

    setSearched(true);
    navigate(`/searchresult?query=${encodeURIComponent(query)}`);

    try {
      // const response = await fetch(`${process.env.REACT_APP_API_URL}:5000/api/search/places?query=${encodeURIComponent(query)}`, {
      const response = await fetch(`http://localhost:5000/api/search/places?query=${encodeURIComponent(query)}`, {
      
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to search places");

      const data = await response.json();

      console.log("Search response:", data);

      // Calculate distance for each place and sort by distance
      const updatedPlaces = data.map((place) => {
        const distance = haversine(userLocation.lat, userLocation.lng, place.lat, place.lng);
        return { ...place, distance };
      });

      // Sort the places by distance in ascending order
      const sortedPlaces = updatedPlaces.sort((a, b) => a.distance - b.distance);

      setSearchResults(sortedPlaces); // Update the search results with sorted places
    } catch (error) {
      console.error("Error searching places:", error);
    }
  };

  const handleAddPlace = async (place) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}:5000/api/search/addtolisttogo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: place.name }),
      });

      if (!response.ok) throw new Error("Failed to add place");

      const newPlace = await response.json();
      setPlaces([...places, newPlace]); // อัปเดตรายการสถานที่ที่บันทึกไว้
    } catch (error) {
      console.error("Error adding place:", error);
    }
  };

  const handleGoGoogleMap = (placeId) => {
    // Construct the Google Maps URL with the latitude and longitude
    const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`; // You can adjust the zoom level (z) as needed
    // Open the URL in a new tab
    window.open(googleMapsUrl, "_blank");
  };
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="container mx-auto px-4 py-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">ผลการค้นหา</h1>

        {/* User Location */}
        <div>
          <h2>User Location:</h2>
          {userLocation.lat && userLocation.lng ? (
            <p>Latitude: {userLocation.lat}, Longitude: {userLocation.lng}</p>
          ) : (
            <p>Loading location...</p>
          )}
        </div>

        {/* Search Bar */}
        <div className="searchbar-search-bar">
          <input
            type="text"
            className="searchbar-search-input"
            placeholder="ค้นหา"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => handleSearch(searchTerm)} className="searchbar-search-button">
            ค้นหา
          </button>
        </div>

        {/* Search Results */}
        {searched && searchResults.length === 0 && (
          <p className="text-center text-gray-500 mt-4">ไม่พบผลลัพธ์ที่ตรงกัน</p>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 w-full">
            <h2 className="text-lg font-semibold">ผลลัพธ์การค้นหา</h2>
            <ul className="searchbar-resultbox">
              {searchResults.map((place) => (
                <li key={place.id} className="result-listtogo">
                  <span>{place.name}</span>
                  <span> - {place.distance.toFixed(2)} km</span> {/* Display distance */}
                  <button 
                    onClick={() => handleAddPlace(place)} 
                    className="bg-blue-500 text-white px-2 py-1 rounded-lg"
                  >
                    ➕ เพิ่มไปยัง List to go
                  </button>
                  <button 
                    onClick={() => handleGoGoogleMap(place.place_id)} 
                    className="bg-blue-500 text-white px-2 py-1 rounded-lg"
                  >
                    GO
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Searchresult;
