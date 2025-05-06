// Homepage.js[frontend]
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Pathmanagement"; // ใช้ AuthContext
import "./Homepage.css";
import handleAddPlace from "./handleAddPlace";
import getDateInfo from "./getDateInfo";
import getPreference from "./getPreference";
import { getUserLocation } from "./getLocation";
import { haversine } from "./haversine";

function Homepage() {
  const [query, setQuery] = useState(""); // เก็บค่าค้นหา
  const { isLoggedIn, setIsLoggedIn, username, setUsername } = useAuth(); // ดึงข้อมูลจาก context
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const [places, setPlaces] = useState([]); // Store places
  const [page, setPage] = useState(1); // Track current page
  const [loading, setLoading] = useState(false); // Track loading state
  const [hasMore, setHasMore] = useState(true); // Check if more data is available

  const [recommendedPlaces, setRecommendedPlaces] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [popularPreferences, setPopularPreferences] = useState([]);

  const [location, setLocation] = useState(null);

  const [dateInfo, setDateInfo] = useState(getDateInfo());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateInfo(getDateInfo());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const { dayName, time } = dateInfo;

  useEffect(() => {
    const locationData = getUserLocation();

    setLocation(locationData);
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/cookies-check", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          setIsLoggedIn(false);
          return;
        }
        const responseText = await response.text();
        let userdata;
        try {
          userdata = JSON.parse(responseText);
        } catch (jsonError) {
          console.error("Invalid JSON response:", jsonError);
          setIsLoggedIn(false);
          return;
        }
        setIsLoggedIn(true);
        setUsername(userdata.username);
        setUserId(userdata.user_id);
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/get-cookie", {
      method: "GET",
      credentials: "include", // อนุญาตให้ส่ง cookies
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unauthorized");
        }
        return response.json();
      })
      .then((cookies) => {
        // console.log("User cookies:", cookies);
        setIsLoggedIn(true); // ถ้ามีคุกกี้ แสดงว่าผู้ใช้ล็อกอินแล้ว
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsLoggedIn(false); // ถ้าไม่ได้ล็อกอิน ซ่อน UI
      });
  }, []);

  const handleClickPlace = async (placeId) => {
    if (userId) {
      try {
        await getPreference(userId, placeId);
      } catch (error) {
        console.error("Error sending preference:", error);
      }
    }
    navigate(`/placereview/${placeId}`);
  };

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/searchresult?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleGoGoogleMap = (userId, placeId) => {
    // Construct the Google Maps URL with the latitude and longitude
    const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`; // You can adjust the zoom level (z) as needed
    // Open the URL in a new tab
    window.open(googleMapsUrl, "_blank");
  };

  // แนะนำสำหรับคุณ
  const fetchRecommendedPlaces = async (pageNumber = 1) => {
    // console.log("Fetching recommendations for page:", pageNumber);
    try {
      setIsFetching(true);
      const response = await fetch(
        `http://localhost:5000/api/recommendations?limit=6&lat=${location.lat}&lng=${location.lng}&user_id=${userId}&page=${pageNumber}`
      );
      if (!response.ok) throw new Error("Failed to fetch recommendations");

      const data = await response.json();

      const enrichedData = data.data.map((place) => {
        const distance = haversine(
          parseFloat(location.lat),
          parseFloat(location.lng),
          parseFloat(place.lat),
          parseFloat(place.lng)
        );
  
        return {
          ...place,
          distance: distance.toFixed(2), // ตัดทศนิยมให้สวย ๆ
        };
      });
  
      if (pageNumber === 1) {
        setRecommendedPlaces(enrichedData);
      } else {
        setRecommendedPlaces((prevPlaces) => [...prevPlaces, ...enrichedData]);
      }
  
      setHasMorePages(data.total > pageNumber * 6);
      
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setFetchError(error.message);
    } finally {
      setIsFetching(false);
    }
  };

  // ใช้ useEffect เพื่อดึงข้อมูลเมื่อ userId เปลี่ยนแปลง
  useEffect(() => {
    if (userId) {
      setCurrentPage(1);
      fetchRecommendedPlaces(1);
    }
  }, [userId]);

  // โหลดข้อมูลหน้าถัดไป
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchRecommendedPlaces(nextPage);
  };

  // ยอดนิยม
  const fetchTopPreferences = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/popular-places");
      const data = await response.json();
      // console.log("Here's top prefer\n", data);
      setPopularPreferences(data.slice(0, 9)); // แสดง 10 อันดับแรก
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  useEffect(() => {
    fetchTopPreferences();
  }, []);

  // คุณอาจชอบ
  const fetchRandomPlaces = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/getrandomplaces?page=${page}&limit=3`
      ); // Include dayName in query

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();
      // console.log("คุณอาจชอบ", data);

      // console.log(data.places[0].business_hour[0].business_hour); // ตรวจสอบ business_hour ของสถานที่แรก
      // console.log(data.places[0].tag[0].tag_name); // ตรวจสอบ business_hour ของสถานที่แรก

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
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100 &&
        !loading
      ) {
        fetchRandomPlaces();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  useEffect(() => {
    fetchRandomPlaces();
  }, [dayName]); // Fetch places based on the current day

  return (
    <div className="homepage">
      <header className="navbar">
        <Link to="/">
          <img src="/PM1.1.png" alt="Logo" className="logo" />
        </Link>
        <nav className="navbar-nav">
          <Link to="/listtogo">LIST TO GO</Link>
          <Link to="/planner">PLANNER</Link>
          <Link to="/aboutme">ABOUT US</Link>
        </nav>
        {isLoggedIn ? (
          <Link to="/profile" className="nav-profile">
            {username}
          </Link>
        ) : (
          <Link to="/login" className="login-btn">
            เข้าสู่ระบบ
          </Link>
        )}
      </header>

      <section className="search-bar">
        <h2>ค้นหากิจกรรมที่อยากทำ</h2>
        <div className="search-tags">
          {["กินและดื่ม", "ร้านและห้าง", "เที่ยวบันเทิง"].map((tag, index) => (
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
      <h1>
        {userId}
        {dayName} {time}
      </h1>

      <div>
        {isLoggedIn && (
          <>
            <h2>แนะนำสำหรับคุณ</h2>
            <section className="recommended">
              <div className="place-grid">
                {recommendedPlaces.length === 0 ? (
                  <p>เริ่มต้นค้นหาสถานที่เพื่อรับคำแนะนำ</p>
                ) : (
                  recommendedPlaces.map((place, index) => {
                    const placeTags =
                      Array.isArray(place.tag) && place.tag !== null
                        ? place.tag
                        : [];
                    const todayBusinessHours = place.business_hour
                      ? place.business_hour.find(
                          (bh) =>
                            bh.day ===
                            new Date().toLocaleDateString("en-EN", {
                              weekday: "long",
                            })
                        )
                      : null;
                    const businessHoursText = todayBusinessHours
                      ? todayBusinessHours.business_hour
                      : "";

                    return (
                      <div key={index} className="place-card">
                        {/* Google Maps Link */}
                        {/* <a
                          href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        > */}
                        <img
                        src={`/place_images/${place.place_id}.jpg`}
                        alt={`Place ${place.name}`}
                        className="place-image"
                        onClick={() => handleClickPlace(place.place_id)} // ✅ แก้ตรงนี้
                        style={{ cursor: "pointer" }}
                        />
                        {/* </a> */}

                        <div className="place-info">
                          {/* แสดง Tags */}
                          <span className="place-category">
                            {placeTags.length > 0
                              ? placeTags.map((tag, index) => (
                                  <span key={index}>
                                    <button className="tag-button">
                                      {tag.tag_name}
                                      {index !== placeTags.length - 1
                                        ? ", "
                                        : ""}
                                    </button>
                                  </span>
                                ))
                              : "ไม่ระบุ"}
                          </span>

                          {/* แสดงเวลาเปิด-ปิด */}
                          <strong>
                            {businessHoursText && businessHoursText !== "NaN"
                              ? businessHoursText
                              : ""}
                              ({place.distance} กม.)
                          </strong>
                          <br />

                          {/* แสดงชื่อสถานที่ + เรตติ้ง */}
                          <span>
                            {place.name}
                            {!isNaN(place.rating) && place.rating !== "NaN"
                              ? ` ⭐${place.rating}`
                              : ""}
                          </span>

                          {/* ปุ่มดูสถานที่ */}

                          <button
                            onClick={() =>
                              handleGoGoogleMap(userId, place.place_id)
                            }
                            className="go-button"
                          >
                            ดูสถานที่
                          </button>

                          {/* ปุ่มเพิ่มไปยัง List to go */}
                          <button
                            onClick={() => handleAddPlace(place, navigate)}
                            className="go-button"
                          >
                            เพิ่มไปยัง List to go
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {/* ปุ่มโหลดข้อมูลหน้าถัดไป */}
              {hasMorePages && (
                <div className="set-center">
                  {hasMorePages && (
                    <button onClick={handleLoadMore} disabled={isFetching}>
                      {isFetching ? "กำลังโหลด..." : "เพิ่มเติม"}
                    </button>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <div>
        <h2>ยอดนิยม</h2>
        <section className="recommended">
          <div className="place-grid">
            {popularPreferences.length > 0 ? (
              popularPreferences.map((place, index) => {
                // จัดกลุ่ม Tags สำหรับแต่ละสถานที่
                const tags = place.tag
                  ? place.tag.map((tag) => tag.tag_name)
                  : [];

                // กรอง business hours ตามวันที่ตรงกับ dayName
                const businessHourForDay = place.business_hour
                  ? place.business_hour.find((bh) => bh.day === dayName)
                  : null;

                // แสดง business hour หากมีข้อมูลและตรงกับ dayName
                const businessHours = businessHourForDay
                  ? businessHourForDay.business_hour
                  : "ปิดทำการ";

                return (
                  <div key={index} className="place-card">
                    {/* <a
                      href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    > */} 
                      <img
                        src={`/place_images/${place.place_id}.jpg`}
                        alt={`Place ${place.name}`}
                        className="place-image"
                        onClick={() => handleClickPlace(place.place_id)} // ✅ แก้ตรงนี้
                        style={{ cursor: "pointer" }}
                      />
                    {/* </a> */}

                    <div className="place-info">
                      <span className="place-category">
                        {/* แสดง Tags */}
                        {tags.length > 0
                          ? tags.map((tag, index) => (
                              // <div key={index} className="place-card">
                              <span key={index}>
                                <button className="tag-button">
                                  {tag}
                                  {index !== tags.length - 1 ? ", " : ""}
                                </button>
                              </span>
                              // </div>
                            ))
                          : "ไม่ระบุ"}
                      </span>

                      {/* แสดง Business Hour เฉพาะวันที่ตรงกัน */}
                      <strong>
                        {businessHours &&
                        businessHours !== "NaN" &&
                        businessHours !== "ปิดทำการ"
                          ? businessHours
                          : ""}
                      </strong>
                      <br />

                      <span>
                        {place.name}
                        {isNaN(place.rating) && place.rating === "NaN"
                          ? ""
                          : "⭐" + place.rating}
                      </span>

                      {/* ปุ่มดูสถานที่ */}
                      <button
                        onClick={() =>
                          handleGoGoogleMap(userId, place.place_id)
                        }
                        className="go-button"
                      >
                        ดูสถานที่
                      </button>

                      {/* ปุ่มเพิ่มไปยัง List to go */}
                      <button
                        onClick={() => handleAddPlace(place, navigate)}
                        className="go-button"
                      >
                        เพิ่มไปยัง List to go
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>กำลังอัพเดท...</p> // ข้อความเมื่อไม่มีข้อมูล
            )}
          </div>
        </section>
      </div>

      <div>
        <h2>คุณอาจชอบ</h2>
        <section className="recommended">
          <div className="place-grid">
            {places?.map((place, index) => (
              <div key={index} className="place-card">
                {/* <a
                  href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                > */}
                  <img
                    src={`/place_images/${place.place_id}.jpg`}
                    alt={`Place ${place.name}`}
                    className="place-image"
                    onClick={() => handleClickPlace(place.place_id)} // ✅ แก้ตรงนี้
                    style={{ cursor: "pointer" }}
                  />
                {/* </a> */}

                <div className="place-info">
                  <span className="place-category">
                    {/* แสดง Tags */}
                    {place.tag?.map((tag, index) => (
                      <span key={index}>
                        <button className="tag-button">
                          {tag.tag_name}
                          {index !== place.tag.length - 1 ? ", " : ""}
                        </button>
                      </span>
                    )) || "ไม่ระบุ"}
                  </span>

                  <strong>
                    {/* แสดง business_hour */}
                    {place.business_hour?.[0]?.business_hour &&
                    place.business_hour[0].business_hour !== "NaN" &&
                    place.business_hour[0].business_hour !== "ปิดทำการ"
                      ? place.business_hour[0].business_hour
                      : ""}
                  </strong>
                  <br />
                  <span>
                    {place.name}
                    {isNaN(place.rating) || place.rating === "NaN"
                      ? ""
                      : "⭐" + place.rating}
                  </span>

                  <button
                    onClick={() => handleGoGoogleMap(userId, place.place_id)}
                    className="go-button"
                  >
                    ดูสถานที่
                  </button>
                  <button
                    onClick={() => handleAddPlace(place, navigate)}
                    className="go-button"
                  >
                    เพิ่มไปยัง List to go
                  </button>
                </div>
              </div>
            )) || <p>ไม่มีข้อมูลสถานที่</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Homepage;