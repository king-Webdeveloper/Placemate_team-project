//Searchresult.js [frontend]
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserLocation } from "./getGeo";
import { haversine } from "./haversine"; // Import the haversine function
import "./Searchresult.css";
import handleAddPlace from "./handleAddPlace";

const Searchresult = () => {
  const [searchTerm, setSearchTerm] = useState(""); // ค่าค้นหา
  const [searchResults, setSearchResults] = useState([]); // ผลลัพธ์การค้นหา
  const [searched, setSearched] = useState(false); // เช็คว่ามีการกดค้นหาหรือยัง
  const navigate = useNavigate();
  const location = useLocation(); // ใช้สำหรับดึงค่า query จาก URL

  const [userLocation, setUserLocation] = useState({ lat: null, lng: null }); // เก็บค่าพิกัด
  const [locationReady, setLocationReady] = useState(false); // ตรวจสอบว่าโหลดค่าพิกัดเสร็จแล้วหรือยัง

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery] = useState(""); // Store search text


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

  // Lazy load
  const fetchPlaces = async () => {
    if (!hasMore || loading) return;
  
    setLoading(true);
    try {
      const res = await fetch(`/api/search/places?query=${searchQuery}&page=${page}&limit=10`);
      const data = await res.json();
  
      if (data.places.length === 0) {
        setHasMore(false); // Stop loading if no more places
      } else {
        setSearchResults((prev) => [...prev, ...data.places]);
        setPage(page + 1);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        fetchPlaces();
      }
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [searchQuery, page, hasMore]); // Fetch again if query changes

  const handleSearch = async (query) => {
    if (!query.trim() || !locationReady) return; // Only perform the search if location is ready

    setSearched(true);
    navigate(`/searchresult?query=${encodeURIComponent(query)}`);

    try {
      const response = await fetch(`http://localhost:5000/api/search/places?query=${encodeURIComponent(query)}`, {
      // const response = await fetch(`${process.env.REACT_APP_API_URL}:5000/api/search/places?query=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          // Authorization: `Bearer ${token}`,
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
  
  const handleGoGoogleMap = (placeId) => {
    // Construct the Google Maps URL with the latitude and longitude
    const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`; // You can adjust the zoom level (z) as needed
    // Open the URL in a new tab
    window.open(googleMapsUrl, "_blank");
  };
  

  return (
    <div >
        <div className="center-box">
        {/* <h1 >ผลการค้นหา</h1> */}

        {/* User Location */}
        
          {/* <h2>User Location:</h2> */}
          {userLocation.lat && userLocation.lng ? (
            <p>Latitude: {userLocation.lat}, Longitude: {userLocation.lng}</p>
          ) : (
            <p>Loading location...</p>
          )}
        

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
        <h2>ผลลัพธ์การค้นหา</h2>
        </div>

        {searchResults.length > 0 && (
          <div>
            
            {/* <ul className="searchbar-resultbox"> */}
            <ul className="container-list">
              {searchResults.map((place) => (
                <li key={place.id} className="result-search">
                  <div className="div-searchResult">
                    <img
                      src={`/place_images/${place.place_id}.jpg`}
                      alt={`Place ${place.id}`}
                      className="place-image"
                    />
                    <span>{place.name} {isNaN(place.rating) && place.rating == "NaN" ? "" : "⭐"+ place.rating}</span>
                    <span>
                      {place.tag.map((tagObj, index) => (
                        <span key={index}>
                          <button className="tag-button">
                            {tagObj.tag_name}{index !== place.tag.length - 1 ? ', ' : ''}
                          </button>
                        </span>
                      ))}
                    </span>

                  <span> - {place.distance.toFixed(2)} km</span>
                  </div>
                  <button onClick={() => handleGoGoogleMap(place.place_id)} className="go-button">
                    ดูสถานที่
                  </button>
                  <button onClick={() => handleAddPlace(place, navigate)} className="go-button">
                    เพิ่มไปยัง List to go
                  </button>
                </li>
              ))}
            </ul>

            {/* Show "Loading..." if fetching more data */}
            {loading && <p>Loading...</p>}

          </div>
        )}
      </div>

  );
};

export default Searchresult;
