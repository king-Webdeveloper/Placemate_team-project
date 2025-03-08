import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Pathmanagement"; // ใช้ AuthContext
import "./Homepage.css";
import handleAddPlace from "./handleAddPlace";

function Homepage() {
  const [query, setQuery] = useState(""); // เก็บค่าค้นหา
  const { isLoggedIn, setIsLoggedIn, username, setUsername } = useAuth(); // ดึงข้อมูลจาก context
  const navigate = useNavigate(); 

  const [places, setPlaces] = useState([]); // Store places
  const [page, setPage] = useState(1); // Track current page
  const [loading, setLoading] = useState(false); // Track loading state
  const [hasMore, setHasMore] = useState(true); // Check if more data is available

  // const token = localStorage.getItem("token"); // ดึง token จาก localStorage หรือแก้ไขตามวิธีที่คุณใช้

  // const addNewPlace = async (place) => {
  //   const response = await fetch("http://localhost:5000/api/cookies-check", {
  //     method: "GET",
  //     credentials: "include",
  //   });
  //   const responseText = await response.text();
  //   const data = JSON.parse(responseText);
  //   console.log("cookie's here", response)

  //   await handleAddPlace(place, setPlaces, responseText, navigate);
  // };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/cookies-check", {
          method: "GET",
          credentials: "include",
        });
  
        const responseText = await response.text();
        const data = JSON.parse(responseText);
  
        if (response.ok) {
          setIsLoggedIn(true);
          setUsername(data.username);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false);
      }
    };
  
    checkLoginStatus();
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/searchresult?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleGoGoogleMap = (placeId) => {
    // Construct the Google Maps URL with the latitude and longitude
    const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`; // You can adjust the zoom level (z) as needed
    // Open the URL in a new tab
    window.open(googleMapsUrl, "_blank");
  };

  const fetchPlaces = async () => {
    if (!hasMore || loading) return;
  
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/getplaces?page=${page}&limit=3`); // Use port 5000
  
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }
  
      const data = await res.json();
      console.log(data);
  
      if (data.places.length === 0) {
        setHasMore(false);
      } else {
        setPlaces((prev) => [...prev, ...data.places]);
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
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        !loading
      ) {
        fetchPlaces();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  useEffect(() => {
    fetchPlaces();
  }, []);

  return (
    <div className="homepage">
      <header className="navbar">
      <Link to="/">
                <img src="/PM1.1.png" alt="Logo" className="logo" />
            </Link>
        <nav className="navbar-nav">
          <Link to="/listtogo">LIST TO GO</Link>
          <Link to="/planer">PLANNER</Link>
          <Link to="/aboutme">ABOUT US</Link>
        </nav>
        {isLoggedIn ? (
          <Link to="/profile" className="nav-profile">{username}</Link>
        ) : (
          <Link to="/login" className="login-btn">เข้าสู่ระบบ</Link>
        )}
      </header>

      <section className="search-bar">
        <h2>ค้นหากิจกรรมที่อยากทำ</h2>
        <div className="search-tags">
          {["Food & Drink", "Shopping", "Entertainment"].map((tag, index) => (
            <button key={index} className="tag" onClick={() => setQuery(tag)}>
              {tag}
            </button>
          ))}
        </div>
        <div className="search-input">
          <input
            type="text"
            placeholder="ค้นหาสถานที่..."
            className="search-field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>
            ค้นหา
          </button>
        </div>
      </section>
      
      <h2>แนะนำสำหรับคุณ</h2>
      <section className="recommended">
        <div className="set-center">
          <button>เพิ่มเติม</button>
        </div>
      </section>

      <h2>ยอดนิยม</h2>
      <section className="recommended">
        <div className="set-center">
          <button>เพิ่มเติม</button>
        </div>
      </section>

      <h2>คุณอาจชอบ</h2>
      <section className="recommended">
      <div className="place-grid">
        {places?.map((place, index) => (  // ใช้ ?.map() เพื่อหลีกเลี่ยง error
          <div key={index} className="place-card">
            <a href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`} target="_blank" rel="noopener noreferrer">
              <img
                src={`/place_images/${place.place_id}.jpg`}  
                alt={`Place ${place.id}`} 
                className="place-image"
              />
            </a>
            

            <div className="place-info">
              <span className="place-category">
                {place.tags?.map((tag, index) => (
                  <span key={index}>
                    <button className="tag-button">
                      {tag}{index !== place.tags.length - 1 ? ', ' : ''}
                    </button>
                  </span>
                )) || "ไม่ระบุ"}
              </span>
              
              <span>{place.name}{isNaN(place.rating) && place.rating == "NaN" ? "" : "⭐"+ place.rating}</span>
              {/* <span className="place-rating">⭐ {place.rating || "N/A"}</span> */}
              <button onClick={() => handleGoGoogleMap(place.place_id)} className="go-button">
                ดูสถานที่
              </button>
              <button onClick={() => handleAddPlace(place, navigate)} className="go-button">
              {/* <button onClick={() => handleAddPlace(place)} className="go-button"> */}
                เพิ่มไปยัง List to go
              </button>
            </div>

          </div>
        )) || <p>ไม่มีข้อมูลสถานที่</p>}  {/* แสดงข้อความถ้าไม่มีข้อมูล */}
      </div>

      {loading && <p>กำลังโหลด...</p>}
      </section>
    </div>
  );
}

export default Homepage;